import { PaymentMethod } from '@/types/database';

export interface CreatePaymentRequest {
  merchantId: string;
  customerId: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  idempotencyKey: string;
  notes?: Record<string, string>;
}

export interface PaymentResult {
  success: boolean;
  paymentId: string;
  transactionId?: string;
  amount: number;
  currency: string;
  status: 'CAPTURED' | 'FAILED' | 'PENDING';
  provider: 'MOCK' | 'RAZORPAY_TEST';
  errorCode?: string;
  errorMessage?: string;
  settledAt?: string;
}

export interface PaymentDetails {
  id: string;
  amount: number;
  currency: string;
  status: 'AUTHORIZED' | 'CAPTURED' | 'FAILED' | 'REFUNDED';
  paymentMethod: PaymentMethod;
  customerEmail: string;
  createdAt: string;
}

export interface RetryPaymentRequest {
  paymentId: string;
  idempotencyKey: string;
  forcedFailure?: boolean;
  retryAttemptNumber?: number;
}

export interface CreatePaymentLinkRequest {
  merchantId: string;
  customerId: string;
  eventId: string;
  amount: number;
  currency: string;
  description: string;
  expiresInHours?: number;
  idempotencyKey: string;
}

export interface PaymentLinkResult {
  success: boolean;
  paymentLinkId: string;
  shortUrl: string;
  amount: number;
  currency: string;
  expiresAt: string;
  provider: 'MOCK' | 'RAZORPAY_TEST';
}

export interface PaymentVerificationResult {
  verified: boolean;
  paymentId: string;
  amount: number;
  status: 'CAPTURED' | 'FAILED' | 'PENDING';
  settledAt?: string;
}

export interface IPaymentProvider {
  readonly providerName: 'MOCK' | 'RAZORPAY_TEST';
  createPayment(request: CreatePaymentRequest): Promise<PaymentResult>;
  getPayment(paymentId: string): Promise<PaymentDetails | null>;
  retryPayment(request: RetryPaymentRequest): Promise<PaymentResult>;
  createPaymentLink(request: CreatePaymentLinkRequest): Promise<PaymentLinkResult>;
  verifyPayment(paymentId: string): Promise<PaymentVerificationResult>;
}
