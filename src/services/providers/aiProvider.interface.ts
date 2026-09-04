export interface AIDecisionOutput {
  rootCause: string;
  rootCauseTitle: string;
  recoveryProbability: number; // 0 - 100
  confidence: number; // 0.0 - 1.0 (e.g. 0.91)
  confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  recommendedAction: 'SMART_RETRY' | 'PAYMENT_LINK' | 'RECOVERY_REMINDER' | 'PERSONALIZED_DISCOUNT_LINK' | 'FINANCE_ESCALATION' | 'MANUAL_REVIEW' | 'DO_NOT_CONTACT';
  recommendedDelayHours: number;
  expectedRecoveryAmount: number;
  positiveSignals: string[];
  negativeSignals: string[];
  reason: string;
}

export interface IAIProvider {
  readonly providerName: string;
  diagnoseAndRecommend(event: {
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
  }): Promise<AIDecisionOutput>;
}

