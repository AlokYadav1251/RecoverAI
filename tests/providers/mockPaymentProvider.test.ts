import { describe, it, expect, beforeEach } from 'vitest';
import { MockPaymentProvider } from '@/services/providers/mockPaymentProvider';
import { seedDatabase } from '@/db/seed';

describe('MockPaymentProvider', () => {
  let provider: MockPaymentProvider;

  beforeEach(() => {
    seedDatabase();
    provider = new MockPaymentProvider({ simulatedLatencyMs: 0 });
  });

  it('should successfully simulate payment creation', async () => {
    const result = await provider.createPayment({
      merchantId: 'MERCHANT_DEFAULT',
      customerId: 'CUST-1001',
      amount: 4999,
      currency: 'INR',
      paymentMethod: 'UPI',
      idempotencyKey: 'IDEMP_TEST_PAY_1',
    });

    expect(result.success).toBe(true);
    expect(result.amount).toBe(4999);
    expect(result.provider).toBe('MOCK');
    expect(result.status).toBe('CAPTURED');
  });

  it('should block payment creation for opted-out customer', async () => {
    const result = await provider.createPayment({
      merchantId: 'MERCHANT_DEFAULT',
      customerId: 'CUST-1042', // Opted-out seed customer
      amount: 12500,
      currency: 'INR',
      paymentMethod: 'CREDIT_CARD',
      idempotencyKey: 'IDEMP_TEST_OPTOUT',
    });

    expect(result.success).toBe(false);
    expect(result.status).toBe('FAILED');
    expect(result.errorCode).toBe('CUSTOMER_OPTED_OUT');
  });

  it('should successfully simulate payment retry', async () => {
    const result = await provider.retryPayment({
      paymentId: 'pay_hero_99182',
      idempotencyKey: 'IDEMP_RETRY_1',
    });

    expect(result.success).toBe(true);
    expect(result.status).toBe('CAPTURED');
    expect(result.transactionId).toBeDefined();
  });

  it('should handle forced failure on retry', async () => {
    const result = await provider.retryPayment({
      paymentId: 'pay_hero_99182',
      idempotencyKey: 'IDEMP_RETRY_FAIL',
      forcedFailure: true,
    });

    expect(result.success).toBe(false);
    expect(result.status).toBe('FAILED');
    expect(result.errorCode).toBe('BANK_DECLINED');
  });

  it('should create 1-click payment links with valid URL', async () => {
    const link = await provider.createPaymentLink({
      merchantId: 'MERCHANT_DEFAULT',
      customerId: 'CUST-1002',
      eventId: 'EVT-HERO-8500',
      amount: 8500,
      currency: 'INR',
      description: 'Cart Recovery',
      idempotencyKey: 'IDEMP_LINK_1',
    });

    expect(link.success).toBe(true);
    expect(link.shortUrl).toContain('https://rzp.io/i/');
    expect(link.amount).toBe(8500);
  });
});
