import { db } from '../inMemoryDatabase';
import { generateDeterministicSeedData, SeedDataResult } from './seedDataGenerator';

export function seedDatabase(): SeedDataResult {
  db.clear();
  const seed = generateDeterministicSeedData();

  // Populate Database
  seed.merchants.forEach((m) => db.merchants.set(m.id, m));
  seed.users.forEach((u) => db.users.set(u.id, u));
  seed.customers.forEach((c) => db.customers.set(c.id, c));
  seed.payments.forEach((p) => db.payments.set(p.id, p));
  seed.paymentAttempts.forEach((a) => db.paymentAttempts.set(a.id, a));
  seed.checkoutSessions.forEach((s) => db.checkoutSessions.set(s.id, s));
  seed.subscriptions.forEach((s) => db.subscriptions.set(s.id, s));
  seed.invoices.forEach((i) => db.invoices.set(i.id, i));
  seed.revenueRiskEvents.forEach((e) => db.revenueRiskEvents.set(e.id, e));
  seed.recoveryAttempts.forEach((a) => {
    db.recoveryAttempts.set(a.id, a);
    db.idempotencyKeys.add(a.idempotencyKey);
  });
  seed.recoveryCampaigns.forEach((c) => db.recoveryCampaigns.set(c.id, c));
  seed.campaignItems.forEach((item) => db.campaignItems.set(item.id, item));
  seed.aiDecisions.forEach((d) => db.aiDecisions.set(d.eventId, d));
  seed.agentActions.forEach((a) => db.agentActions.set(a.id, a));
  seed.notifications.forEach((n) => db.notifications.set(n.id, n));
  seed.recoveryPolicies.forEach((p) => db.recoveryPolicies.set(p.merchantId, p));
  seed.auditLogs.forEach((l) => db.auditLogs.push(l));
  db.persist();

  return seed;
}

// Auto-seed on first import
if (db.customers.size === 0) {
  seedDatabase();
}
