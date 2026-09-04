import {
  PaymentRepository,
  PaymentAttemptRepository,
  CustomerRepository,
} from '@/db/repositories';
import { PaymentProviderFactory } from './providers/paymentProviderFactory';
import { CreatePaymentRequest, PaymentResult, PaymentDetails } from './providers/paymentProvider.interface';
import { AuditService } from './audit.service';
import { PaymentRecord, PaymentAttemptRecord } from '@/types/database';

export class PaymentService {
  static async getPayment(paymentId: string): Promise<PaymentRecord | null> {
    return PaymentRepository.findById(paymentId);
  }

  static async getCustomerPayments(customerId: string): Promise<PaymentRecord[]> {
    return PaymentRepository.findByCustomerId(customerId);
  }

  static async createPayment(request: CreatePaymentRequest): Promise<PaymentResult> {
    const customer = await CustomerRepository.findById(request.customerId);
    if (!customer) {
      throw new Error(`Customer ${request.customerId} not found`);
    }

    const provider = PaymentProviderFactory.getProvider();
    const result = await provider.createPayment(request);

    const now = new Date().toISOString();
    const paymentRecord: PaymentRecord = {
      id: result.paymentId,
      merchantId: request.merchantId,
      customerId: request.customerId,
      amount: request.amount,
      currency: request.currency,
      paymentMethod: request.paymentMethod,
      status: result.status === 'CAPTURED' ? 'CAPTURED' : 'FAILED',
      errorCode: result.errorCode,
      errorDescription: result.errorMessage,
      createdAt: now,
      updatedAt: now,
    };

    await PaymentRepository.save(paymentRecord);

    const attemptRecord: PaymentAttemptRecord = {
      id: `att_${Date.now()}_1`,
      paymentId: paymentRecord.id,
      attemptNumber: 1,
      amount: request.amount,
      currency: request.currency,
      provider: result.provider,
      status: result.success ? 'SUCCESS' : 'FAILED',
      transactionId: result.transactionId,
      rawErrorCode: result.errorCode,
      rawErrorMessage: result.errorMessage,
      createdAt: now,
    };

    await PaymentAttemptRepository.save(attemptRecord);

    await AuditService.log({
      actor: 'PaymentService',
      actorType: 'SYSTEM',
      action: 'PAYMENT_PROCESSED',
      reason: `Payment ${paymentRecord.id} of ₹${request.amount} processed with status ${result.status}`,
      policyResult: 'PASSED',
      idempotencyKey: request.idempotencyKey,
      amount: request.amount,
      recoveredAmount: result.success ? request.amount : 0,
    });

    return result;
  }

  static async retryPayment(
    paymentId: string,
    idempotencyKey: string,
    forcedFailure: boolean = false
  ): Promise<PaymentResult> {
    const payment = await PaymentRepository.findById(paymentId);
    if (!payment) {
      throw new Error(`Payment ${paymentId} not found`);
    }

    const provider = PaymentProviderFactory.getProvider();
    const result = await provider.retryPayment({
      paymentId,
      idempotencyKey,
      forcedFailure,
    });

    const now = new Date().toISOString();
    if (result.success) {
      payment.status = 'CAPTURED';
      payment.updatedAt = now;
      await PaymentRepository.save(payment);
    }

    const attemptRecord: PaymentAttemptRecord = {
      id: `att_${Date.now()}_retry`,
      paymentId,
      attemptNumber: 2,
      amount: payment.amount,
      currency: payment.currency,
      provider: result.provider,
      status: result.success ? 'SUCCESS' : 'FAILED',
      transactionId: result.transactionId,
      rawErrorCode: result.errorCode,
      rawErrorMessage: result.errorMessage,
      createdAt: now,
    };

    await PaymentAttemptRepository.save(attemptRecord);

    await AuditService.log({
      actor: 'PaymentService',
      actorType: 'SYSTEM',
      action: 'PAYMENT_RETRY_EXECUTED',
      reason: `Retry executed for ${paymentId}. Result: ${result.status}`,
      policyResult: 'PASSED',
      idempotencyKey,
      amount: payment.amount,
      recoveredAmount: result.success ? payment.amount : 0,
    });

    return result;
  }
}
