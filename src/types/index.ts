// Core Domain Types for RecoverAI

export type RevenueRiskType = 
  | 'PAYMENT_FAILURE'
  | 'CHECKOUT_ABANDONMENT'
  | 'SUBSCRIPTION_FAILURE'
  | 'OVERDUE_INVOICE';

export type EventStatus =
  | 'AT_RISK'
  | 'ANALYZING'
  | 'RECOMMENDED'
  | 'AWAITING_APPROVAL'
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'RECOVERED'
  | 'PARTIALLY_RECOVERED'
  | 'FAILED'
  | 'MANUAL_REVIEW'
  | 'STOPPED'
  | 'EXPIRED';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type InterventionType =
  | 'SMART_RETRY'
  | 'PAYMENT_LINK'
  | 'RECOVERY_REMINDER'
  | 'PERSONALIZED_DISCOUNT_LINK'
  | 'FINANCE_ESCALATION'
  | 'MANUAL_REVIEW'
  | 'DO_NOT_CONTACT';

export type ActorType = 'AI_AGENT' | 'MERCHANT' | 'SYSTEM' | 'POLICY_ENGINE';

export type PaymentMethod = 'UPI' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'NETBANKING' | 'NACH' | 'WALLET';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  lifetimeValue: number;
  paymentReliabilityScore: number; // 0 to 100
  totalSuccessfulPayments: number;
  totalFailedPayments: number;
  isOptedOut: boolean;
  notes?: string;
}

export interface ScoreFactor {
  impact: 'POSITIVE' | 'NEGATIVE';
  description: string;
  weight: number;
}

export interface AIRootCauseDiagnosis {
  category: 
    | 'INSUFFICIENT_FUNDS'
    | 'BANK_DECLINE'
    | 'CARD_EXPIRED'
    | 'AUTH_FAILED'
    | 'OTP_TIMEOUT'
    | 'TEMPORARY_BANK_OUTAGE'
    | 'NETWORK_TIMEOUT'
    | 'CHECKOUT_FRICTION'
    | 'INVOICE_NEGLECT'
    | 'DISPUTE_SUSPECTED'
    | 'SUSPECTED_RISK'
    | 'UNKNOWN';
  title: string;
  explanation: string;
  suggestedAction: InterventionType;
  delayHours?: number;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  stage: number; // 0: Detect, 1: AI Analyze, 2: Policy/Approval, 3: Action, 4: Result/Stop
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'BLOCKED';
  actor: string;
}

export interface RevenueRiskEvent {
  id: string;
  type: RevenueRiskType;
  customerId: string;
  customer: Customer;
  amount: number; // in INR
  currency: string; // 'INR'
  status: EventStatus;
  riskLevel: RiskLevel;
  
  // Specific Context
  paymentId?: string;
  sessionId?: string;
  subscriptionId?: string;
  invoiceId?: string;
  planName?: string;
  daysOverdue?: number;
  checkoutStep?: string;
  paymentMethod?: PaymentMethod;
  bankCode?: string;
  rawErrorCode?: string;
  
  // AI Agent Analysis
  aiDiagnosis?: AIRootCauseDiagnosis;
  recoveryProbability: number; // 0 - 100 %
  predictedRecoverableAmount: number;
  scoreFactors: ScoreFactor[];
  recommendedIntervention: InterventionType;
  interventionReasoning: string;
  
  // Workflow & Bounded Execution
  retryCount: number;
  maxRetriesAllowed: number;
  reminderCount: number;
  maxRemindersAllowed: number;
  lastAttemptAt?: string;
  nextScheduledAttemptAt?: string;
  escalationLevel: number; // 0 to 4
  
  // Financial Outcome
  recoveredAmount: number;
  recoveredAt?: string;
  recoveryMethodUsed?: InterventionType;
  paymentLinkId?: string;
  
  // Timeline & Audit
  timeline: TimelineEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface RecoveryPolicy {
  maxPaymentRetries: number;
  maxSubscriptionRetries: number;
  maxReminders: number;
  minRetryIntervalHours: number;
  minReminderIntervalHours: number;
  maxAutomatedRecoveryAmount: number; // In INR, above which merchant approval is required
  autoApproveConfidenceScore: number; // min score to auto-approve low-risk retries
  stopIfPaymentSuccess: boolean;
  stopIfInvoicePaid: boolean;
  stopIfSubscriptionRecovered: boolean;
  stopIfCustomerOptout: boolean;
  stopIfMaxAttemptsReached: boolean;
  stopIfManualReviewRequired: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string; // e.g. "21:00"
  quietHoursEnd: string; // e.g. "08:00"
}

export interface RecoveryCampaign {
  id: string;
  name: string;
  createdAt: string;
  status: 'DRAFT' | 'ANALYZED' | 'AWAITING_APPROVAL' | 'RUNNING' | 'COMPLETED' | 'STOPPED';
  filterType: RevenueRiskType | 'ALL';
  totalCases: number;
  totalAtRisk: number;
  predictedRecoverable: number;
  expectedRecoveryRate: number;
  actualRecovered: number;
  actualRecoveryRate: number;
  
  // Triage Breakdown
  triage: {
    retries: number;
    paymentLinks: number;
    reminders: number;
    manualReviews: number;
    doNotContact: number;
  };
  
  // Execution Results
  results?: {
    successfulRecoveries: number;
    failedRecoveries: number;
    pending: number;
    manualReviews: number;
    stopped: number;
    byIntervention: {
      retries: { count: number; recovered: number };
      paymentLinks: { count: number; recovered: number };
      reminders: { count: number; recovered: number };
      manualReviews: { count: number; recovered: number };
      stopped: { count: number; recovered: number };
    };
  };
  processedCount: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  actorType: ActorType;
  eventId?: string;
  campaignId?: string;
  action: string;
  reason: string;
  previousState?: string;
  newState?: string;
  policyResult: 'PASSED' | 'BLOCKED' | 'REQUIRES_APPROVAL' | 'N/A';
  toolCalled?: string;
  toolResult?: string;
  idempotencyKey?: string;
  amount?: number;
  recoveredAmount?: number;
}

export interface WebhookEventPayload {
  event: 
    | 'payment.failed'
    | 'payment.captured'
    | 'payment.authorized'
    | 'subscription.charged'
    | 'subscription.failed'
    | 'invoice.overdue'
    | 'invoice.paid'
    | 'checkout.abandoned';
  data: Record<string, unknown>;
  // Optional customer data for simulated webhooks
  customerName?: string;
  customerEmail?: string;
  failureReason?: string;
}

export interface ProviderConfig {
  activeProvider: 'MOCK' | 'RAZORPAY_TEST';
  razorpayKeyId?: string;
  razorpayKeySecret?: string;
  mockSimulatedLatencyMs: number;
  mockSimulatedFailureRate: number; // e.g. 0.1
}

export interface AnalyticsSummary {
  totalRevenueAtRisk: number;
  totalPredictedRecoverable: number;
  totalActualRecovered: number;
  totalUnrecovered: number;
  overallRecoveryRate: number;
  predictionAccuracy: number;
  averageRecoveryTimeMinutes: number;
  activeCampaignsCount: number;
  pendingApprovalsCount: number;
  totalCasesProcessed: number;
  totalSuccessfulRecoveries: number;
  totalFailedRecoveries: number;
  totalManualReviews: number;
  totalStoppedCases: number;
}
