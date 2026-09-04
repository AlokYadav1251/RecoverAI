import { z } from 'zod';
import { CampaignService } from '@/services/campaign.service';
import { withErrorHandler, successResponse, validateRequestBody } from '@/lib/api/response';

const createCampaignSchema = z.object({
  name: z.string().min(1, 'name is required'),
  filterType: z.enum(['ALL', 'PAYMENT_FAILURE', 'CHECKOUT_ABANDONMENT', 'SUBSCRIPTION_FAILURE', 'OVERDUE_INVOICE']),
});

export const GET = withErrorHandler(async () => {
  const campaigns = await CampaignService.getCampaigns();
  return successResponse(campaigns);
});

export const POST = withErrorHandler(async (req: Request) => {
  const payload = await validateRequestBody(req, createCampaignSchema);
  const campaign = await CampaignService.createCampaign(payload.name, payload.filterType);
  return successResponse(campaign, 'Campaign staged successfully', 201);
});
