import { z } from 'zod';
import { AuditService } from '@/services/audit.service';
import { withErrorHandler, successResponse, validateRequestBody } from '@/lib/api/response';

const createAuditSchema = z.object({
  actor: z.string().min(1, 'actor is required'),
  actorType: z.enum(['AI_AGENT', 'MERCHANT', 'SYSTEM', 'POLICY_ENGINE']),
  eventId: z.string().optional(),
  campaignId: z.string().optional(),
  action: z.string().min(1, 'action is required'),
  reason: z.string().min(1, 'reason is required'),
  previousState: z.string().optional(),
  newState: z.string().optional(),
  policyResult: z.enum(['PASSED', 'BLOCKED', 'REQUIRES_APPROVAL', 'N/A']).optional(),
  toolCalled: z.string().optional(),
  toolResult: z.string().optional(),
  idempotencyKey: z.string().optional(),
  amount: z.number().optional(),
  recoveredAmount: z.number().optional(),
});

export const GET = withErrorHandler(async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const actorType = searchParams.get('actorType') as any;
  const eventId = searchParams.get('eventId') || undefined;
  const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined;

  const logs = await AuditService.getAuditLogs({
    actorType: actorType || undefined,
    eventId,
    limit,
  });

  return successResponse(logs);
});

export const POST = withErrorHandler(async (req: Request) => {
  const payload = await validateRequestBody(req, createAuditSchema);
  const log = await AuditService.log(payload);
  return successResponse(log, 'Audit log created', 201);
});
