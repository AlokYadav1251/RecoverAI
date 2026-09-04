import { 
  RevenueRiskEvent, 
  Customer, 
  AIRootCauseDiagnosis, 
  InterventionType, 
  RiskLevel, 
  ScoreFactor 
} from '@/types';
import { formatINR } from './utils';

export class AgentEngine {
  /**
   * Diagnoses root cause for any revenue-risk event
   */
  static analyzeRootCause(event: RevenueRiskEvent): AIRootCauseDiagnosis {
    const rawError = (event.rawErrorCode || '').toUpperCase();
    const type = event.type;

    if (type === 'PAYMENT_FAILURE') {
      if (rawError.includes('INSUFFICIENT') || rawError.includes('FUNDS') || rawError.includes('LOW_BALANCE')) {
        return {
          category: 'INSUFFICIENT_FUNDS',
          title: 'Insufficient Account Balance',
          explanation: 'Customer bank account had temporary insufficient balance at moment of debit.',
          suggestedAction: 'SMART_RETRY',
          delayHours: 2,
          confidence: 'HIGH',
        };
      }
      if (rawError.includes('EXPIRE') || rawError.includes('CARD_EXPIRED')) {
        return {
          category: 'CARD_EXPIRED',
          title: 'Card Expired / Card Replaced',
          explanation: 'Stored card token expired. Customer needs payment link or card update prompt.',
          suggestedAction: 'PAYMENT_LINK',
          confidence: 'HIGH',
        };
      }
      if (rawError.includes('AUTH') || rawError.includes('3DS') || rawError.includes('OTP')) {
        return {
          category: 'AUTH_FAILED',
          title: '3DS / OTP Authentication Timeout',
          explanation: 'Customer did not enter the bank OTP in time or SMS delivery was delayed.',
          suggestedAction: 'PAYMENT_LINK',
          confidence: 'HIGH',
        };
      }
      if (rawError.includes('OUTAGE') || rawError.includes('TIMEOUT') || rawError.includes('503')) {
        return {
          category: 'TEMPORARY_BANK_OUTAGE',
          title: 'Issuer Core Banking Outage',
          explanation: 'Issuing bank node was temporarily unresponsive. Retry after gateway recovery.',
          suggestedAction: 'SMART_RETRY',
          delayHours: 4,
          confidence: 'HIGH',
        };
      }
      return {
        category: 'BANK_DECLINE',
        title: 'Issuing Bank Decline (Risk/Limit)',
        explanation: 'Card/UPI issuer declined debit due to daily velocity limits or fraud heuristic.',
        suggestedAction: 'PAYMENT_LINK',
        confidence: 'MEDIUM',
      };
    }

    if (type === 'CHECKOUT_ABANDONMENT') {
      return {
        category: 'CHECKOUT_FRICTION',
        title: 'High Intent Checkout Drop-off',
        explanation: `Customer reached ${event.checkoutStep || 'payment screen'} with ₹${event.amount.toLocaleString('en-IN')} in cart but did not complete final authorization.`,
        suggestedAction: 'PAYMENT_LINK',
        confidence: 'HIGH',
      };
    }

    if (type === 'SUBSCRIPTION_FAILURE') {
      return {
        category: 'TEMPORARY_BANK_OUTAGE',
        title: 'Mandate Auto-Debit Decline',
        explanation: 'Recurring e-mandate presentation failed. Scheduled retry recommended before customer notice.',
        suggestedAction: 'SMART_RETRY',
        delayHours: 6,
        confidence: 'HIGH',
      };
    }

    if (type === 'OVERDUE_INVOICE') {
      return {
        category: 'INVOICE_NEGLECT',
        title: 'Corporate Accounts Payable Delay',
        explanation: `Invoice ${event.invoiceId || ''} is ${event.daysOverdue || 0} days past due date. Requires structured commercial reminder.`,
        suggestedAction: 'RECOVERY_REMINDER',
        confidence: 'MEDIUM',
      };
    }

    return {
      category: 'UNKNOWN',
      title: 'Uncategorized Revenue Risk',
      explanation: 'General revenue interruption requiring adaptive recovery.',
      suggestedAction: 'MANUAL_REVIEW',
      confidence: 'LOW',
    };
  }

