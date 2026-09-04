import {
  RevenueRiskEventRepository,
  CustomerRepository,
  PaymentRepository,
  CheckoutSessionRepository,
  SubscriptionRepository,
  InvoiceRepository,
} from '@/db/repositories';
import { RevenueRiskEventRecord, RevenueRiskType, EventStatus, RiskLevel } from '@/types/database';
import { AuditService } from './audit.service';

export interface CreateRiskEventDTO {
  merchantId?: string;
  customerId: string;
  type: RevenueRiskType;
  amount: number;
  currency?: string;
  paymentId?: string;
  checkoutSessionId?: string;
  subscriptionId?: string;
  invoiceId?: string;
  rawErrorCode?: string;
}

export class RevenueRiskService {
  static async getRiskEvents(filter?: {
    type?: RevenueRiskType;
    status?: EventStatus;
    minAmount?: number;
    customerId?: string;
  }): Promise<RevenueRiskEventRecord[]> {
    return RevenueRiskEventRepository.findAll(filter);
  }

  static async getRiskEventById(id: string): Promise<RevenueRiskEventRecord | null> {
    return RevenueRiskEventRepository.findById(id);
  }

  static async createRiskEvent(dto: CreateRiskEventDTO): Promise<RevenueRiskEventRecord> {
    const customer = await CustomerRepository.findById(dto.customerId);
    if (!customer) {
      throw new Error(`Customer ${dto.customerId} not found`);
    }

    const eventId = `EVT-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const riskLevel: RiskLevel = dto.amount > 50000 ? 'HIGH' : dto.amount > 10000 ? 'MEDIUM' : 'LOW';
    const now = new Date().toISOString();

    const record: RevenueRiskEventRecord = {
      id: eventId,
      merchantId: dto.merchantId || 'MERCHANT_DEFAULT',
      customerId: dto.customerId,
      type: dto.type,
      amount: dto.amount,
      currency: dto.currency || 'INR',
      status: 'AT_RISK',
      riskLevel,
      paymentId: dto.paymentId,
      checkoutSessionId: dto.checkoutSessionId,
      subscriptionId: dto.subscriptionId,
      invoiceId: dto.invoiceId,
      rawErrorCode: dto.rawErrorCode,
      retryCount: 0,
      maxRetriesAllowed: 3,
      reminderCount: 0,
      maxRemindersAllowed: 3,
      recoveredAmount: 0,
      escalationLevel: 0,
      createdAt: now,
      updatedAt: now,
    };

    const saved = await RevenueRiskEventRepository.save(record);

    await AuditService.log({
      actor: 'RevenueRiskService',
      actorType: 'SYSTEM',
      eventId: saved.id,
      action: 'RISK_EVENT_CREATED',
      reason: `Ingested ${dto.type} of amount ₹${dto.amount.toLocaleString('en-IN')}`,
      newState: 'AT_RISK',
      policyResult: 'PASSED',
      amount: dto.amount,
    });

    return saved;
  }

  static async updateEventStatus(
    eventId: string,
    status: EventStatus,
    reason: string,
    actor: string = 'RevenueRiskService'
  ): Promise<RevenueRiskEventRecord> {
    const event = await RevenueRiskEventRepository.findById(eventId);
    if (!event) {
      throw new Error(`Revenue risk event ${eventId} not found`);
    }

    const previousState = event.status;
    event.status = status;
    event.updatedAt = new Date().toISOString();

    const updated = await RevenueRiskEventRepository.save(event);

    await AuditService.log({
      actor,
      actorType: 'AI_AGENT',
      eventId: event.id,
      action: 'EVENT_STATUS_UPDATED',
      reason,
      previousState,
      newState: status,
      policyResult: 'PASSED',
      amount: event.amount,
    });

    return updated;
  }
}
