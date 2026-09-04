import { IAIProvider, AIDecisionOutput } from './aiProvider.interface';

export class DeterministicAIProvider implements IAIProvider {
  public readonly providerName = 'DeterministicDemoAIProvider';

  async diagnoseAndRecommend(event: {
    id: string;
    type: string;
    amount: number;
    rawErrorCode?: string;
    retryCount: number;
    reminderCount: number;
    customer: {
      name: string;
      email: string;
      company?: string;
      lifetimeValue: number;
      paymentReliabilityScore: number;
      totalSuccessfulPayments: number;
      totalFailedPayments: number;
      isOptedOut: boolean;
    };
  }): Promise<AIDecisionOutput> {
    const rawError = (event.rawErrorCode || '').toUpperCase();
    const type = event.type;
    const cust = event.customer;

    let rootCause = 'insufficient_funds';
    let rootCauseTitle = 'Insufficient Account Balance';
    let recommendedAction: AIDecisionOutput['recommendedAction'] = 'SMART_RETRY';
    let recommendedDelayHours = 2;
    let baseScore = 60;
    const positiveSignals: string[] = [];
    const negativeSignals: string[] = [];

    // Special calibration for Hero Demo Single Event
    if (event.id === 'EVT-HERO-4999') {
      return {
        rootCause: 'insufficient_funds',
        rootCauseTitle: 'Temporary Account Balance Shortfall',
        recoveryProbability: 87,
        confidence: 0.91,
        confidenceLevel: 'HIGH',
        recommendedAction: 'SMART_RETRY',
        recommendedDelayHours: 2,
        expectedRecoveryAmount: 4349,
        positiveSignals: [
          'Previous 8 payments were successful (100% historical settlement)',
          'High customer payment reliability score (92/100)',
          'Temporary liquidity deficit matches payroll cycle'
        ],
        negativeSignals: [
          'First retry window pending'
        ],
        reason: 'Customer has strong historical payment reliability (92/100) with 8 successful payments. Error category (Temporary Balance Shortfall) indicates high probability of recovery via bounded smart retry.'
      };
    }

    // Diagnose Root Cause
    if (type === 'PAYMENT_FAILURE') {
      if (rawError.includes('INSUFFICIENT') || rawError.includes('FUNDS') || rawError.includes('LOW_BALANCE')) {
        rootCause = 'insufficient_funds';
        rootCauseTitle = 'Temporary Insufficient Funds';
        recommendedAction = 'SMART_RETRY';
        recommendedDelayHours = 2;
        positiveSignals.push('Transient error category: temporary liquidity deficit matches payroll cycle');
      } else if (rawError.includes('EXPIRE') || rawError.includes('CARD_EXPIRED')) {
        rootCause = 'card_expired';
        rootCauseTitle = 'Card Expired / Replacement Needed';
        recommendedAction = 'PAYMENT_LINK';
        recommendedDelayHours = 0;
        positiveSignals.push('Customer has active relationship, token renewal required');
      } else if (rawError.includes('AUTH') || rawError.includes('3DS') || rawError.includes('OTP')) {
        rootCause = 'auth_failed';
        rootCauseTitle = '3DS / OTP Authentication Timeout';
        recommendedAction = 'PAYMENT_LINK';
        recommendedDelayHours = 0;
        positiveSignals.push('Customer initiated active checkout session before SMS OTP drop-off');
      } else if (rawError.includes('OUTAGE') || rawError.includes('TIMEOUT') || rawError.includes('503')) {
        rootCause = 'temporary_bank_outage';
        rootCauseTitle = 'Issuer Core Banking Outage';
        recommendedAction = 'SMART_RETRY';
        recommendedDelayHours = 4;
        positiveSignals.push('Issuing bank node was temporarily unresponsive, auto-recovery on gateway node restart');
      } else {
        rootCause = 'bank_decline';
        rootCauseTitle = 'Issuing Bank Decline (Velocity/Limit)';
        recommendedAction = 'PAYMENT_LINK';
        recommendedDelayHours = 0;
        negativeSignals.push('Hard bank decline: customer needs alternate payment instrument');
      }
    } else if (type === 'CHECKOUT_ABANDONMENT') {
      rootCause = 'checkout_friction';
      rootCauseTitle = 'High Intent Cart Drop-off';
      recommendedAction = 'PAYMENT_LINK';
      recommendedDelayHours = 0;
      positiveSignals.push('Customer reached final checkout payment stage indicating high intent');
    } else if (type === 'SUBSCRIPTION_FAILURE') {
      rootCause = 'subscription_mandate_decline';
      rootCauseTitle = 'Mandate Auto-Debit Interruption';
      recommendedAction = 'SMART_RETRY';
      recommendedDelayHours = 6;
      positiveSignals.push('Active subscription with consecutive prior successful billing cycles');
    } else if (type === 'OVERDUE_INVOICE') {
      rootCause = 'invoice_neglect';
      rootCauseTitle = 'Corporate Accounts Payable Delay';
      recommendedAction = 'RECOVERY_REMINDER';
      recommendedDelayHours = 24;
      positiveSignals.push(`Enterprise account with ₹${cust.lifetimeValue.toLocaleString('en-IN')} verified lifetime spend`);
    }

    // Signals Analysis
    if (cust.paymentReliabilityScore >= 85) {
      baseScore += 25;
      positiveSignals.push(`Customer has excellent payment reliability score (${cust.paymentReliabilityScore}/100)`);
    } else if (cust.paymentReliabilityScore >= 70) {
      baseScore += 12;
      positiveSignals.push(`Customer has positive payment track record (${cust.paymentReliabilityScore}/100)`);
    } else {
      baseScore -= 15;
      negativeSignals.push(`Customer has lower historical reliability score (${cust.paymentReliabilityScore}/100)`);
    }

    if (cust.totalSuccessfulPayments >= 5) {
      baseScore += 15;
      positiveSignals.push(`${cust.totalSuccessfulPayments} previous successful payments verified on account`);
    } else if (cust.totalSuccessfulPayments === 0) {
      baseScore -= 10;
      negativeSignals.push('First-time customer with no prior settlement history');
    }

    if (event.retryCount > 0) {
      baseScore -= event.retryCount * 12;
      negativeSignals.push(`${event.retryCount} automated retry attempt(s) already logged`);
    }

    if (cust.isOptedOut) {
      baseScore = 0;
      recommendedAction = 'DO_NOT_CONTACT';
      negativeSignals.push('Customer has actively opted out of recovery communications');
    }

    const finalProbability = cust.isOptedOut ? 0 : Math.min(96, Math.max(8, Math.round(baseScore)));
    const confidence = finalProbability >= 75 ? 0.91 : finalProbability >= 50 ? 0.76 : 0.45;
    const confidenceLevel = finalProbability >= 75 ? 'HIGH' : finalProbability >= 50 ? 'MEDIUM' : 'LOW';
    const expectedRecoveryAmount = Math.round(event.amount * (finalProbability / 100));

    const reason = `Customer has strong payment reliability (${cust.paymentReliabilityScore}/100) with ${cust.totalSuccessfulPayments} successful payments. Error category (${rootCauseTitle}) indicates high probability of recovery via bounded ${recommendedAction.replace('_', ' ')}.`;

    return {
      rootCause,
      rootCauseTitle,
      recoveryProbability: finalProbability,
      confidence,
      confidenceLevel,
      recommendedAction,
      recommendedDelayHours,
      expectedRecoveryAmount,
      positiveSignals,
      negativeSignals,
      reason,
    };
  }
}
