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
} from '@/types/database';
import fs from 'fs';
import path from 'path';

interface DatabaseSnapshot {
  merchants: MerchantRecord[];
  users: UserRecord[];
  customers: CustomerRecord[];
  payments: PaymentRecord[];
  paymentAttempts: PaymentAttemptRecord[];
  checkoutSessions: CheckoutSessionRecord[];
  subscriptions: SubscriptionRecord[];
  invoices: InvoiceRecord[];
  revenueRiskEvents: RevenueRiskEventRecord[];
  recoveryAttempts: RecoveryAttemptRecord[];
  recoveryCampaigns: RecoveryCampaignRecord[];
  campaignItems: CampaignItemRecord[];
  aiDecisions: AIDecisionRecord[];
  agentActions: AgentActionRecord[];
  notifications: NotificationRecord[];
  recoveryPolicies: RecoveryPolicyRecord[];
  auditLogs: AuditLogRecord[];
}

export class InMemoryDatabase {
  public merchants = new Map<string, MerchantRecord>();
  public users = new Map<string, UserRecord>();
  public customers = new Map<string, CustomerRecord>();
  public payments = new Map<string, PaymentRecord>();
  public paymentAttempts = new Map<string, PaymentAttemptRecord>();
  public checkoutSessions = new Map<string, CheckoutSessionRecord>();
  public subscriptions = new Map<string, SubscriptionRecord>();
  public invoices = new Map<string, InvoiceRecord>();
  public revenueRiskEvents = new Map<string, RevenueRiskEventRecord>();
  public recoveryAttempts = new Map<string, RecoveryAttemptRecord>();
  public recoveryCampaigns = new Map<string, RecoveryCampaignRecord>();
  public campaignItems = new Map<string, CampaignItemRecord>();
  public aiDecisions = new Map<string, AIDecisionRecord>();
  public agentActions = new Map<string, AgentActionRecord>();
  public notifications = new Map<string, NotificationRecord>();
  public recoveryPolicies = new Map<string, RecoveryPolicyRecord>();
  public auditLogs: AuditLogRecord[] = [];

  // Idempotency Registry
  public idempotencyKeys = new Set<string>();

  private static instance: InMemoryDatabase;

  private readonly storagePath = path.join(process.cwd(), 'data', 'recoverai-db.json');

  private constructor() {
    this.load();
  }

  public static getInstance(): InMemoryDatabase {
    if (!InMemoryDatabase.instance) {
      InMemoryDatabase.instance = new InMemoryDatabase();
    }
    return InMemoryDatabase.instance;
  }

  public clear(): void {
    this.merchants.clear();
    this.users.clear();
    this.customers.clear();
    this.payments.clear();
    this.paymentAttempts.clear();
    this.checkoutSessions.clear();
    this.subscriptions.clear();
    this.invoices.clear();
    this.revenueRiskEvents.clear();
    this.recoveryAttempts.clear();
    this.recoveryCampaigns.clear();
    this.campaignItems.clear();
    this.aiDecisions.clear();
    this.agentActions.clear();
    this.notifications.clear();
    this.recoveryPolicies.clear();
    this.auditLogs = [];
    this.idempotencyKeys.clear();
  }

  public persist(): void {
    const snapshot: DatabaseSnapshot = {
      merchants: Array.from(this.merchants.values()),
      users: Array.from(this.users.values()),
      customers: Array.from(this.customers.values()),
      payments: Array.from(this.payments.values()),
      paymentAttempts: Array.from(this.paymentAttempts.values()),
      checkoutSessions: Array.from(this.checkoutSessions.values()),
      subscriptions: Array.from(this.subscriptions.values()),
      invoices: Array.from(this.invoices.values()),
      revenueRiskEvents: Array.from(this.revenueRiskEvents.values()),
      recoveryAttempts: Array.from(this.recoveryAttempts.values()),
      recoveryCampaigns: Array.from(this.recoveryCampaigns.values()),
      campaignItems: Array.from(this.campaignItems.values()),
      aiDecisions: Array.from(this.aiDecisions.values()),
      agentActions: Array.from(this.agentActions.values()),
      notifications: Array.from(this.notifications.values()),
      recoveryPolicies: Array.from(this.recoveryPolicies.values()),
      auditLogs: this.auditLogs,
    };

    fs.mkdirSync(path.dirname(this.storagePath), { recursive: true });
    fs.writeFileSync(this.storagePath, JSON.stringify(snapshot), 'utf8');
  }

  private load(): void {
    try {
      if (!fs.existsSync(this.storagePath)) return;
      const snapshot = JSON.parse(fs.readFileSync(this.storagePath, 'utf8')) as Partial<DatabaseSnapshot>;
      for (const [key, values] of Object.entries(snapshot)) {
        if (key === 'auditLogs' && Array.isArray(values)) {
          this.auditLogs = values as AuditLogRecord[];
        } else if (Array.isArray(values) && key in this) {
          const collection = (this as unknown as Record<string, Map<string, unknown>>)[key];
          if (collection instanceof Map) {
            for (const value of values) {
              const record = value as { id?: string; eventId?: string; merchantId?: string };
              const id = key === 'aiDecisions' ? record.eventId : key === 'recoveryPolicies' ? record.merchantId : record.id;
              if (id) collection.set(id, value);
            }
          }
        }
      }
      for (const attempt of this.recoveryAttempts.values()) this.idempotencyKeys.add(attempt.idempotencyKey);
    } catch {
      this.clear();
    }
  }

  public getStats() {
    return {
      merchantsCount: this.merchants.size,
      usersCount: this.users.size,
      customersCount: this.customers.size,
      paymentsCount: this.payments.size,
      paymentAttemptsCount: this.paymentAttempts.size,
      checkoutSessionsCount: this.checkoutSessions.size,
      subscriptionsCount: this.subscriptions.size,
      invoicesCount: this.invoices.size,
      revenueRiskEventsCount: this.revenueRiskEvents.size,
      recoveryAttemptsCount: this.recoveryAttempts.size,
      recoveryCampaignsCount: this.recoveryCampaigns.size,
      campaignItemsCount: this.campaignItems.size,
      aiDecisionsCount: this.aiDecisions.size,
      agentActionsCount: this.agentActions.size,
      notificationsCount: this.notifications.size,
      recoveryPoliciesCount: this.recoveryPolicies.size,
      auditLogsCount: this.auditLogs.length,
    };
  }
}

export const db = InMemoryDatabase.getInstance();
