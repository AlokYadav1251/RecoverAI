import { db } from '../inMemoryDatabase';
import {
  MerchantRecord,
  UserRecord,
  CustomerRecord,
  PaymentRecord,
  PaymentAttemptRecord,
  CheckoutSessionRecord,
  SubscriptionRecord,
  InvoiceRecord,
  RevenueRiskEventRecord,
  RecoveryAttemptRecord,
  RecoveryCampaignRecord,
  CampaignItemRecord,
  AIDecisionRecord,
  AgentActionRecord,
  NotificationRecord,
  RecoveryPolicyRecord,
  AuditLogRecord,
  RevenueRiskType,
  EventStatus,
} from '@/types/database';

export class MerchantRepository {
  static async findById(id: string): Promise<MerchantRecord | null> {
    return db.merchants.get(id) || null;
  }

  static async save(merchant: MerchantRecord): Promise<MerchantRecord> {
    db.merchants.set(merchant.id, merchant);
    return merchant;
  }
}

export class CustomerRepository {
  static async findById(id: string): Promise<CustomerRecord | null> {
    return db.customers.get(id) || null;
  }

  static async findByEmail(email: string): Promise<CustomerRecord | null> {
    for (const cust of db.customers.values()) {
      if (cust.email.toLowerCase() === email.toLowerCase()) return cust;
    }
    return null;
  }

  static async findAll(filter?: { merchantId?: string; isOptedOut?: boolean }): Promise<CustomerRecord[]> {
    let list = Array.from(db.customers.values());
    if (filter?.merchantId) list = list.filter((c) => c.merchantId === filter.merchantId);
    if (filter?.isOptedOut !== undefined) list = list.filter((c) => c.isOptedOut === filter.isOptedOut);
    return list;
  }

  static async save(customer: CustomerRecord): Promise<CustomerRecord> {
    db.customers.set(customer.id, customer);
    return customer;
  }

  static async count(): Promise<number> {
    return db.customers.size;
  }
}

export class PaymentRepository {
  static async findById(id: string): Promise<PaymentRecord | null> {
    return db.payments.get(id) || null;
  }

  static async findByCustomerId(customerId: string): Promise<PaymentRecord[]> {
    return Array.from(db.payments.values()).filter((p) => p.customerId === customerId);
  }

  static async findAll(filter?: { status?: PaymentRecord['status'] }): Promise<PaymentRecord[]> {
    let list = Array.from(db.payments.values());
    if (filter?.status) list = list.filter((p) => p.status === filter.status);
    return list;
  }

  static async save(payment: PaymentRecord): Promise<PaymentRecord> {
    db.payments.set(payment.id, payment);
    return payment;
  }

  static async count(): Promise<number> {
    return db.payments.size;
  }
}

export class PaymentAttemptRepository {
  static async findByPaymentId(paymentId: string): Promise<PaymentAttemptRecord[]> {
    return Array.from(db.paymentAttempts.values()).filter((a) => a.paymentId === paymentId);
  }

  static async save(attempt: PaymentAttemptRecord): Promise<PaymentAttemptRecord> {
    db.paymentAttempts.set(attempt.id, attempt);
    return attempt;
  }
}

export class CheckoutSessionRepository {
  static async findById(id: string): Promise<CheckoutSessionRecord | null> {
    return db.checkoutSessions.get(id) || null;
  }

  static async findAll(filter?: { status?: CheckoutSessionRecord['status'] }): Promise<CheckoutSessionRecord[]> {
    let list = Array.from(db.checkoutSessions.values());
    if (filter?.status) list = list.filter((s) => s.status === filter.status);
    return list;
  }

  static async save(session: CheckoutSessionRecord): Promise<CheckoutSessionRecord> {
    db.checkoutSessions.set(session.id, session);
    return session;
  }
}

export class SubscriptionRepository {
  static async findById(id: string): Promise<SubscriptionRecord | null> {
    return db.subscriptions.get(id) || null;
  }

  static async findAll(filter?: { status?: SubscriptionRecord['status'] }): Promise<SubscriptionRecord[]> {
    let list = Array.from(db.subscriptions.values());
    if (filter?.status) list = list.filter((s) => s.status === filter.status);
    return list;
  }

  static async save(subscription: SubscriptionRecord): Promise<SubscriptionRecord> {
    db.subscriptions.set(subscription.id, subscription);
    return subscription;
  }
}

export class InvoiceRepository {
  static async findById(id: string): Promise<InvoiceRecord | null> {
    return db.invoices.get(id) || null;
  }

  static async findAll(filter?: { status?: InvoiceRecord['status'] }): Promise<InvoiceRecord[]> {
    let list = Array.from(db.invoices.values());
    if (filter?.status) list = list.filter((inv) => inv.status === filter.status);
    return list;
  }

  static async save(invoice: InvoiceRecord): Promise<InvoiceRecord> {
    db.invoices.set(invoice.id, invoice);
    return invoice;
  }
}

export class RevenueRiskEventRepository {
  static async findById(id: string): Promise<RevenueRiskEventRecord | null> {
    return db.revenueRiskEvents.get(id) || null;
  }

