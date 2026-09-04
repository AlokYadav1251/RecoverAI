import { Customer } from '@/types';

export interface PaymentRetryResult {
  success: boolean;
  transactionId: string;
  amount: number;
  provider: 'MOCK' | 'RAZORPAY_TEST';
  errorCode?: string;
  errorMessage?: string;
  settledAt?: string;
}

export interface PaymentLinkResult {
  success: boolean;
  paymentLinkId: string;
  shortUrl: string;
  provider: 'MOCK' | 'RAZORPAY_TEST';
  expiresAt: string;
}

export interface NotificationResult {
  success: boolean;
  messageId: string;
  channel: 'WHATSAPP' | 'SMS' | 'EMAIL';
  deliveredAt: string;
}

export interface IPaymentProvider {
  createPaymentRetry(paymentId: string, amount: number, customer: Customer): Promise<PaymentRetryResult>;
  createPaymentLink(eventId: string, amount: number, customer: Customer, description: string): Promise<PaymentLinkResult>;
  sendRecoveryNotification(eventId: string, customer: Customer, channel: 'WHATSAPP' | 'SMS' | 'EMAIL', message: string): Promise<NotificationResult>;
  verifyPaymentStatus(paymentId: string): Promise<{ status: 'CAPTURED' | 'FAILED' | 'PENDING'; amount: number }>;
}

export class MockPaymentProvider implements IPaymentProvider {
  private simulatedLatencyMs: number;
  private forcedFailure: boolean;

  constructor(options?: { simulatedLatencyMs?: number; forcedFailure?: boolean }) {
    this.simulatedLatencyMs = options?.simulatedLatencyMs ?? 400;
    this.forcedFailure = options?.forcedFailure ?? false;
  }

  private async delay(): Promise<void> {
    if (this.simulatedLatencyMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.simulatedLatencyMs));
    }
  }

  async createPaymentRetry(paymentId: string, amount: number, customer: Customer): Promise<PaymentRetryResult> {
    await this.delay();
    
    if (this.forcedFailure || customer.isOptedOut) {
      return {
        success: false,
        transactionId: `txn_fail_${Date.now()}`,
        amount,
        provider: 'MOCK',
        errorCode: 'BANK_DECLINED',
        errorMessage: 'Transaction declined by issuer during retry attempt.',
      };
    }

    // High success rate for smart retry (simulating optimal timing)
    return {
      success: true,
      transactionId: `pay_rcvr_${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      amount,
      provider: 'MOCK',
      settledAt: new Date().toISOString(),
    };
  }

  async createPaymentLink(eventId: string, amount: number, customer: Customer, description: string): Promise<PaymentLinkResult> {
    await this.delay();
    const linkId = `plink_${Math.random().toString(36).substring(2, 10)}`;
    return {
      success: true,
      paymentLinkId: linkId,
      shortUrl: `https://rzp.io/i/${linkId}`,
      provider: 'MOCK',
      expiresAt: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
    };
  }

  async sendRecoveryNotification(
    eventId: string, 
    customer: Customer, 
    channel: 'WHATSAPP' | 'SMS' | 'EMAIL', 
    message: string
  ): Promise<NotificationResult> {
    await this.delay();
    return {
      success: true,
      messageId: `msg_${channel.toLowerCase()}_${Date.now()}`,
      channel,
      deliveredAt: new Date().toISOString(),
    };
  }

  async verifyPaymentStatus(paymentId: string): Promise<{ status: 'CAPTURED' | 'FAILED' | 'PENDING'; amount: number }> {
    await this.delay();
    return {
      status: 'CAPTURED',
      amount: 4999,
    };
  }
}

export class RazorpayTestProvider implements IPaymentProvider {
  private keyId: string;
  private keySecret: string;

  constructor(keyId: string, keySecret: string) {
    this.keyId = keyId;
    this.keySecret = keySecret;
  }

  async createPaymentRetry(paymentId: string, amount: number, customer: Customer): Promise<PaymentRetryResult> {
    // In demo environment, simulates Razorpay Test API handshake
    await new Promise((res) => setTimeout(res, 600));
    return {
      success: true,
      transactionId: `rzp_test_pay_${Date.now()}`,
      amount,
      provider: 'RAZORPAY_TEST',
      settledAt: new Date().toISOString(),
    };
  }

  async createPaymentLink(eventId: string, amount: number, customer: Customer, description: string): Promise<PaymentLinkResult> {
    await new Promise((res) => setTimeout(res, 500));
    const linkId = `plink_test_${Date.now()}`;
    return {
      success: true,
      paymentLinkId: linkId,
      shortUrl: `https://rzp.io/l/${linkId}`,
      provider: 'RAZORPAY_TEST',
      expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    };
  }

  async sendRecoveryNotification(
    eventId: string, 
    customer: Customer, 
    channel: 'WHATSAPP' | 'SMS' | 'EMAIL', 
    message: string
  ): Promise<NotificationResult> {
    await new Promise((res) => setTimeout(res, 400));
    return {
      success: true,
      messageId: `rzp_msg_${Date.now()}`,
      channel,
      deliveredAt: new Date().toISOString(),
    };
  }

  async verifyPaymentStatus(paymentId: string): Promise<{ status: 'CAPTURED' | 'FAILED' | 'PENDING'; amount: number }> {
    return {
      status: 'CAPTURED',
      amount: 4999,
    };
  }
}