  /**
   * Deterministic yet explainable AI probability scoring model
   */
  static calculateRecoveryProbability(
    event: RevenueRiskEvent, 
    customer: Customer
  ): { score: number; confidence: 'HIGH' | 'MEDIUM' | 'LOW'; factors: ScoreFactor[] } {
    let baseScore = 60;
    const factors: ScoreFactor[] = [];

    // 1. Customer payment history & reliability
    if (customer.paymentReliabilityScore >= 85) {
      const boost = 25;
      baseScore += boost;
      factors.push({
        impact: 'POSITIVE',
        description: `Customer has excellent payment reliability score (${customer.paymentReliabilityScore}/100)`,
        weight: boost,
      });
    } else if (customer.paymentReliabilityScore >= 70) {
      const boost = 12;
      baseScore += boost;
      factors.push({
        impact: 'POSITIVE',
        description: `Customer has positive payment track record (${customer.paymentReliabilityScore}/100)`,
        weight: boost,
      });
    } else {
      const penalty = -15;
      baseScore += penalty;
      factors.push({
        impact: 'NEGATIVE',
        description: `Customer has lower payment reliability score (${customer.paymentReliabilityScore}/100)`,
        weight: penalty,
      });
    }

    // 2. Successful historical transactions count
    if (customer.totalSuccessfulPayments >= 5) {
      const boost = 15;
      baseScore += boost;
      factors.push({
        impact: 'POSITIVE',
        description: `${customer.totalSuccessfulPayments} previous successful payments verified on account`,
        weight: boost,
      });
    } else if (customer.totalSuccessfulPayments === 0) {
      const penalty = -10;
      baseScore += penalty;
      factors.push({
        impact: 'NEGATIVE',
        description: 'First-time customer with no prior successful payment history',
        weight: penalty,
      });
    }

    // 3. Event Type & Failure Diagnosis
    const diagnosis = event.aiDiagnosis || this.analyzeRootCause(event);
    if (diagnosis.category === 'INSUFFICIENT_FUNDS' || diagnosis.category === 'TEMPORARY_BANK_OUTAGE') {
      const boost = 15;
      baseScore += boost;
      factors.push({
        impact: 'POSITIVE',
        description: `Transient error category (${diagnosis.title}): High recovery via smart retry`,
        weight: boost,
      });
    } else if (diagnosis.category === 'CHECKOUT_FRICTION') {
      const boost = 10;
      baseScore += boost;
      factors.push({
        impact: 'POSITIVE',
        description: 'Customer reached final checkout stage indicating active purchase intent',
        weight: boost,
      });
    } else if (diagnosis.category === 'BANK_DECLINE') {
      const penalty = -10;
      baseScore += penalty;
      factors.push({
        impact: 'NEGATIVE',
        description: 'Hard bank decline may require customer to choose an alternate payment instrument',
        weight: penalty,
      });
    }

    // 4. Retry / Reminder Penalties
    if (event.retryCount > 0) {
      const penalty = -(event.retryCount * 12);
      baseScore += penalty;
      factors.push({
        impact: 'NEGATIVE',
        description: `${event.retryCount} automated retry attempt(s) already attempted without settlement`,
        weight: penalty,
      });
    }

    if (event.reminderCount > 1) {
      const penalty = -(event.reminderCount * 8);
      baseScore += penalty;
      factors.push({
        impact: 'NEGATIVE',
        description: `${event.reminderCount} reminders dispatched without action`,
        weight: penalty,
      });
    }

    // 5. Customer Opt-Out Safety Check
    if (customer.isOptedOut) {
      baseScore = 0;
      factors.push({
        impact: 'NEGATIVE',
        description: 'Customer has actively opted out of recovery contact (Policy: Stop all actions)',
        weight: -100,
      });
    }

    // Clamp score between 5% and 96%
    const finalScore = customer.isOptedOut ? 0 : Math.min(96, Math.max(8, Math.round(baseScore)));
    const confidence = finalScore >= 75 ? 'HIGH' : finalScore >= 50 ? 'MEDIUM' : 'LOW';

    return {
      score: finalScore,
      confidence,
      factors,
    };
  }

