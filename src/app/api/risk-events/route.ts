import { z } from 'zod';
import { RevenueRiskService } from '@/services/revenueRisk.service';
import { withErrorHandler, successResponse, validateRequestBody } from '@/lib/api/response';
import { db } from '@/db/inMemoryDatabase';
import '@/db/seed';

const createRiskEventSchema = z.object({
  customerId: z.string().min(1, 'customerId is required'),
  type: z.enum(['PAYMENT_FAILURE', 'CHECKOUT_ABANDONMENT', 'SUBSCRIPTION_FAILURE', 'OVERDUE_INVOICE']),
  amount: z.number().positive('amount must be positive'),
  currency: z.string().optional().default('INR'),
  paymentId: z.string().optional(),
  checkoutSessionId: z.string().optional(),
  subscriptionId: z.string().optional(),
  invoiceId: z.string().optional(),
  rawErrorCode: z.string().optional(),
});

export const GET = withErrorHandler(async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') as any;
  const status = searchParams.get('status') as any;
  const minAmount = searchParams.get('minAmount') ? Number(searchParams.get('minAmount')) : undefined;

  const events = await RevenueRiskService.getRiskEvents({
    type: type || undefined,
    status: status || undefined,
    minAmount,
  });

  const eventsWithCustomers = events.map((event) => ({
    ...event,
    customer: db.customers.get(event.customerId) || null,
  }));
  return successResponse(eventsWithCustomers, 'Risk events retrieved successfully');
});

export const POST = withErrorHandler(async (req: Request) => {
  const payload = await validateRequestBody(req, createRiskEventSchema);
  const event = await RevenueRiskService.createRiskEvent(payload);
  return successResponse(event, 'Revenue risk event created', 201);
});
