import { z } from 'zod';
import { RecoveryService } from '@/services/recovery.service';
import { withErrorHandler, successResponse, validateRequestBody } from '@/lib/api/response';

const stopWorkflowSchema = z.object({
  reason: z.string().min(1, 'Reason for stopping recovery is required'),
});

export const POST = withErrorHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const payload = await validateRequestBody(req, stopWorkflowSchema);

  const event = await RecoveryService.stopWorkflow(id, payload.reason);
  return successResponse(event, 'Recovery workflow stopped successfully');
});