  /**
   * Determines strategy matrix and risk level
   */
  static recommendIntervention(
    event: RevenueRiskEvent,
    diagnosis: AIRootCauseDiagnosis,
    probScore: number
  ): { action: InterventionType; reason: string; riskLevel: RiskLevel } {
    if (event.customer.isOptedOut) {
      return {
        action: 'DO_NOT_CONTACT',
        reason: 'Customer is opted out of recovery communications.',
        riskLevel: 'HIGH',
      };
    }

    if (event.amount > 50000) {
      return {
        action: event.type === 'OVERDUE_INVOICE' ? 'RECOVERY_REMINDER' : 'PAYMENT_LINK',
        reason: `High value transaction (${formatINR(event.amount)}) flagged for merchant review/approval.`,
        riskLevel: 'HIGH',
      };
    }

    if (probScore < 35) {
      return {
        action: 'MANUAL_REVIEW',
        reason: `Low estimated recovery probability (${probScore}%). Merchant review recommended before automated action.`,
        riskLevel: 'HIGH',
      };
    }

    switch (diagnosis.category) {
      case 'INSUFFICIENT_FUNDS':
      case 'TEMPORARY_BANK_OUTAGE':
      case 'NETWORK_TIMEOUT':
        return {
          action: 'SMART_RETRY',
          reason: `Schedule automated smart retry after ${diagnosis.delayHours || 2} hours to allow bank clearance.`,
          riskLevel: 'LOW',
        };

      case 'CARD_EXPIRED':
      case 'AUTH_FAILED':
      case 'BANK_DECLINE':
      case 'CHECKOUT_FRICTION':
        return {
          action: 'PAYMENT_LINK',
          reason: 'Send 1-click Razorpay payment link with multiple payment options (UPI, Netbanking, Cards).',
          riskLevel: 'MEDIUM',
        };

      case 'INVOICE_NEGLECT':
        return {
          action: 'RECOVERY_REMINDER',
          reason: 'Send polite B2B payment link reminder with 48h automated escalation ladder.',
          riskLevel: event.amount > 100000 ? 'HIGH' : 'MEDIUM',
        };

      default:
        return {
          action: 'MANUAL_REVIEW',
          reason: 'Uncommon failure mode requires manual triage.',
          riskLevel: 'MEDIUM',
        };
    }
  }

  /**
   * Generates tailored, empathetic recovery messaging
   */
  static generateRecoveryMessage(event: RevenueRiskEvent, channel: 'WHATSAPP' | 'SMS' | 'EMAIL'): string {
    const custName = event.customer.name.split(' ')[0];
    const amountStr = formatINR(event.amount);

    if (event.type === 'CHECKOUT_ABANDONMENT') {
      return `Hi ${custName}, we noticed you were about to complete your order of ${amountStr}. Your cart is reserved for the next 24 hours. Complete your purchase easily here: https://rzp.io/i/chk_${event.id.toLowerCase()}`;
    }

    if (event.type === 'SUBSCRIPTION_FAILURE') {
      return `Hi ${custName}, your subscription payment of ${amountStr} for ${event.planName || 'Plan'} could not be completed. Update your payment details to keep your access uninterrupted: https://rzp.io/i/sub_${event.id.toLowerCase()}`;
    }

    if (event.type === 'OVERDUE_INVOICE') {
      return `Dear ${custName}, this is a gentle reminder regarding Invoice ${event.invoiceId || 'INV-1042'} for ${amountStr} which is past its due date. View and settle online: https://rzp.io/i/inv_${event.id.toLowerCase()}`;
    }

    return `Hi ${custName}, your recent payment of ${amountStr} was unsuccessful due to a temporary bank issue. You can retry with 1-click here: https://rzp.io/i/pay_${event.id.toLowerCase()}`;
  }
}
