'use client';

import React, { useState } from 'react';
import { useRecoverStore } from '@/lib/store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatINR } from '@/lib/utils';
import { 
  SlidersHorizontal, 
  ShieldCheck, 
  Clock, 
  StopCircle, 
  AlertTriangle, 
  CheckCircle2, 
  Save, 
  Layers,
  ArrowRight,
  FlaskConical,
  TrendingUp,
  Users,
  IndianRupee,
  Activity
} from 'lucide-react';

export default function PoliciesPage() {
  const { policy, updatePolicy } = useRecoverStore();
  const [formData, setFormData] = useState(policy);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [simulationRun, setSimulationRun] = useState(false);

  const simulation = {
    currentRecoveryRate: Math.min(94, 61 + (100 - formData.autoApproveConfidenceScore) * 0.42 + formData.maxPaymentRetries * 2.4),
    baselineRecoveryRate: 78.4,
    recoveredRevenue: Math.round(184000 + formData.maxPaymentRetries * 17200 - formData.autoApproveConfidenceScore * 640),
    savedCustomers: Math.round(126 + formData.maxPaymentRetries * 11 - (formData.autoApproveConfidenceScore - 80) * 1.4),
    manualReviews: Math.max(18, Math.round(74 + (formData.autoApproveConfidenceScore - 80) * 2.8)),
  };

  const recoveryDelta = simulation.currentRecoveryRate - simulation.baselineRecoveryRate;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updatePolicy(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Policy & Stopping Boundaries
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              Active Guardrails
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure safety thresholds, retry limits, cooldown intervals, and stopping rules enforced before any recovery action executes.
          </p>
        </div>

        <Button variant="glow" size="md" type="submit" className="text-xs">
          <Save className="w-3.5 h-3.5 mr-1.5 text-slate-950" />
          Save Policy Bounds
        </Button>
      </div>

      {saveSuccess && (
        <div className="p-3 rounded-lg bg-emerald-950 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Policy guardrails updated and synchronized across all active agent workers.
        </div>
      )}

      {/* Grid: Bounded Parameters & Stopping Toggles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Quantitative Limits */}
        <Card>

        <Card className="overflow-hidden border-teal-800/70 bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950/40">
          <CardHeader className="border-teal-900/70">
            <div>
              <CardTitle>
                <FlaskConical className="w-4 h-4 text-teal-300" />
                What-If Recovery Simulator
              </CardTitle>
              <p className="text-xs text-slate-400 mt-1">Project the next 30 days using your unsaved guardrail changes.</p>
            </div>
            <Button
              type="button"
              variant="glow"
              size="sm"
              onClick={() => setSimulationRun(true)}
            >
              <Activity className="w-3.5 h-3.5" />
              Run 30-day simulation
            </Button>
          </CardHeader>
          <CardContent className="p-5">
            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_2fr] gap-6 items-center">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">Auto-approval confidence</span>
                  <span className="font-mono font-bold text-teal-300">{formData.autoApproveConfidenceScore}%</span>
                </div>
                <input
                  aria-label="Simulation auto-approval confidence"
                  type="range"
                  min="50"
                  max="99"
                  value={formData.autoApproveConfidenceScore}
                  onChange={(e) => {
                    setSimulationRun(false);
                    setFormData({ ...formData, autoApproveConfidenceScore: Number(e.target.value) });
                  }}
                  className="w-full accent-teal-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>More recovery</span>
                  <span>More protection</span>
                </div>
                <div className="rounded-lg border border-teal-900/80 bg-slate-950/50 p-3 text-[11px] text-slate-400">
                  <span className="font-semibold text-teal-300">Policy trade-off:</span> lowering the threshold lets the agent act on more recoverable cases, while increasing manual-review exposure.
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="min-w-0 rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                  <TrendingUp className="w-4 h-4 text-emerald-400 mb-2" />
                  <p className="text-[10px] text-slate-500 uppercase tracking-wide break-words">Recovery rate</p>
                  <p className="text-xl font-bold text-white mt-1 break-words">{simulation.currentRecoveryRate.toFixed(1)}%</p>
                  <p className={`text-[10px] mt-1 break-words ${recoveryDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {recoveryDelta >= 0 ? '+' : ''}{recoveryDelta.toFixed(1)}% vs baseline
                  </p>
                </div>
                <div className="min-w-0 rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                  <IndianRupee className="w-4 h-4 text-amber-400 mb-2" />
                  <p className="text-[10px] text-slate-500 uppercase tracking-wide break-words">Recovered revenue</p>
                  <p className="text-xl font-bold text-white mt-1 break-words">{formatINR(simulation.recoveredRevenue)}</p>
                  <p className="text-[10px] text-slate-500 mt-1 break-words">projected / 30 days</p>
                </div>
                <div className="min-w-0 rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                  <Users className="w-4 h-4 text-sky-400 mb-2" />
                  <p className="text-[10px] text-slate-500 uppercase tracking-wide break-words">Customers saved</p>
                  <p className="text-xl font-bold text-white mt-1 break-words">{simulation.savedCustomers}</p>
                  <p className="text-[10px] text-slate-500 mt-1 break-words">accounts retained</p>
                </div>
                <div className="min-w-0 rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                  <ShieldCheck className="w-4 h-4 text-indigo-400 mb-2" />
                  <p className="text-[10px] text-slate-500 uppercase tracking-wide break-words">Manual reviews</p>
                  <p className="text-xl font-bold text-white mt-1 break-words">{simulation.manualReviews}</p>
                  <p className="text-[10px] text-slate-500 mt-1 break-words">human checkpoints</p>
                </div>
              </div>
            </div>
            {simulationRun && (
              <div className="mt-5 flex items-start gap-2 rounded-lg border border-emerald-800/70 bg-emerald-950/30 px-3 py-2.5 text-xs text-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Simulation complete.</strong> The agent recommends this policy because it projects {formatINR(simulation.recoveredRevenue)} recovered while preserving {simulation.manualReviews} human checkpoints for ambiguous cases.</span>
              </div>
            )}
          </CardContent>
        </Card>
          <CardHeader>
            <CardTitle>
              <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
              Bounded Workflow Thresholds
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Max Payment Retries
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={formData.maxPaymentRetries}
                  onChange={(e) => setFormData({ ...formData, maxPaymentRetries: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Maximum retry attempts for UPI/Card failures</span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Max Subscription Retries
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={formData.maxSubscriptionRetries}
                  onChange={(e) => setFormData({ ...formData, maxSubscriptionRetries: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Mandate recurring presentation attempts</span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Max Customer Reminders
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={formData.maxReminders}
                  onChange={(e) => setFormData({ ...formData, maxReminders: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">WhatsApp / SMS touchpoints before stopping</span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Min Retry Cooldown (Hours)
                </label>
                <input
                  type="number"
                  min="1"
                  max="48"
                  value={formData.minRetryIntervalHours}
                  onChange={(e) => setFormData({ ...formData, minRetryIntervalHours: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Minimum delay between payment attempts</span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Max Automated Recovery Amount (INR)
                </label>
                <input
                  type="number"
                  step="1000"
                  value={formData.maxAutomatedRecoveryAmount}
                  onChange={(e) => setFormData({ ...formData, maxAutomatedRecoveryAmount: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Above this amount, merchant approval is mandatory</span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Auto-Approval Confidence Threshold
                </label>
                <input
                  type="number"
                  min="50"
                  max="99"
                  value={formData.autoApproveConfidenceScore}
                  onChange={(e) => setFormData({ ...formData, autoApproveConfidenceScore: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Min AI score (%) required for zero-touch retry</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right: Stopping Rules Toggles */}
        <Card>
          <CardHeader>
            <CardTitle>
              <StopCircle className="w-4 h-4 text-rose-400" />
              Automated Stopping Rules
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="space-y-3">
              {[
                {
                  key: 'stopIfPaymentSuccess',
                  label: 'STOP_IF_PAYMENT_SUCCESS',
                  desc: 'Immediately stop all recovery actions as soon as a payment is captured.',
                },
                {
                  key: 'stopIfInvoicePaid',
                  label: 'STOP_IF_INVOICE_PAID',
                  desc: 'Cease reminders and escalation as soon as an invoice is marked paid.',
                },
                {
                  key: 'stopIfSubscriptionRecovered',
                  label: 'STOP_IF_SUBSCRIPTION_RECOVERED',
                  desc: 'Halt recurring debits once the active billing period is funded.',
                },
                {
                  key: 'stopIfCustomerOptout',
                  label: 'STOP_IF_CUSTOMER_OPTOUT',
                  desc: 'Permanently block automated recovery messages if customer opts out.',
                },
                {
                  key: 'stopIfMaxAttemptsReached',
                  label: 'STOP_IF_MAX_ATTEMPTS_REACHED',
                  desc: 'Prevent customer spam by locking actions after 3 attempts.',
                },
                {
                  key: 'stopIfManualReviewRequired',
                  label: 'STOP_IF_MANUAL_REVIEW_REQUIRED',
                  desc: 'Pause automation and route complex edge cases to human finance queues.',
                },
              ].map((rule) => (
                <label 
                  key={rule.key} 
                  className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-start justify-between gap-3 cursor-pointer hover:bg-slate-950 transition-colors"
                >
                  <div className="space-y-0.5">
                    <span className="font-mono text-xs font-bold text-white block">{rule.label}</span>
                    <span className="text-[11px] text-slate-400 block">{rule.desc}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={(formData as any)[rule.key]}
                    onChange={(e) => setFormData({ ...formData, [rule.key]: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700 mt-1 cursor-pointer"
                  />
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Escalation Level Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Compliant Customer Escalation Ladder
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] font-mono text-indigo-400 font-bold">LEVEL 0</span>
              <h5 className="font-semibold text-white">Event Detection</h5>
              <p className="text-[11px] text-slate-400">Webhook received and ingested into Risk Inbox.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] font-mono text-teal-400 font-bold">LEVEL 1</span>
              <h5 className="font-semibold text-white">Gentle Recovery</h5>
              <p className="text-[11px] text-slate-400">Smart background retry or 1-click payment link.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] font-mono text-amber-400 font-bold">LEVEL 2</span>
              <h5 className="font-semibold text-white">Second Touch</h5>
              <p className="text-[11px] text-slate-400">Polite reminder sent via WhatsApp after 24h cooldown.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] font-mono text-rose-400 font-bold">LEVEL 3</span>
              <h5 className="font-semibold text-white">Final Reminder</h5>
              <p className="text-[11px] text-slate-400">Final urgent payment notice before account pause.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 space-y-1">
              <span className="text-[10px] font-mono text-emerald-400 font-bold">LEVEL 4 / STOP</span>
              <h5 className="font-semibold text-white">Finance Team / Stop</h5>
              <p className="text-[11px] text-slate-300">Escalate high-value cases to AE or stop safely.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
