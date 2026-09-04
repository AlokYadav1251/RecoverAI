// =============================================================================
// DATABASE TYPES (Mapped to schema.sql)
// =============================================================================

export interface MerchantRecord {
  id: string;
  name: string;
  businessCategory: string;
  country: string;
  defaultCurrency: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserRecord {
  id: string;
  merchantId: string;
  email: string;
  fullName: string;
  role: 'MERCHANT_ADMIN' | 'OPERATOR' | 'VIEWER';
  createdAt: string;
  updatedAt: string;
}

export interface CustomerRecord {
  id: string;
  merchantId: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  lifetimeValue: number;
  paymentReliabilityScore: number;
  totalSuccessfulPayments: number;
  totalFailedPayments: number;
  isOptedOut: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type PaymentMethod = 'UPI' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'NETBANKING' | 'NACH' | 'WALLET';
export type PaymentStatus = 'PENDING' | 'AUTHORIZED' | 'CAPTURED' | 'FAILED' | 'REFUNDED';

export interface PaymentRecord {
  id: string;
  merchantId: string;
  customerId: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  gatewayReference?: string;
  errorCode?: string;
  errorDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentAttemptRecord {
  id: string;
  paymentId: string;
  attemptNumber: number;
  amount: number;
  currency: string;
  provider: 'MOCK' | 'RAZORPAY_TEST';
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  transactionId?: string;
  rawErrorCode?: string;
  rawErrorMessage?: string;
  createdAt: string;
}

export interface CheckoutSessionRecord {
  id: string;
  merchantId: string;
  customerId: string;
  cartValue: number;
  currency: string;
  stepReached: 'CART' | 'SHIPPING' | 'PAYMENT_METHOD' | 'OTP_VERIFICATION';
  paymentMethodSelected?: PaymentMethod;
  status: 'ACTIVE' | 'COMPLETED' | 'ABANDONED' | 'RECOVERED';
  abandonedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionRecord {
  id: string;
  merchantId: string;
  customerId: string;
  planName: string;
  billingAmount: number;
  currency: string;
  billingInterval: 'WEEKLY' | 'MONTHLY' | 'ANNUAL';
  status: 'ACTIVE' | 'PAST_DUE' | 'PAUSED' | 'CANCELLED' | 'RECOVERED';
  consecutiveFailedAttempts: number;
  lastBillingDate?: string;
  nextBillingDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceRecord {
  id: string;
  merchantId: string;
  customerId: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  dueDate: string;
  daysOverdue: number;
  status: 'DRAFT' | 'SENT' | 'OVERDUE' | 'PAID' | 'WRITTEN_OFF';
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

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

export interface RevenueRiskEventRecord {
  id: string;
  merchantId: string;
  customerId: string;
  type: RevenueRiskType;
  amount: number;
  currency: string;
  status: EventStatus;
  riskLevel: RiskLevel;
  paymentId?: string;
  checkoutSessionId?: string;
  subscriptionId?: string;
  invoiceId?: string;
  rawErrorCode?: string;
  retryCount: number;
  maxRetriesAllowed: number;
  reminderCount: number;
  maxRemindersAllowed: number;
  recoveredAmount: number;
  recoveredAt?: string;
  recoveryMethodUsed?: string;
  escalationLevel: number;
  createdAt: string;
  updatedAt: string;
}

export type InterventionType =
  | 'SMART_RETRY'
  | 'PAYMENT_LINK'
  | 'RECOVERY_REMINDER'
  | 'PERSONALIZED_DISCOUNT_LINK'
  | 'FINANCE_ESCALATION'
  | 'MANUAL_REVIEW'
  | 'DO_NOT_CONTACT';

export interface RecoveryAttemptRecord {
  id: string;
  eventId: string;
  interventionType: InterventionType;
  attemptNumber: number;
  status: 'PENDING' | 'EXECUTED' | 'SUCCESS' | 'FAILED' | 'BLOCKED';
  idempotencyKey: string;
  provider: 'MOCK' | 'RAZORPAY_TEST';
  gatewayResponseId?: string;
  errorMessage?: string;
  amountAttempted: number;
  amountRecovered: number;
  executedAt: string;
}

export interface RecoveryCampaignRecord {
  id: string;
  merchantId: string;
  name: string;
  filterType: RevenueRiskType | 'ALL';
  status: 'DRAFT' | 'ANALYZED' | 'AWAITING_APPROVAL' | 'RUNNING' | 'COMPLETED' | 'STOPPED';
  totalCases: number;
  totalAtRisk: number;
  predictedRecoverable: number;
  expectedRecoveryRate: number;
  actualRecovered: number;
  actualRecoveryRate: number;
  processedCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignItemRecord {
  id: string;
  campaignId: string;
  eventId: string;
  assignedAction: InterventionType;
  status: 'QUEUED' | 'EXECUTING' | 'RECOVERED' | 'FAILED' | 'STOPPED' | 'MANUAL_REVIEW';
  recoveredAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AIDecisionRecord {
  id: string;
  eventId: string;
  rootCauseCategory: string;
  rootCauseTitle: string;
  explanation: string;
  recoveryProbability: number;
  confidenceLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  recommendedAction: InterventionType;
  recommendedDelayHours: number;
  scoreFactors: Array<{
    impact: 'POSITIVE' | 'NEGATIVE';
    description: string;
    weight: number;
  }>;
  createdAt: string;
}

export interface AgentActionRecord {
  id: string;
  eventId: string;
  toolName: string;
  toolParameters: Record<string, unknown>;
  toolResult: Record<string, unknown>;
  status: 'EXECUTED' | 'FAILED' | 'BLOCKED';
  executedBy: 'AI_AGENT' | 'MERCHANT' | 'POLICY_ENGINE';
  createdAt: string;
}

export interface NotificationRecord {
  id: string;
  eventId: string;
  customerId: string;
  channel: 'WHATSAPP' | 'SMS' | 'EMAIL';
  messageContent: string;
  providerMessageId?: string;
  deliveryStatus: 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
  sentAt: string;
}

export interface RecoveryPolicyRecord {
  id: string;
  merchantId: string;
  maxPaymentRetries: number;
  maxSubscriptionRetries: number;
  maxReminders: number;
  minRetryIntervalHours: number;
  minReminderIntervalHours: number;
  maxAutomatedRecoveryAmount: number;
  autoApproveConfidenceScore: number;
  stopIfPaymentSuccess: boolean;
  stopIfInvoicePaid: boolean;
  stopIfSubscriptionRecovered: boolean;
  stopIfCustomerOptout: boolean;
  stopIfMaxAttemptsReached: boolean;
  stopIfManualReviewRequired: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  updatedAt: string;
}

export type ActorType = 'AI_AGENT' | 'MERCHANT' | 'SYSTEM' | 'POLICY_ENGINE';

export interface AuditLogRecord {
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
