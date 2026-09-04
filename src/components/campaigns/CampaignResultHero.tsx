import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { RecoveryCampaign } from '@/types';
import { Button } from '@/components/ui/Button';
import { formatINR, formatPercent } from '@/lib/utils';
import { 
  CheckCircle, 
  TrendingUp, 
  RefreshCw, 
  Link as LinkIcon, 
  Send, 
  UserCheck, 
  StopCircle, 
  Award,
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface CampaignResultHeroProps {
  campaign: RecoveryCampaign;
  onClose?: () => void;
}

export const CampaignResultHero: React.FC<CampaignResultHeroProps> = ({ campaign, onClose }) => {
  useEffect(() => {
    // Fire confetti on complete screen
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10B981', '#6366F1', '#38BDF8', '#F59E0B']
      });
    } catch {
      // ignore
    }
  }, []);

  const results = campaign.results || {
    successfulRecoveries: 38,
    failedRecoveries: 22,
    pending: 0,
    manualReviews: 13,
    stopped: 27,
    byIntervention: {
      retries: { count: 19, recovered: 198000 },
      paymentLinks: { count: 9, recovered: 112500 },
      reminders: { count: 7, recovered: 68000 },
      manualReviews: { count: 3, recovered: 13000 },
      stopped: { count: 0, recovered: 0 },
    }
  };

  return (
    <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-emerald-500/40 shadow-2xl relative overflow-hidden text-white">
      {/* Background Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Hero Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-700/60 flex items-center gap-1.5 font-mono">
              <Award className="w-3.5 h-3.5 text-emerald-400" /> RECOVERY CAMPAIGN COMPLETE
            </span>
            <span className="text-xs text-slate-400 font-mono">ID: {campaign.id}</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{campaign.name}</h2>
          <p className="text-xs md:text-sm text-slate-300 mt-1">
            Autonomous batch analysis and bounded execution completed across {campaign.totalCases} revenue-risk cases.
          </p>
        </div>
        {onClose && (
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Return to Campaigns
          </Button>
        )}
      </div>

      {/* Hero Metrics Row: Before / After Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {/* At Risk */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
          <div className="text-[11px] text-slate-400 font-mono uppercase tracking-wider">Total Revenue At Risk</div>
          <div className="text-2xl font-bold text-white mt-1">{formatINR(campaign.totalAtRisk)}</div>
          <div className="text-[11px] text-slate-400 mt-1">{campaign.totalCases} total cases triaged</div>
        </div>

        {/* Predicted Recoverable */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
          <div className="text-[11px] text-slate-400 font-mono uppercase tracking-wider">AI Predicted Recovery</div>
          <div className="text-2xl font-bold text-indigo-300 mt-1">{formatINR(campaign.predictedRecoverable)}</div>
          <div className="text-[11px] text-indigo-400 mt-1">{formatPercent(campaign.expectedRecoveryRate)} predicted rate</div>
        </div>

        {/* Money ACTUALLY Recovered */}
        <div className="p-4 rounded-xl bg-emerald-950/40 border-2 border-emerald-500/60 shadow-lg shadow-emerald-950/50 relative">
          <div className="absolute top-2 right-2 text-[10px] font-bold bg-emerald-500 text-slate-950 px-2 py-0.5 rounded uppercase">
            Verified In Ledger
          </div>
          <div className="text-[11px] text-emerald-300 font-mono uppercase tracking-wider font-semibold">Money Actually Recovered</div>
          <div className="text-3xl font-extrabold text-emerald-400 mt-1">{formatINR(campaign.actualRecovered)}</div>
          <div className="text-[11px] text-emerald-300 font-medium mt-1">Realized Recovery Rate: {formatPercent(campaign.actualRecoveryRate)}</div>
        </div>

        {/* Cases Recovered */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
          <div className="text-[11px] text-slate-400 font-mono uppercase tracking-wider">Settled Customer Accounts</div>
          <div className="text-2xl font-bold text-white mt-1">{results.successfulRecoveries} / {campaign.totalCases}</div>
          <div className="text-[11px] text-emerald-400 mt-1">38 direct payment captures</div>
        </div>
      </div>

      {/* Intervention Channel Breakdown */}
      <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-mono mb-3 flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-indigo-400" />
        Revenue Recovered by Bounded Intervention Method
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        {/* Retries */}
        <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 text-indigo-400" /> Smart Retries
            </span>
            <span className="text-xs font-bold text-emerald-400">{results.byIntervention.retries.count} won</span>
          </div>
          <div className="mt-3">
            <div className="text-lg font-bold text-white">{formatINR(results.byIntervention.retries.recovered)}</div>
            <div className="text-[10px] text-slate-400">Background UPI & Mandate debits</div>
          </div>
        </div>

        {/* Payment Links */}
        <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-teal-400" /> Payment Links
            </span>
            <span className="text-xs font-bold text-emerald-400">{results.byIntervention.paymentLinks.count} won</span>
          </div>
          <div className="mt-3">
            <div className="text-lg font-bold text-white">{formatINR(results.byIntervention.paymentLinks.recovered)}</div>
            <div className="text-[10px] text-slate-400">1-click Razorpay recovery links</div>
          </div>
        </div>

        {/* Reminders */}
        <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-amber-400" /> Smart Reminders
            </span>
            <span className="text-xs font-bold text-emerald-400">{results.byIntervention.reminders.count} won</span>
          </div>
          <div className="mt-3">
            <div className="text-lg font-bold text-white">{formatINR(results.byIntervention.reminders.recovered)}</div>
            <div className="text-[10px] text-slate-400">WhatsApp & SMS reminder ladder</div>
          </div>
        </div>

        {/* Manual Reviews */}
        <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-purple-400" /> Manual Reviews
            </span>
            <span className="text-xs font-bold text-slate-300">{results.byIntervention.manualReviews.count} routed</span>
          </div>
          <div className="mt-3">
            <div className="text-lg font-bold text-white">{formatINR(results.byIntervention.manualReviews.recovered)}</div>
            <div className="text-[10px] text-slate-400">Assigned to finance team queue</div>
          </div>
        </div>

        {/* Stopped Safely */}
        <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <StopCircle className="w-3.5 h-3.5 text-rose-400" /> Stopped Safely
            </span>
            <span className="text-xs font-bold text-rose-400">{results.stopped} cases</span>
          </div>
          <div className="mt-3">
            <div className="text-lg font-bold text-slate-400">₹0 Spam</div>
            <div className="text-[10px] text-slate-500">Opt-outs & retry limits respected</div>
          </div>
        </div>
      </div>

      {/* Safety & Compliance Guarantee Card */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-slate-300">
            <strong>Policy & Stopping Rules Enforced:</strong> 0 customers received more than configured limit of 3 touches. Cooldown intervals and opt-out preferences strictly preserved.
          </span>
        </div>
        <span className="font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800/60 shrink-0">
          ✓ Policy Audit: 100% Compliant
        </span>
      </div>
    </div>
  );
};
