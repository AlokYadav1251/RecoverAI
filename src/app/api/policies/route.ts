import { z } from 'zod';
import { RecoveryPolicyRepository } from '@/db/repositories';
import { withErrorHandler, successResponse, validateRequestBody } from '@/lib/api/response';

const updatePolicySchema = z.object({
  merchantId: z.string().optional().default('MERCHANT_DEFAULT'),
  maxPaymentRetries: z.number().min(1).max(10).optional(),
  maxSubscriptionRetries: z.number().min(1).max(10).optional(),
  maxReminders: z.number().min(1).max(10).optional(),
  minRetryIntervalHours: z.number().min(1).optional(),
  minReminderIntervalHours: z.number().min(1).optional(),
  maxAutomatedRecoveryAmount: z.number().min(0).optional(),
  autoApproveConfidenceScore: z.number().min(0).max(100).optional(),
  stopIfPaymentSuccess: z.boolean().optional(),
  stopIfInvoicePaid: z.boolean().optional(),
  stopIfSubscriptionRecovered: z.boolean().optional(),
  stopIfCustomerOptout: z.boolean().optional(),
  stopIfMaxAttemptsReached: z.boolean().optional(),
  stopIfManualReviewRequired: z.boolean().optional(),
  quietHoursEnabled: z.boolean().optional(),
  quietHoursStart: z.string().optional(),
  quietHoursEnd: z.string().optional(),
});

export const GET = withErrorHandler(async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const merchantId = searchParams.get('merchantId') || 'MERCHANT_DEFAULT';
  const policy = await RecoveryPolicyRepository.getPolicy(merchantId);
  return successResponse(policy);
});

export const PUT = withErrorHandler(async (req: Request) => {
  const payload = await validateRequestBody(req, updatePolicySchema);
  const current = await RecoveryPolicyRepository.getPolicy(payload.merchantId);
  const updated = await RecoveryPolicyRepository.updatePolicy({
    ...current,
    ...payload,
    updatedAt: new Date().toISOString(),
  });
  return successResponse(updated, 'Policy configuration updated');
});