  static async findAll(filter?: {
    type?: RevenueRiskType;
    status?: EventStatus;
    minAmount?: number;
    customerId?: string;
  }): Promise<RevenueRiskEventRecord[]> {
    let list = Array.from(db.revenueRiskEvents.values());
    if (filter?.type) list = list.filter((e) => e.type === filter.type);
    if (filter?.status) list = list.filter((e) => e.status === filter.status);
    if (filter?.minAmount !== undefined) list = list.filter((e) => e.amount >= filter.minAmount!);
    if (filter?.customerId) list = list.filter((e) => e.customerId === filter.customerId);
    return list;
  }

  static async save(event: RevenueRiskEventRecord): Promise<RevenueRiskEventRecord> {
    db.revenueRiskEvents.set(event.id, event);
    return event;
  }

  static async count(): Promise<number> {
    return db.revenueRiskEvents.size;
  }
}

export class RecoveryAttemptRepository {
  static async findByEventId(eventId: string): Promise<RecoveryAttemptRecord[]> {
    return Array.from(db.recoveryAttempts.values()).filter((a) => a.eventId === eventId);
  }

  static async findByIdempotencyKey(key: string): Promise<RecoveryAttemptRecord | null> {
    for (const att of db.recoveryAttempts.values()) {
      if (att.idempotencyKey === key) return att;
    }
    return null;
  }

  static async save(attempt: RecoveryAttemptRecord): Promise<RecoveryAttemptRecord> {
    db.recoveryAttempts.set(attempt.id, attempt);
    db.idempotencyKeys.add(attempt.idempotencyKey);
    return attempt;
  }
}

export class RecoveryCampaignRepository {
  static async findById(id: string): Promise<RecoveryCampaignRecord | null> {
    return db.recoveryCampaigns.get(id) || null;
  }

  static async findAll(): Promise<RecoveryCampaignRecord[]> {
    return Array.from(db.recoveryCampaigns.values());
  }

  static async save(campaign: RecoveryCampaignRecord): Promise<RecoveryCampaignRecord> {
    db.recoveryCampaigns.set(campaign.id, campaign);
    return campaign;
  }
}

export class CampaignItemRepository {
  static async findByCampaignId(campaignId: string): Promise<CampaignItemRecord[]> {
    return Array.from(db.campaignItems.values()).filter((item) => item.campaignId === campaignId);
  }

  static async save(item: CampaignItemRecord): Promise<CampaignItemRecord> {
    db.campaignItems.set(item.id, item);
    return item;
  }
}

export class AIDecisionRepository {
  static async findByEventId(eventId: string): Promise<AIDecisionRecord | null> {
    return db.aiDecisions.get(eventId) || null;
  }

  static async save(decision: AIDecisionRecord): Promise<AIDecisionRecord> {
    db.aiDecisions.set(decision.eventId, decision);
    return decision;
  }
}

export class AgentActionRepository {
  static async findByEventId(eventId: string): Promise<AgentActionRecord[]> {
    return Array.from(db.agentActions.values()).filter((a) => a.eventId === eventId);
  }

  static async save(action: AgentActionRecord): Promise<AgentActionRecord> {
    db.agentActions.set(action.id, action);
    return action;
  }
}

export class NotificationRepository {
  static async findByEventId(eventId: string): Promise<NotificationRecord[]> {
    return Array.from(db.notifications.values()).filter((n) => n.eventId === eventId);
  }

  static async save(notification: NotificationRecord): Promise<NotificationRecord> {
    db.notifications.set(notification.id, notification);
    return notification;
  }
}

export class RecoveryPolicyRepository {
  static async getPolicy(merchantId: string = 'MERCHANT_DEFAULT'): Promise<RecoveryPolicyRecord> {
    let policy = db.recoveryPolicies.get(merchantId);
    if (!policy) {
      policy = {
        id: `POL_${merchantId}`,
        merchantId,
        maxPaymentRetries: 3,
        maxSubscriptionRetries: 3,
        maxReminders: 3,
        minRetryIntervalHours: 2,
        minReminderIntervalHours: 24,
        maxAutomatedRecoveryAmount: 50000,
        autoApproveConfidenceScore: 80,
        stopIfPaymentSuccess: true,
        stopIfInvoicePaid: true,
        stopIfSubscriptionRecovered: true,
        stopIfCustomerOptout: true,
        stopIfMaxAttemptsReached: true,
        stopIfManualReviewRequired: true,
        quietHoursEnabled: true,
        quietHoursStart: '21:00',
        quietHoursEnd: '08:00',
        updatedAt: new Date().toISOString(),
      };
      db.recoveryPolicies.set(merchantId, policy);
    }
    return policy;
  }

  static async updatePolicy(policy: RecoveryPolicyRecord): Promise<RecoveryPolicyRecord> {
    db.recoveryPolicies.set(policy.merchantId, policy);
    return policy;
  }
}

export class AuditLogRepository {
  static async create(entry: AuditLogRecord): Promise<AuditLogRecord> {
    db.auditLogs.unshift(entry);
    return entry;
  }

  static async findAll(filter?: {
    actorType?: AuditLogRecord['actorType'];
    eventId?: string;
    limit?: number;
  }): Promise<AuditLogRecord[]> {
    let list = db.auditLogs;
    if (filter?.actorType) list = list.filter((l) => l.actorType === filter.actorType);
    if (filter?.eventId) list = list.filter((l) => l.eventId === filter.eventId);
    if (filter?.limit) list = list.slice(0, filter.limit);
    return list;
  }

  static async count(): Promise<number> {
    return db.auditLogs.length;
  }
}
