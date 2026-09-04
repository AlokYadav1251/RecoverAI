import { describe, it, expect, beforeEach } from 'vitest';
import { seedDatabase } from '@/db/seed';
import { RevenueRiskService } from '@/services/revenueRisk.service';
import { PaymentService } from '@/services/payment.service';
import { RecoveryService } from '@/services/recovery.service';
import { CampaignService } from '@/services/campaign.service';
import { AuditService } from '@/services/audit.service';

describe('Service Layer Boundaries', () => {
  beforeEach(() => {
    seedDatabase();
  });

  it('RevenueRiskService should create risk event and log audit trail', async () => {
    const event = await RevenueRiskService.createRiskEvent({
      customerId: 'CUST-1001',
      type: 'PAYMENT_FAILURE',
      amount: 4999,
      rawErrorCode: 'INSUFFICIENT_FUNDS',
    });

    expect(event).toBeDefined();
    expect(event.status).toBe('AT_RISK');
    expect(event.amount).toBe(4999);

    const logs = await AuditService.getEventAuditTrace(event.id);
    expect(logs.length).toBeGreaterThan(0);
    expect(logs[0].action).toBe('RISK_EVENT_CREATED');
  });

  it('PaymentService should create payment and retry payment safely', async () => {
    const payment = await PaymentService.createPayment({
      merchantId: 'MERCHANT_DEFAULT',
      customerId: 'CUST-1001',
      amount: 2999,
      currency: 'INR',
      paymentMethod: 'UPI',
      idempotencyKey: 'IDEMP_PAY_SRV_1',
    });

    expect(payment.success).toBe(true);

    const retryResult = await PaymentService.retryPayment(payment.paymentId, 'IDEMP_RETRY_SRV_1');
    expect(retryResult.success).toBe(true);
  });

  it('RecoveryService should enforce idempotency and block duplicate executions', async () => {
    const idempKey = 'IDEMP_RECOVERY_UNIQUE_99';

    const first = await RecoveryService.executeRecoveryAction({
      eventId: 'EVT-HERO-4999',
      interventionType: 'SMART_RETRY',
      idempotencyKey: idempKey,
    });

    expect(first.success).toBe(true);
    expect(first.recoveredAmount).toBe(4999);
    expect(first.status).toBe('RECOVERED');

    // Second call with same idempotency key
    const second = await RecoveryService.executeRecoveryAction({
      eventId: 'EVT-HERO-4999',
      interventionType: 'SMART_RETRY',
      idempotencyKey: idempKey,
    });

    // Must recognize duplicate and return previous result safely
    expect(second.message).toContain('Duplicate request ignored');
  });

  it('CampaignService should stage campaigns and allow merchant approval', async () => {
    const staged = await CampaignService.createCampaign('Q3 Win-back Sprint', 'PAYMENT_FAILURE');
    expect(staged.status).toBe('ANALYZED');
    expect(staged.totalCases).toBeGreaterThan(0);

    const approved = await CampaignService.approveCampaign(staged.id, 'Merchant Admin');
    expect(approved.status).toBe('AWAITING_APPROVAL');
  });
});
