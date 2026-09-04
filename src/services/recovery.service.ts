import {
  RevenueRiskEventRepository,
  RecoveryAttemptRepository,
  CustomerRepository,
} from '@/db/repositories';
import { PaymentProviderFactory } from './providers/paymentProviderFactory';
import { AuditService } from './audit.service';
import {
  InterventionType,
  RecoveryAttemptRecord,
  RevenueRiskEventRecord,
} from '@/types/database';

export interface ExecuteRecoveryDTO {
  eventId: string;
  interventionType: InterventionType;
  idempotencyKey: string;
  actor?: string;
}

export interface RecoveryExecutionResult {
  success: boolean;
  eventId: string;
  recoveredAmount: number;
  status: 'RECOVERED' | 'FAILED' | 'BLOCKED';
  message: string;
  attemptId: string;
}

export class RecoveryService {
  static async executeRecoveryAction(dto: ExecuteRecoveryDTO): Promise<RecoveryExecutionResult> {
    const event = await RevenueRiskEventRepository.findById(dto.eventId);
    if (!event) {
      throw new Error(`Revenue risk event ${dto.eventId} not found`);
    }

    // 1. Idempotency Check
    const existingAttempt = await RecoveryAttemptRepository.findByIdempotencyKey(dto.idempotencyKey);
    if (existingAttempt) {
      return {
        success: existingAttempt.status === 'SUCCESS',
        eventId: event.id,
        recoveredAmount: existingAttempt.amountRecovered,
        status: existingAttempt.status === 'SUCCESS' ? 'RECOVERED' : 'BLOCKED',
        message: `Duplicate request ignored. Idempotency key ${dto.idempotencyKey} already executed.`,
        attemptId: existingAttempt.id,
      };
    }

    // 2. Opt-out safety check
    const customer = await CustomerRepository.findById(event.customerId);
    if (customer?.isOptedOut || dto.interventionType === 'DO_NOT_CONTACT') {
      event.status = 'STOPPED';
      event.updatedAt = new Date().toISOString();
      await RevenueRiskEventRepository.save(event);

      await AuditService.log({
        actor: dto.actor || 'RecoveryService',
        actorType: 'POLICY_ENGINE',
        eventId: event.id,
        action: 'RECOVERY_BLOCKED_OPTOUT',
        reason: 'Customer opted out of communications. Action halted.',
        previousState: event.status,
        newState: 'STOPPED',
        policyResult: 'BLOCKED',
        idempotencyKey: dto.idempotencyKey,
        amount: event.amount,
      });

      return {
        success: false,
        eventId: event.id,
        recoveredAmount: 0,
        status: 'BLOCKED',
        message: 'Customer is opted out. Workflow safely stopped.',
        attemptId: `att_blocked_${Date.now()}`,
      };
    }

    // 3. Execute bounded provider action
    const provider = PaymentProviderFactory.getProvider();
    const attemptId = `att_rcv_${Date.now()}`;
    let isSuccess = false;
    let message = '';
    let gatewayResponseId = '';

    if (dto.interventionType === 'SMART_RETRY') {
      const retryResult = await provider.retryPayment({
        paymentId: event.paymentId || event.id,
        idempotencyKey: dto.idempotencyKey,
      });
      isSuccess = retryResult.success;
      gatewayResponseId = retryResult.transactionId || '';
      message = isSuccess ? 'Payment retry captured successfully.' : `Retry failed: ${retryResult.errorMessage}`;
    } else if (dto.interventionType === 'PAYMENT_LINK') {
      const linkResult = await provider.createPaymentLink({
        merchantId: event.merchantId,
        customerId: event.customerId,
        eventId: event.id,
        amount: event.amount,
        currency: event.currency,
        description: `Recovery for event ${event.id}`,
        idempotencyKey: dto.idempotencyKey,
      });
      isSuccess = linkResult.success;
      gatewayResponseId = linkResult.paymentLinkId;
      message = `Payment link generated: ${linkResult.shortUrl}`;
    } else {
      isSuccess = true;
      message = `Dispatched ${dto.interventionType} intervention.`;
    }

    const now = new Date().toISOString();
    const recoveredAmount = isSuccess ? event.amount : 0;

    // 4. Update Event State
    if (isSuccess && (dto.interventionType === 'SMART_RETRY' || dto.interventionType === 'PAYMENT_LINK')) {
      event.status = 'RECOVERED';
      event.recoveredAmount = event.amount;
      event.recoveredAt = now;
      event.recoveryMethodUsed = dto.interventionType;
      event.retryCount += dto.interventionType === 'SMART_RETRY' ? 1 : 0;
    } else {
      event.retryCount += dto.interventionType === 'SMART_RETRY' ? 1 : 0;
      event.reminderCount += dto.interventionType === 'RECOVERY_REMINDER' ? 1 : 0;
      event.status = 'IN_PROGRESS';
    }
    event.updatedAt = now;
    await RevenueRiskEventRepository.save(event);

    // 5. Record Recovery Attempt
    const attemptRecord: RecoveryAttemptRecord = {
      id: attemptId,
      eventId: event.id,
      interventionType: dto.interventionType,
      attemptNumber: event.retryCount + event.reminderCount,
      status: isSuccess ? 'SUCCESS' : 'FAILED',
      idempotencyKey: dto.idempotencyKey,
      provider: 'MOCK',
      gatewayResponseId,
      errorMessage: isSuccess ? undefined : message,
      amountAttempted: event.amount,
      amountRecovered: recoveredAmount,
      executedAt: now,
    };
    await RecoveryAttemptRepository.save(attemptRecord);

    // 6. Log Audit Trail
    await AuditService.log({
      actor: dto.actor || 'RecoveryService',
      actorType: 'AI_AGENT',
      eventId: event.id,
      action: isSuccess ? 'RECOVERY_ACTION_SUCCESS' : 'RECOVERY_ACTION_FAILED',
      reason: message,
      previousState: event.status,
      newState: event.status,
      policyResult: 'PASSED',
      idempotencyKey: dto.idempotencyKey,
      amount: event.amount,
      recoveredAmount,
    });

    return {
      success: isSuccess,
      eventId: event.id,
      recoveredAmount,
      status: isSuccess ? 'RECOVERED' : 'FAILED',
      message,
      attemptId,
    };
  }

  static async getRecoveryHistory(eventId: string): Promise<RecoveryAttemptRecord[]> {
    return RecoveryAttemptRepository.findByEventId(eventId);
  }

  static async stopWorkflow(eventId: string, reason: string, actor: string = 'Merchant'): Promise<RevenueRiskEventRecord> {
    const event = await RevenueRiskEventRepository.findById(eventId);
    if (!event) {
      throw new Error(`Event ${eventId} not found`);
    }

    event.status = 'STOPPED';
    event.updatedAt = new Date().toISOString();
    await RevenueRiskEventRepository.save(event);

    await AuditService.log({
      actor,
      actorType: 'MERCHANT',
      eventId: event.id,
      action: 'WORKFLOW_STOPPED',
      reason,
      previousState: event.status,
      newState: 'STOPPED',
      policyResult: 'BLOCKED',
      amount: event.amount,
    });

    return event;
  }
}
