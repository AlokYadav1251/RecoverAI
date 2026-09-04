import { z } from 'zod';
import { RecoveryService } from '@/services/recovery.service';
import { withErrorHandler, successResponse, validateRequestBody } from '@/lib/api/response';

const recoverActionSchema = z.object({
  interventionType: z.enum([
    'SMART_RETRY',
    'PAYMENT_LINK',
    'RECOVERY_REMINDER',
    'PERSONALIZED_DISCOUNT_LINK',
    'FINANCE_ESCALATION',
    'MANUAL_REVIEW',
    'DO_NOT_CONTACT',
  ]),
  idempotencyKey: z.string().min(1, 'idempotencyKey is required'),
});

export const POST = withErrorHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const payload = await validateRequestBody(req, recoverActionSchema);

  const result = await RecoveryService.executeRecoveryAction({
    eventId: id,
    interventionType: payload.interventionType,
    idempotencyKey: payload.idempotencyKey,
    actor: 'Merchant API',
  });

  return successResponse(result, result.message, result.success ? 200 : 400);
});
