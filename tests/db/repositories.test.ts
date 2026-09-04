import { describe, it, expect, beforeEach } from 'vitest';
import { seedDatabase } from '@/db/seed';
import {
  CustomerRepository,
  PaymentRepository,
  RevenueRiskEventRepository,
  RecoveryPolicyRepository,
  AuditLogRepository,
} from '@/db/repositories';

describe('Database Repositories', () => {
  beforeEach(() => {
    seedDatabase();
  });

  it('should find customers by id and email', async () => {
    const customer = await CustomerRepository.findById('CUST-1001');
    expect(customer).toBeDefined();
    expect(customer?.name).toBe('Aditi Sharma');

    const byEmail = await CustomerRepository.findByEmail('aditi.sharma@gmail.com');
    expect(byEmail).toBeDefined();
    expect(byEmail?.id).toBe('CUST-1001');
  });

  it('should query payments with status filters', async () => {
    const allPayments = await PaymentRepository.findAll();
    expect(allPayments.length).toBeGreaterThanOrEqual(250);

    const failedPayments = await PaymentRepository.findAll({ status: 'FAILED' });
    expect(failedPayments.length).toBeGreaterThan(0);

    const capturedPayments = await PaymentRepository.findAll({ status: 'CAPTURED' });
    expect(capturedPayments.length).toBeGreaterThan(0);
  });

  it('should query revenue risk events by type and status', async () => {
    const events = await RevenueRiskEventRepository.findAll();
    expect(events.length).toBeGreaterThanOrEqual(200);

    const paymentFailures = await RevenueRiskEventRepository.findAll({ type: 'PAYMENT_FAILURE' });
    expect(paymentFailures.length).toBeGreaterThan(0);

    const heroEvent = await RevenueRiskEventRepository.findById('EVT-HERO-4999');
    expect(heroEvent).toBeDefined();
    expect(heroEvent?.amount).toBe(4999);
  });

  it('should retrieve and update recovery policies', async () => {
    const policy = await RecoveryPolicyRepository.getPolicy('MERCHANT_DEFAULT');
    expect(policy).toBeDefined();
    expect(policy.maxPaymentRetries).toBe(3);

    const updated = await RecoveryPolicyRepository.updatePolicy({
      ...policy,
      maxPaymentRetries: 4,
    });
    expect(updated.maxPaymentRetries).toBe(4);
  });

  it('should create and retrieve audit logs', async () => {
    const initialCount = await AuditLogRepository.count();
    await AuditLogRepository.create({
      id: `AUD_TEST_${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: 'Test Runner',
      actorType: 'SYSTEM',
      action: 'TEST_ACTION',
      reason: 'Testing audit repository creation',
      policyResult: 'PASSED',
    });

    const newCount = await AuditLogRepository.count();
    expect(newCount).toBe(initialCount + 1);
  });
});
