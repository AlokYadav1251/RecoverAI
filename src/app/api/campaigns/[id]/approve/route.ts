import { CampaignService } from '@/services/campaign.service';
import { withErrorHandler, successResponse } from '@/lib/api/response';

export const POST = withErrorHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const campaign = await CampaignService.approveCampaign(id);
  return successResponse(campaign, 'Campaign approved for execution');
});
