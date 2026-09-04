import { describe, it, expect, beforeEach } from 'vitest';
import { seedDatabase } from '@/db/seed';
import { db } from '@/db/inMemoryDatabase';
import { RevenueRiskService } from '@/services/revenueRisk.service';
import { RecoveryService } from '@/services/recovery.service';
import { CampaignService } from '@/services/campaign.service';
import { AuditService } from '@/services/audit.service';
import { AIProviderFactory } from '@/services/providers/aiProviderFactory';
import { PolicyEngine } from '@/lib/policyEngine';
import { INITIAL_POLICY } from '@/lib/seedData';
import { RevenueRiskEvent } from '@/types';

describe('Hero E2E Recovery Scenarios (Razorpay Track 03)', () => {
  beforeEach(() => {
    seedDatabase();
  });

  it('1. Single Payment Recovery Flow: ₹4,999 Insufficient Funds -> Diagnose -> Policy -> Approve -> Execute -> Recover -> Stop -> Audit', async () => {
    // 1. Fetch ₹4,999 Payment Failure Event
    const eventRecord = await RevenueRiskService.getRiskEventById('EVT-HERO-4999');
    expect(eventRecord).toBeDefined();
    expect(eventRecord?.amount).toBe(4999);
    expect(eventRecord?.status).toBe('RECOMMENDED');

    const customer = db.customers.get(eventRecord!.customerId);
    expect(customer).toBeDefined();

    // 2. AI Root Cause Diagnosis
    const aiProvider = AIProviderFactory.getProvider();
    const diagnosis = await aiProvider.diagnoseAndRecommend({
      id: eventRecord!.id,
      type: eventRecord!.type,
      amount: eventRecord!.amount,
      rawErrorCode: eventRecord!.rawErrorCode,
      retryCount: eventRecord!.retryCount,
      reminderCount: eventRecord!.reminderCount,
      customer: {
        name: customer!.name,
        email: customer!.email,
        company: customer!.company,
        lifetimeValue: customer!.lifetimeValue,
        paymentReliabilityScore: customer!.paymentReliabilityScore,
        totalSuccessfulPayments: customer!.totalSuccessfulPayments,
        totalFailedPayments: customer!.totalFailedPayments,
        isOptedOut: customer!.isOptedOut,
      },
    });

    expect(diagnosis.rootCause).toBe('insufficient_funds');
    expect(diagnosis.recoveryProbability).toBe(87);
    expect(diagnosis.recommendedAction).toBe('SMART_RETRY');
    expect(diagnosis.expectedRecoveryAmount).toBe(4349);
    expect(diagnosis.positiveSignals.length).toBeGreaterThan(0);

    // 3. Policy Engine Validation
    const mockUIEvent: RevenueRiskEvent = {
      id: eventRecord!.id,
      type: eventRecord!.type,
      customerId: customer!.id,
      customer: customer as any,
      amount: eventRecord!.amount,
      currency: eventRecord!.currency,
      status: eventRecord!.status,
      riskLevel: eventRecord!.riskLevel,
      recoveryProbability: diagnosis.recoveryProbability,
      predictedRecoverableAmount: diagnosis.expectedRecoveryAmount,
      scoreFactors: [],
      recommendedIntervention: diagnosis.recommendedAction,
      interventionReasoning: diagnosis.reason,
      retryCount: eventRecord!.retryCount,
      maxRetriesAllowed: eventRecord!.maxRetriesAllowed,
      reminderCount: eventRecord!.reminderCount,
      maxRemindersAllowed: eventRecord!.maxRemindersAllowed,
      escalationLevel: eventRecord!.escalationLevel,
      recoveredAmount: eventRecord!.recoveredAmount,
      timeline: [],
      createdAt: eventRecord!.createdAt,
      updatedAt: eventRecord!.updatedAt,
    };

    const policyCheck = PolicyEngine.validateAction(mockUIEvent, diagnosis.recommendedAction, INITIAL_POLICY);
    expect(policyCheck.allowed).toBe(true);

    // 4. Merchant Approval & Execution
    const idempKey = `IDEMP_HERO_TEST_${Date.now()}`;
    const execution = await RecoveryService.executeRecoveryAction({
      eventId: eventRecord!.id,
      interventionType: diagnosis.recommendedAction,
      idempotencyKey: idempKey,
      actor: 'Merchant Operator',
    });

    expect(execution.success).toBe(true);
    expect(execution.recoveredAmount).toBe(4999);
    expect(execution.status).toBe('RECOVERED');

    // 5. Verify Stopping Rule
    const updatedEvent = await RevenueRiskService.getRiskEventById('EVT-HERO-4999');
    expect(updatedEvent?.status).toBe('RECOVERED');
    expect(updatedEvent?.recoveredAmount).toBe(4999);

    const stoppingCheck = PolicyEngine.shouldStopWorkflow(
      { ...mockUIEvent, status: 'RECOVERED' },
      INITIAL_POLICY
    );
    expect(stoppingCheck.stop).toBe(true);
    expect(stoppingCheck.reason).toBe('Payment successfully captured.');

    // 6. Verify Audit Trail Recorded
    const auditLogs = await AuditService.getEventAuditTrace('EVT-HERO-4999');
    expect(auditLogs.some((l) => l.action === 'RECOVERY_ACTION_SUCCESS')).toBe(true);
  });

  it('2. Policy Limit Rule: Attempt 4th retry must be BLOCKED with maximum retries exceeded', async () => {
    const eventRecord = await RevenueRiskService.getRiskEventById('EVT-HERO-4999');
    const customer = db.customers.get(eventRecord!.customerId);

    const eventWith3Retries: RevenueRiskEvent = {
      id: eventRecord!.id,
      type: 'PAYMENT_FAILURE',
      customerId: customer!.id,
      customer: customer as any,
      amount: 4999,
      currency: 'INR',
      status: 'IN_PROGRESS',
      riskLevel: 'LOW',
      recoveryProbability: 87,
      predictedRecoverableAmount: 4349,
      scoreFactors: [],
      recommendedIntervention: 'SMART_RETRY',
      interventionReasoning: '',
      retryCount: 3, // Already reached limit
      maxRetriesAllowed: 3,
      reminderCount: 0,
      maxRemindersAllowed: 3,
      escalationLevel: 3,
      recoveredAmount: 0,
      timeline: [],
      createdAt: eventRecord!.createdAt,
      updatedAt: eventRecord!.updatedAt,
    };

    const policyResult = PolicyEngine.validateAction(eventWith3Retries, 'SMART_RETRY', INITIAL_POLICY);
    expect(policyResult.allowed).toBe(false);
    expect(policyResult.ruleCode).toBe('MAX_RETRIES_EXCEEDED');
    expect(policyResult.reason).toContain('Maximum retry limit (3) reached');
  });

  it('3. Customer Opt-Out Rule: Must be BLOCKED when customer is opted out', async () => {
    const event = await RevenueRiskService.getRiskEventById('EVT-HERO-4999');
    const customer = db.customers.get(event!.customerId);
    const optedOutCust = { ...customer!, isOptedOut: true };

    const optedOutEvent: RevenueRiskEvent = {
      id: event!.id,
      type: 'PAYMENT_FAILURE',
      customerId: customer!.id,
      customer: optedOutCust as any,
      amount: 4999,
      currency: 'INR',
      status: 'AT_RISK',
      riskLevel: 'LOW',
      recoveryProbability: 0,
      predictedRecoverableAmount: 0,
      scoreFactors: [],
      recommendedIntervention: 'DO_NOT_CONTACT',
      interventionReasoning: '',
      retryCount: 0,
      maxRetriesAllowed: 3,
      reminderCount: 0,
      maxRemindersAllowed: 3,
      escalationLevel: 0,
      recoveredAmount: 0,
      timeline: [],
      createdAt: event!.createdAt,
      updatedAt: event!.updatedAt,
    };

    const policyResult = PolicyEngine.validateAction(optedOutEvent, 'SMART_RETRY', INITIAL_POLICY);
    expect(policyResult.allowed).toBe(false);
    expect(policyResult.ruleCode).toBe('CUSTOMER_OPTED_OUT');
  });

  it('4. Idempotency Rule: Duplicate recovery requests must be BLOCKED', async () => {
    const idempKey = 'IDEMP_DUPLICATE_CHECK_KEY_123';

    const first = await RecoveryService.executeRecoveryAction({
      eventId: 'EVT-HERO-8500',
      interventionType: 'PAYMENT_LINK',
      idempotencyKey: idempKey,
    });
    expect(first.success).toBe(true);

    const second = await RecoveryService.executeRecoveryAction({
      eventId: 'EVT-HERO-8500',
      interventionType: 'PAYMENT_LINK',
      idempotencyKey: idempKey,
    });
    expect(second.message).toContain('Duplicate request ignored');
  });

  it('5. Batch Campaign: 100 cases, ₹8,40,000 at risk, calculated from confirmed records', async () => {
    const campaign = await CampaignService.createCampaign('Hero Batch Campaign Demo', 'ALL');
    expect(campaign.totalCases).toBeGreaterThanOrEqual(100);
    expect(campaign.totalAtRisk).toBe(840000);
    expect(campaign.predictedRecoverable).toBe(472000);

    const approved = await CampaignService.approveCampaign(campaign.id);
    expect(approved.status).toBe('AWAITING_APPROVAL');
  });
});

