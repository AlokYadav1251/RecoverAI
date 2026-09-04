import { RevenueRiskService } from '@/services/revenueRisk.service';
import { withErrorHandler, successResponse } from '@/lib/api/response';
import { AppError } from '@/lib/api/errors';

export const GET = withErrorHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const event = await RevenueRiskService.getRiskEventById(id);
  if (!event) {
    throw AppError.notFound(`Risk event ${id} not found`);
  }
  return successResponse(event, 'Risk event details retrieved');
});
