import { describe, it, expect } from 'vitest';
import { generateDeterministicSeedData } from '@/db/seed/seedDataGenerator';

describe('Deterministic Seed Data Generator', () => {
  const seed = generateDeterministicSeedData();

  it('should generate at least 100+ customers', () => {
    expect(seed.customers.length).toBeGreaterThanOrEqual(100);
    // Check Indian names & currency
    expect(seed.customers.some((c) => c.name.includes('Sharma'))).toBe(true);
    expect(seed.customers.some((c) => c.name.includes('Verma'))).toBe(true);
  });

  it('should generate at least 250+ payments with mixed status', () => {
    expect(seed.payments.length).toBeGreaterThanOrEqual(250);
    const failed = seed.payments.filter((p) => p.status === 'FAILED');
    const captured = seed.payments.filter((p) => p.status === 'CAPTURED');
    expect(failed.length).toBeGreaterThan(0);
    expect(captured.length).toBeGreaterThan(0);
  });

  it('should include all 4 revenue-risk categories', () => {
    const types = new Set(seed.revenueRiskEvents.map((e) => e.type));
    expect(types.has('PAYMENT_FAILURE')).toBe(true);
    expect(types.has('CHECKOUT_ABANDONMENT')).toBe(true);
    expect(types.has('SUBSCRIPTION_FAILURE')).toBe(true);
    expect(types.has('OVERDUE_INVOICE')).toBe(true);
  });

  it('should have diverse recovery outcomes and not make everything recovered', () => {
    const statuses = new Set(seed.revenueRiskEvents.map((e) => e.status));
    expect(statuses.has('RECOVERED')).toBe(true);
    expect(statuses.has('AT_RISK') || statuses.has('RECOMMENDED')).toBe(true);
    expect(statuses.has('STOPPED')).toBe(true);

    const recoveredCount = seed.revenueRiskEvents.filter((e) => e.status === 'RECOVERED').length;
    const totalCount = seed.revenueRiskEvents.length;
    const recoveryRate = (recoveredCount / totalCount) * 100;
    // Should be realistic (~20% to 60%, not 100%)
    expect(recoveryRate).toBeGreaterThan(15);
    expect(recoveryRate).toBeLessThan(70);
  });

  it('should include deterministic hero events with exact amounts', () => {
    const hero4999 = seed.revenueRiskEvents.find((e) => e.id === 'EVT-HERO-4999');
    expect(hero4999).toBeDefined();
    expect(hero4999?.amount).toBe(4999);

    const hero8500 = seed.revenueRiskEvents.find((e) => e.id === 'EVT-HERO-8500');
    expect(hero8500).toBeDefined();
    expect(hero8500?.amount).toBe(8500);

    const hero150k = seed.revenueRiskEvents.find((e) => e.id === 'EVT-HERO-150000');
    expect(hero150k).toBeDefined();
    expect(hero150k?.amount).toBe(150000);
  });
});
