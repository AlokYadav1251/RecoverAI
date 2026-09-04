import { z } from 'zod';
import { RevenueRiskService } from '@/services/revenueRisk.service';
import { AIProviderFactory } from '@/services/providers/aiProviderFactory';
import { RecoveryService } from '@/services/recovery.service';
import { AuditService } from './../../../../services/audit.service';
import { withErrorHandler, successResponse, validateRequestBody } from '@/lib/api/response';
import { db } from '@/db/inMemoryDatabase';
import '@/db/seed';

const webhookPayloadSchema = z.object({
  event: z.enum([
    'payment.failed',
    'checkout.abandoned',
    'subscription.failed',
    'invoice.overdue',
  ]),
  payload: z.object({
    payment: z.object({
      entity: z.object({
        id: z.string(),
        amount: z.number(),
        currency: z.string().default('INR'),
        status: z.string(),
        method: z.string().optional(),
        error_code: z.string().optional(),
        error_description: z.string().optional(),
        email: z.string().optional(),
        contact: z.string().optional(),
      }),
    }).optional(),
    subscription: z.object({
      entity: z.object({
        id: z.string(),
        plan_id: z.string().optional(),
        status: z.string(),
      }),
    }).optional(),
    invoice: z.object({
      entity: z.object({
        id: z.string(),
        amount: z.number().optional(),
        status: z.string(),
      }),
    }).optional(),
  }),
  simulator: z.object({
    customerName: z.string().trim().min(1).optional(),
    customerEmail: z.string().trim().email().optional(),
    amount: z.number().positive().optional(),
    failureReason: z.string().trim().min(1).optional(),
  }).optional(),
});

export const POST = withErrorHandler(async (req: Request) => {
  const body = await validateRequestBody(req, webhookPayloadSchema);
  const now = new Date().toISOString();

  // Handle both Razorpay payloads and simulator payloads through one persistence path.
  if (body.payload.payment?.entity || body.simulator) {
    const payment = body.payload.payment?.entity;
    const amountINR = body.simulator?.amount ?? (payment!.amount > 1000 ? Math.round(payment!.amount / 100) : payment!.amount);
    const email = body.simulator?.customerEmail || payment?.email || '';
    const failureReason = body.simulator?.failureReason || payment?.error_code || 'INSUFFICIENT_FUNDS';

    // Match or create customer
    let customer = Array.from(db.customers.values()).find(
      (c) => email && c.email.toLowerCase() === email.toLowerCase()
    );

    if (!customer) {
      customer = {
        id: `CUST-WH-${Date.now()}`,
        merchantId: 'MERCHANT_DEFAULT',
        name: body.simulator?.customerName || (email ? email.split('@')[0] : 'Webhook Customer'),
        email: email || `webhook_${Date.now()}@example.com`,
        phone: payment?.contact || '+91 98000 00000',
        lifetimeValue: amountINR * 3,
        paymentReliabilityScore: 82,
        totalSuccessfulPayments: 3,
        totalFailedPayments: 1,
        isOptedOut: false,
        createdAt: now,
        updatedAt: now,
      };
      db.customers.set(customer.id, customer);
    }

    // Ingest Risk Event
    const riskEvent = await RevenueRiskService.createRiskEvent({
      customerId: customer.id,
      type: body.event === 'payment.failed' ? 'PAYMENT_FAILURE' : body.event === 'checkout.abandoned' ? 'CHECKOUT_ABANDONMENT' : body.event === 'subscription.failed' ? 'SUBSCRIPTION_FAILURE' : 'OVERDUE_INVOICE',
      amount: amountINR,
      currency: payment?.currency || 'INR',
      paymentId: payment?.id,
      rawErrorCode: failureReason,
    });

    // Run AI Diagnosis
    const aiProvider = AIProviderFactory.getProvider();
    const diagnosis = await aiProvider.diagnoseAndRecommend({
      id: riskEvent.id,
      type: riskEvent.type,
      amount: riskEvent.amount,
      rawErrorCode: riskEvent.rawErrorCode,
      retryCount: riskEvent.retryCount,
      reminderCount: riskEvent.reminderCount,
      customer: {
        name: customer.name,
        email: customer.email,
        company: customer.company,
        lifetimeValue: customer.lifetimeValue,
        paymentReliabilityScore: customer.paymentReliabilityScore,
        totalSuccessfulPayments: customer.totalSuccessfulPayments,
        totalFailedPayments: customer.totalFailedPayments,
        isOptedOut: customer.isOptedOut,
      },
    });

    // Save AI Decision
    db.aiDecisions.set(riskEvent.id, {
      id: `DEC-${Date.now()}`,
      eventId: riskEvent.id,
      rootCauseCategory: diagnosis.rootCause,
      rootCauseTitle: diagnosis.rootCauseTitle,
      explanation: diagnosis.reason,
      recoveryProbability: diagnosis.recoveryProbability,
      confidenceLevel: diagnosis.confidenceLevel,
      recommendedAction: diagnosis.recommendedAction,
      recommendedDelayHours: diagnosis.recommendedDelayHours,
      scoreFactors: diagnosis.positiveSignals.map((sig) => ({
        impact: 'POSITIVE',
        description: sig,
        weight: 20,
      })),
      createdAt: now,
    });

    // If auto-approved (high confidence and <= 50,000 INR), execute bounded recovery
    let executionResult = null;
    if (diagnosis.recoveryProbability >= 80 && riskEvent.amount <= 50000 && !customer.isOptedOut) {
      executionResult = await RecoveryService.executeRecoveryAction({
        eventId: riskEvent.id,
        interventionType: diagnosis.recommendedAction,
        idempotencyKey: `IDEMP_WH_${riskEvent.id}`,
        actor: 'Autonomous Agent (Auto-Policy)',
      });
    }

    db.persist();

    return successResponse(
      {
        webhookEvent: body.event,
        riskEventId: riskEvent.id,
        riskEvent,
        customer,
        diagnosis,
        executionResult,
      },
      'Webhook processed and revenue-risk workflow executed',
      200
    );
  }

  // 2. Fallback for other events
  await AuditService.log({
    actor: 'Razorpay Webhook',
    actorType: 'SYSTEM',
    action: 'WEBHOOK_RECEIVED',
    reason: `Received unhandled webhook event: ${body.event}`,
    policyResult: 'N/A',
  });

  return successResponse({ received: true, event: body.event }, 'Webhook received');
});
