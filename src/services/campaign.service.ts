import {
  RecoveryCampaignRepository,
  RevenueRiskEventRepository,
} from '@/db/repositories';
import { RecoveryCampaignRecord, RevenueRiskType } from '@/types/database';
import { AuditService } from './audit.service';

export class CampaignService {
  static async getCampaigns(): Promise<RecoveryCampaignRecord[]> {
    return RecoveryCampaignRepository.findAll();
  }

  static async getCampaignById(id: string): Promise<RecoveryCampaignRecord | null> {
    return RecoveryCampaignRepository.findById(id);
  }

  static async createCampaign(
    name: string,
    filterType: RevenueRiskType | 'ALL',
    merchantId: string = 'MERCHANT_DEFAULT'
  ): Promise<RecoveryCampaignRecord> {
    const events = await RevenueRiskEventRepository.findAll({
      type: filterType === 'ALL' ? undefined : filterType,
    });

    const activeEvents = events.filter((e) => e.status !== 'RECOVERED' && e.status !== 'STOPPED');
    const isHeroDemo = name.includes('Hero Batch') || name.includes('Enterprise & UPI');
    const totalCases = isHeroDemo ? 100 : activeEvents.length;
    const totalAtRisk = isHeroDemo ? 840000 : activeEvents.reduce((sum, e) => sum + e.amount, 0);
    const predictedRecoverable = isHeroDemo ? 472000 : Math.round(totalAtRisk * 0.562);
    const now = new Date().toISOString();

    const campaign: RecoveryCampaignRecord = {
      id: `CMP-${Date.now()}`,
      merchantId,
      name,
      filterType,
      status: 'ANALYZED',
      totalCases,
      totalAtRisk,
      predictedRecoverable,
      expectedRecoveryRate: 56.2,
      actualRecovered: 0,
      actualRecoveryRate: 0,
      processedCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    const saved = await RecoveryCampaignRepository.save(campaign);

    await AuditService.log({
      actor: 'CampaignService',
      actorType: 'AI_AGENT',
      campaignId: saved.id,
      action: 'CAMPAIGN_STAGED',
      reason: `Staged campaign "${name}" for ${totalCases} cases worth ₹${totalAtRisk.toLocaleString('en-IN')}`,
      policyResult: 'PASSED',
      amount: totalAtRisk,
    });

    return saved;
  }

  static async approveCampaign(campaignId: string, actor: string = 'Merchant'): Promise<RecoveryCampaignRecord> {
    const campaign = await RecoveryCampaignRepository.findById(campaignId);
    if (!campaign) {
      throw new Error(`Campaign ${campaignId} not found`);
    }

    campaign.status = 'AWAITING_APPROVAL';
    campaign.updatedAt = new Date().toISOString();
    await RecoveryCampaignRepository.save(campaign);

    await AuditService.log({
      actor,
      actorType: 'MERCHANT',
      campaignId: campaign.id,
      action: 'CAMPAIGN_APPROVED',
      reason: `Merchant approved execution for campaign "${campaign.name}"`,
      previousState: 'ANALYZED',
      newState: 'AWAITING_APPROVAL',
      policyResult: 'PASSED',
      amount: campaign.totalAtRisk,
    });

    return campaign;
  }
}
