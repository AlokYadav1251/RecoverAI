'use client';

import React, { useState } from 'react';
import { useRecoverStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { CampaignResultHero } from '@/components/campaigns/CampaignResultHero';
import { RecoveryCampaign, RevenueRiskType } from '@/types';
import { formatINR, formatPercent, formatDateTime } from '@/lib/utils';
import { 
  Layers, 
  Sparkles, 
  ShieldCheck, 
  Play, 
  CheckCircle2, 
  RefreshCw, 
  Link as LinkIcon, 
  Send, 
  UserCheck, 
  StopCircle, 
  TrendingUp, 
  Award,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

export default function CampaignsPage() {
  const { 
    campaigns, 
    events, 
    createCampaign, 
    approveCampaign, 
    executeCampaignBatch, 
    runHeroBatchCampaignDemo,
    isProcessingHeroDemo 
  } = useRecoverStore();

  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<RevenueRiskType | 'ALL'>('ALL');
  const [campaignName, setCampaignName] = useState('End-of-Month Autonomous Revenue Sweep');
  const [stagedCampaign, setStagedCampaign] = useState<RecoveryCampaign | null>(null);
  const [activeRunningId, setActiveRunningId] = useState<string | null>(null);
  const [activeCompletedCampaign, setActiveCompletedCampaign] = useState<RecoveryCampaign | null>(null);

  const handleStartWizard = () => {
    const newCamp = createCampaign(campaignName, selectedFilter);
    setStagedCampaign(newCamp);
    setIsCreatingCampaign(false);
  };

  const handleApproveStaged = async () => {
    if (!stagedCampaign) return;
    approveCampaign(stagedCampaign.id);
    setActiveRunningId(stagedCampaign.id);
    
    // Execute live batch
    await executeCampaignBatch(stagedCampaign.id);
    
    const updated = campaigns.find(c => c.id === stagedCampaign.id) || stagedCampaign;
    setActiveRunningId(null);
    setStagedCampaign(null);
    setActiveCompletedCampaign(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Recovery Campaigns Hub
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
              Batch AI Execution
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Analyze, stage, approve, and execute autonomous recovery workflows across hundreds of revenue-risk cases simultaneously.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="glow"
            size="md"
            onClick={runHeroBatchCampaignDemo}
            isLoading={isProcessingHeroDemo}
            className="text-xs"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-slate-950" />
            1-Click Hero Batch Demo (₹8.4L At Risk)
          </Button>

          <Button
            variant="secondary"
            size="md"
            onClick={() => setIsCreatingCampaign(true)}
            className="text-xs"
          >
            <Layers className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
            New Recovery Campaign
          </Button>
        </div>
      </div>

      {/* Hero Completed Screen if Active */}
      {activeCompletedCampaign && (
        <CampaignResultHero
          campaign={activeCompletedCampaign}
          onClose={() => setActiveCompletedCampaign(null)}
        />
      )}

      {/* Live Running Progress Card */}
      {activeRunningId && (
        <Card className="border-indigo-500/50 bg-gradient-to-r from-indigo-950/80 via-slate-900 to-emerald-950/80 shadow-2xl">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <RefreshCw className="w-5 h-5 text-emerald-400 animate-spin" />
                <div>
                  <h3 className="font-bold text-base text-white">Live Autonomous Batch Execution in Progress...</h3>
                  <p className="text-xs text-slate-300">Bounded AI Agent processing cases with real-time policy and contact limits.</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded border border-emerald-800/80">
                ACTIVE
              </span>
            </div>

            <ProgressBar value={75} max={100} variant="gradient" size="lg" showLabel />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400">Successful Recoveries</span>
                <div className="font-bold text-emerald-400 text-sm mt-0.5">18 captured</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400">Failed / Retries</span>
                <div className="font-bold text-slate-300 text-sm mt-0.5">8 logged</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400">Manual Reviews</span>
                <div className="font-bold text-amber-400 text-sm mt-0.5">5 assigned</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400">Policy Stops</span>
                <div className="font-bold text-rose-400 text-sm mt-0.5">6 stopped</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Staged Campaign Approval Gate Card */}
      {stagedCampaign && (
        <Card className="border-indigo-500/60 bg-gradient-to-b from-indigo-950/40 via-slate-900 to-slate-950 shadow-2xl">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <div>
                  <CardTitle>AI Batch Triage Proposal: {stagedCampaign.name}</CardTitle>
                  <p className="text-xs text-slate-300 mt-0.5">
                    AI Agent evaluated {stagedCampaign.totalCases} cases and segmented them into bounded recovery buckets.
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/80 px-2.5 py-1 rounded border border-amber-800/80">
                AWAITING MERCHANT APPROVAL
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Financial Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                <div className="text-[11px] text-slate-400 font-mono uppercase">Revenue At Risk</div>
                <div className="text-2xl font-bold text-white mt-1">{formatINR(stagedCampaign.totalAtRisk)}</div>
                <div className="text-[11px] text-slate-400 mt-1">{stagedCampaign.totalCases} total cases</div>
              </div>
              <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-800/50">
                <div className="text-[11px] text-indigo-300 font-mono uppercase">Expected Recoverable Revenue</div>
                <div className="text-2xl font-bold text-indigo-300 mt-1">{formatINR(stagedCampaign.predictedRecoverable)}</div>
                <div className="text-[11px] text-indigo-400 mt-1">{formatPercent(stagedCampaign.expectedRecoveryRate)} realization rate</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                <div className="text-[11px] text-slate-400 font-mono uppercase">Policy & Safety Bounds</div>
                <div className="text-sm font-semibold text-emerald-400 mt-1">100% Compliant</div>
                <div className="text-[11px] text-slate-400 mt-1">Max 3 retries • 2h cooldown</div>
              </div>
            </div>

            {/* Triage Segmentation Matrix */}
            <div>
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono mb-3">
                Autonomous Intervention Segmentation
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center gap-1.5 font-semibold text-indigo-300">
                    <RefreshCw className="w-3.5 h-3.5" /> Smart Retries
                  </div>
                  <div className="text-xl font-bold text-white mt-2">{stagedCampaign.triage.retries} cases</div>
                  <div className="text-[10px] text-slate-400 mt-1">Background UPI & mandates</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center gap-1.5 font-semibold text-teal-300">
                    <LinkIcon className="w-3.5 h-3.5" /> Payment Links
                  </div>
                  <div className="text-xl font-bold text-white mt-2">{stagedCampaign.triage.paymentLinks} cases</div>
                  <div className="text-[10px] text-slate-400 mt-1">1-click Razorpay links</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center gap-1.5 font-semibold text-amber-300">
                    <Send className="w-3.5 h-3.5" /> Smart Reminders
                  </div>
                  <div className="text-xl font-bold text-white mt-2">{stagedCampaign.triage.reminders} cases</div>
                  <div className="text-[10px] text-slate-400 mt-1">WhatsApp & SMS ladder</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center gap-1.5 font-semibold text-purple-300">
                    <UserCheck className="w-3.5 h-3.5" /> Manual Reviews
                  </div>
                  <div className="text-xl font-bold text-white mt-2">{stagedCampaign.triage.manualReviews} cases</div>
                  <div className="text-[10px] text-slate-400 mt-1">Assigned to finance team</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center gap-1.5 font-semibold text-rose-300">
                    <StopCircle className="w-3.5 h-3.5" /> Do Not Contact
                  </div>
                  <div className="text-xl font-bold text-white mt-2">{stagedCampaign.triage.doNotContact} cases</div>
                  <div className="text-[10px] text-slate-400 mt-1">Opt-outs & high risk</div>
                </div>
              </div>
            </div>

            {/* Merchant Approval Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>By approving, the agent will execute actions strictly within configured policy limits.</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setStagedCampaign(null)}>
                  Cancel
                </Button>
                <Button variant="glow" size="md" onClick={handleApproveStaged}>
                  <ShieldCheck className="w-4 h-4 mr-1.5 text-slate-950" />
                  Approve & Execute Campaign
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Campaigns History & Active List */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Layers className="w-4 h-4 text-indigo-400" />
            Campaigns Registry & Historical Yields
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-800/60">
            {campaigns.map((camp) => (
              <div 
                key={camp.id} 
                className="p-5 hover:bg-slate-900/40 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs text-slate-400 font-semibold">{camp.id}</span>
                    <span className="text-sm font-bold text-white">{camp.name}</span>
                    <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded ${
                      camp.status === 'COMPLETED' 
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
                        : 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                    }`}>
                      {camp.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 flex flex-wrap items-center gap-3">
                    <span>Filter: <strong className="text-slate-300">{camp.filterType}</strong></span>
                    <span>•</span>
                    <span>Cases: <strong className="text-slate-300">{camp.totalCases}</strong></span>
                    <span>•</span>
                    <span>Created: <strong className="text-slate-300">{formatDateTime(camp.createdAt)}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-6 self-end md:self-auto">
                  <div className="text-right">
                    <div className="text-[11px] text-slate-400 font-mono">Revenue At Risk</div>
                    <div className="text-sm font-semibold text-white">{formatINR(camp.totalAtRisk)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] text-emerald-400 font-mono font-semibold">Actually Recovered</div>
                    <div className="text-base font-extrabold text-emerald-400">
                      {formatINR(camp.actualRecovered || 0)}
                    </div>
                    <div className="text-[10px] text-emerald-300/80">{formatPercent(camp.actualRecoveryRate || 0)} rate</div>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setActiveCompletedCampaign(camp)}
                    className="text-xs"
                  >
                    View Hero Report <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* New Campaign Creation Modal */}
      <Modal
        isOpen={isCreatingCampaign}
        onClose={() => setIsCreatingCampaign(false)}
        size="lg"
        title={
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <span>Configure Autonomous Recovery Campaign</span>
          </div>
        }
        description="Select criteria to ingest revenue-at-risk cases and run batch AI triage."
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono block mb-1.5">
              Campaign Name
            </label>
            <input
              type="text"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono block mb-1.5">
              Target Revenue Risk Category
            </label>
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Revenue Risk Events (Payment Failures, Checkouts, Subscriptions, Invoices)</option>
              <option value="PAYMENT_FAILURE">Payment Failures Only (UPI & Cards)</option>
              <option value="CHECKOUT_ABANDONMENT">Checkout Abandonments Only (High Intent Drop-offs)</option>
              <option value="SUBSCRIPTION_FAILURE">Subscription Mandate Failures Only</option>
              <option value="OVERDUE_INVOICE">Overdue B2B Commercial Invoices Only</option>
            </select>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 space-y-1.5">
            <div className="font-semibold text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Autonomous AI Triage Engine
            </div>
            <p className="text-[11px] text-slate-400">
              The agent will analyze each event against customer lifetime value, historical payment reliability, and error transience to select optimal recovery channels.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsCreatingCampaign(false)}>
              Cancel
            </Button>
            <Button variant="glow" size="sm" onClick={handleStartWizard}>
              <Sparkles className="w-3.5 h-3.5 mr-1 text-slate-950" />
              Stage & Run AI Batch Triage
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
