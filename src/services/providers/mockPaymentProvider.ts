import {
  IPaymentProvider,
  CreatePaymentRequest,
  PaymentResult,
  PaymentDetails,
  RetryPaymentRequest,
  CreatePaymentLinkRequest,
  PaymentLinkResult,
  PaymentVerificationResult,
} from './paymentProvider.interface';
import { db } from '@/db/inMemoryDatabase';
import { PaymentRecord } from '@/types/database';

export class MockPaymentProvider implements IPaymentProvider {
  public readonly providerName = 'MOCK' as const;
  private simulatedLatencyMs: number;

  constructor(options?: { simulatedLatencyMs?: number }) {
    this.simulatedLatencyMs = options?.simulatedLatencyMs ?? 50; // fast for unit tests & demo
  }

  private async simulateNetworkDelay(): Promise<void> {
    if (this.simulatedLatencyMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.simulatedLatencyMs));
    }
  }

  async createPayment(request: CreatePaymentRequest): Promise<PaymentResult> {
    await this.simulateNetworkDelay();

    // Check customer opt-out or existence
    const customer = db.customers.get(request.customerId);
    if (customer?.isOptedOut) {
      return {
        success: false,
        paymentId: `pay_mock_${Date.now()}`,
        amount: request.amount,
        currency: request.currency,
        status: 'FAILED',
        provider: 'MOCK',
        errorCode: 'CUSTOMER_OPTED_OUT',
        errorMessage: 'Customer has opted out of automated payments.',
      };
    }

    const paymentId = `pay_mock_${Math.random().toString(36).substring(2, 10)}`;
    const isSuccess = true;

    return {
      success: isSuccess,
      paymentId,
      transactionId: `txn_${Date.now()}`,
      amount: request.amount,
      currency: request.currency,
      status: isSuccess ? 'CAPTURED' : 'FAILED',
      provider: 'MOCK',
      settledAt: isSuccess ? new Date().toISOString() : undefined,
    };
  }

  async getPayment(paymentId: string): Promise<PaymentDetails | null> {
    await this.simulateNetworkDelay();
    const payment = db.payments.get(paymentId);
    if (!payment) return null;

    const customer = db.customers.get(payment.customerId);

    return {
      id: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status === 'CAPTURED' ? 'CAPTURED' : payment.status === 'AUTHORIZED' ? 'AUTHORIZED' : 'FAILED',
      paymentMethod: payment.paymentMethod,
      customerEmail: customer?.email || 'customer@example.com',
      createdAt: payment.createdAt,
    };
  }

  async retryPayment(request: RetryPaymentRequest): Promise<PaymentResult> {
    await this.simulateNetworkDelay();

    const existingPayment = db.payments.get(request.paymentId);
    const customer = existingPayment ? db.customers.get(existingPayment.customerId) : null;

    if (customer?.isOptedOut || request.forcedFailure) {
      return {
        success: false,
        paymentId: request.paymentId,
        transactionId: `txn_fail_${Date.now()}`,
        amount: existingPayment?.amount || 0,
        currency: existingPayment?.currency || 'INR',
        status: 'FAILED',
        provider: 'MOCK',
        errorCode: 'BANK_DECLINED',
        errorMessage: 'Retry declined by issuing bank simulator.',
      };
    }

    // High success rate for smart retries
    const transactionId = `txn_rcvr_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    return {
      success: true,
      paymentId: request.paymentId,
      transactionId,
      amount: existingPayment?.amount || 4999,
      currency: existingPayment?.currency || 'INR',
      status: 'CAPTURED',
      provider: 'MOCK',
      settledAt: new Date().toISOString(),
    };
  }

  async createPaymentLink(request: CreatePaymentLinkRequest): Promise<PaymentLinkResult> {
    await this.simulateNetworkDelay();
    const linkId = `plink_mock_${Math.random().toString(36).substring(2, 10)}`;

    return {
      success: true,
      paymentLinkId: linkId,
      shortUrl: `https://rzp.io/i/${linkId}`,
      amount: request.amount,
      currency: request.currency,
      expiresAt: new Date(Date.now() + (request.expiresInHours || 48) * 3600 * 1000).toISOString(),
      provider: 'MOCK',
    };
  }

  async verifyPayment(paymentId: string): Promise<PaymentVerificationResult> {
    await this.simulateNetworkDelay();
    const payment = db.payments.get(paymentId);

    return {
      verified: payment ? payment.status === 'CAPTURED' : true,
      paymentId,
      amount: payment?.amount || 4999,
      status: payment?.status === 'CAPTURED' ? 'CAPTURED' : 'PENDING',
      settledAt: payment?.status === 'CAPTURED' ? payment.updatedAt : undefined,
    };
  }
}
