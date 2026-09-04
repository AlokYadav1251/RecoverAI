import React, { useState } from 'react';
import { 
  RevenueRiskEvent, 
  InterventionType 
} from '@/types';
import { useRecoverStore } from '@/lib/store';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { StatusBadge, RiskBadge, TypeBadge, InterventionBadge } from '@/components/ui/Badge';
import { formatINR, formatDateTime, formatRelativeTime } from '@/lib/utils';
import { 
  Sparkles, 
  ShieldCheck, 
  User, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Send, 
  RefreshCw, 
  Link as LinkIcon, 
  StopCircle, 
  ArrowRight,
  TrendingUp,
  FileText
} from 'lucide-react';

interface EventDetailModalProps {
  event: RevenueRiskEvent | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({ event, isOpen, onClose }) => {
  const { analyzeEvent, approveEvent, executeRecovery, stopEventWorkflow } = useRecoverStore();
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'AI_REASONING' | 'WORKFLOW' | 'AUDIT'>('OVERVIEW');
  const [isExecuting, setIsExecuting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!event) return null;

  const handleAnalyze = async () => {
    setIsExecuting(true);
    setFeedbackMsg(null);
    try {
      await analyzeEvent(event.id);
      setFeedbackMsg({ type: 'success', text: 'AI root cause and recovery score updated.' });
    } catch {
      setFeedbackMsg({ type: 'error', text: 'Failed to analyze event.' });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleApprove = async () => {
    setIsExecuting(true);
    setFeedbackMsg(null);
    try {
      await approveEvent(event.id);
      setFeedbackMsg({ type: 'success', text: 'Merchant approval granted. Recovery scheduled.' });
    } catch {
      setFeedbackMsg({ type: 'error', text: 'Failed to approve event.' });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleExecuteAction = async (action: InterventionType) => {
    setIsExecuting(true);
    setFeedbackMsg(null);
    try {
      const success = await executeRecovery(event.id, action);
      if (success) {
        setFeedbackMsg({ type: 'success', text: `Action "${action}" succeeded. ${formatINR(event.amount)} confirmed recovered!` });
      } else {
        setFeedbackMsg({ type: 'error', text: `Action "${action}" executed within bounded policy limits.` });
      }
    } catch {
      setFeedbackMsg({ type: 'error', text: 'Execution error.' });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleStop = () => {
    stopEventWorkflow(event.id, 'Manually terminated by merchant operator in Event Inspector.');
    setFeedbackMsg({ type: 'error', text: 'Recovery workflow terminated.' });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      title={
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm text-slate-400">{event.id}</span>
          <TypeBadge type={event.type} />
          <StatusBadge status={event.status} />
          <RiskBadge level={event.riskLevel} />
        </div>
      }
      description={`Created ${formatDateTime(event.createdAt)} (${formatRelativeTime(event.createdAt)})`}
    >
      {/* Toast Feedback */}
      {feedbackMsg && (
        <div className={`mb-4 p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${
          feedbackMsg.type === 'success' 
            ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-300' 
            : 'bg-amber-950/80 border border-amber-800 text-amber-300'
        }`}>
          {feedbackMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-amber-400" />}
          {feedbackMsg.text}
        </div>
      )}

      {/* Hero Financial Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800 mb-6">
        <div>
          <div className="text-[11px] text-slate-400 uppercase tracking-wider font-mono">Revenue At Risk</div>
          <div className="text-2xl font-bold text-white mt-0.5">{formatINR(event.amount)}</div>
          <div className="text-[11px] text-rose-400 mt-0.5">Unsettled at gateway</div>
        </div>
        <div>
          <div className="text-[11px] text-slate-400 uppercase tracking-wider font-mono">Recovery Probability</div>
          <div className="text-2xl font-bold text-indigo-400 mt-0.5 flex items-center gap-1.5">
            {event.recoveryProbability}%
            <span className="text-xs font-normal text-slate-400">({event.aiDiagnosis?.confidence || 'HIGH'} Conf)</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">AI-assisted prediction</div>
        </div>
        <div>
          <div className="text-[11px] text-slate-400 uppercase tracking-wider font-mono">Expected Realization</div>
          <div className="text-2xl font-bold text-emerald-400 mt-0.5">{formatINR(event.predictedRecoverableAmount)}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Estimated payout</div>
        </div>
        <div>
          <div className="text-[11px] text-slate-400 uppercase tracking-wider font-mono">Money Actually Recovered</div>
          <div className={`text-2xl font-bold mt-0.5 ${event.status === 'RECOVERED' ? 'text-emerald-300' : 'text-slate-500'}`}>
            {formatINR(event.recoveredAmount || 0)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {event.status === 'RECOVERED' ? `✓ Settled via ${event.recoveryMethodUsed || 'Smart Retry'}` : 'Pending settlement'}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 mb-5 gap-1">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`px-4 py-2 text-xs font-medium border-b-2 transition-all cursor-pointer ${
            activeTab === 'OVERVIEW'
              ? 'border-indigo-500 text-indigo-300 bg-indigo-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Customer & Event Context
        </button>
        <button
          onClick={() => setActiveTab('AI_REASONING')}
          className={`px-4 py-2 text-xs font-medium border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'AI_REASONING'
              ? 'border-indigo-500 text-indigo-300 bg-indigo-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          AI Root Cause & Scoring Signals
        </button>
        <button
          onClick={() => setActiveTab('WORKFLOW')}
          className={`px-4 py-2 text-xs font-medium border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'WORKFLOW'
              ? 'border-indigo-500 text-indigo-300 bg-indigo-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          Bounded Workflow Timeline ({event.timeline.length})
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'OVERVIEW' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Customer Profile */}
          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 mb-3">
              <User className="w-4 h-4 text-indigo-400" />
              Customer Profile & Reliability
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Name</span>
                <span className="font-medium text-white">{event.customer.name}</span>
              </div>
              {event.customer.company && (
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Company</span>
                  <span className="font-medium text-indigo-300">{event.customer.company}</span>
                </div>
              )}
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Email</span>
                <span className="font-mono text-slate-300">{event.customer.email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Phone</span>
                <span className="font-mono text-slate-300">{event.customer.phone}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Payment Reliability Score</span>
                <span className="font-semibold text-emerald-400">{event.customer.paymentReliabilityScore}/100</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Historical Payments</span>
                <span className="text-slate-300">
                  <strong className="text-emerald-400">{event.customer.totalSuccessfulPayments}</strong> Success / <strong className="text-rose-400">{event.customer.totalFailedPayments}</strong> Failed
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Verified Lifetime Value (LTV)</span>
                <span className="font-bold text-white">{formatINR(event.customer.lifetimeValue)}</span>
              </div>
            </div>
          </div>

          {/* Technical Context */}
          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 mb-3">
              <FileText className="w-4 h-4 text-slate-400" />
              Technical Event Metadata
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Payment Method</span>
                <span className="font-mono text-slate-200">{event.paymentMethod || 'UPI Auto-Debit'}</span>
              </div>
              {event.bankCode && (
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Issuer Bank</span>
                  <span className="font-mono text-indigo-300">{event.bankCode}</span>
                </div>
              )}
              {event.paymentId && (
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Gateway Reference</span>
                  <span className="font-mono text-slate-300">{event.paymentId}</span>
                </div>
              )}
              {event.invoiceId && (
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Invoice ID</span>
                  <span className="font-mono text-slate-300">{event.invoiceId} ({event.daysOverdue} days overdue)</span>
                </div>
              )}
              {event.rawErrorCode && (
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Gateway Error Code</span>
                  <span className="font-mono text-rose-300 bg-rose-950/50 px-1.5 py-0.5 rounded border border-rose-900/50">{event.rawErrorCode}</span>
                </div>
              )}
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Retry Counter</span>
                <span className="font-mono text-slate-300">{event.retryCount} / {event.maxRetriesAllowed} max</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Reminder Counter</span>
                <span className="font-mono text-slate-300">{event.reminderCount} / {event.maxRemindersAllowed} max</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: AI Reasoning & Explainable Scoring */}
      {activeTab === 'AI_REASONING' && (
        <div className="space-y-4">
          {/* AI Root Cause Card */}
          <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-800/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300 font-mono">
                  Root Cause Diagnosis: {event.aiDiagnosis?.category || 'INSUFFICIENT_FUNDS'}
                </span>
              </div>
              <span className="text-xs font-medium text-indigo-300 bg-indigo-900/40 px-2 py-0.5 rounded border border-indigo-700/40">
                {event.aiDiagnosis?.confidence || 'HIGH'} Confidence
              </span>
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">{event.aiDiagnosis?.title || 'Temporary Balance Shortfall'}</h4>
            <p className="text-xs text-slate-300 leading-relaxed">{event.aiDiagnosis?.explanation}</p>
          </div>

          {/* Explainable Signals Breakdown */}
          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Explainable Score Decomposition (AI-Assisted Prediction)
              </h4>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                Score: {event.recoveryProbability}%
              </span>
            </div>
            <div className="space-y-2">
              {event.scoreFactors.map((f, i) => (
                <div 
                  key={i} 
                  className={`p-2.5 rounded-lg text-xs flex items-center justify-between border ${
                    f.impact === 'POSITIVE'
                      ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-200'
                      : 'bg-rose-950/20 border-rose-900/40 text-rose-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {f.impact === 'POSITIVE' ? (
                      <span className="text-emerald-400 font-bold font-mono text-sm">+</span>
                    ) : (
                      <span className="text-rose-400 font-bold font-mono text-sm">-</span>
                    )}
                    <span>{f.description}</span>
                  </div>
                  <span className="font-mono text-[11px] font-semibold opacity-80">
                    {f.weight > 0 ? `+${f.weight} pts` : `${f.weight} pts`}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 mt-3 italic">
              * Note: Prototype prediction calibrated on historical UPI/Card settlement velocity and customer transaction reliability.
            </p>
          </div>

          {/* Strategy Matrix Recommendation */}
          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 flex items-start justify-between gap-4">
            <div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-mono">Recommended Strategy</div>
              <div className="flex items-center gap-2 mt-1">
                <InterventionBadge action={event.recommendedIntervention} className="text-xs py-1 px-3 bg-indigo-950 border-indigo-700 text-indigo-200" />
                <span className="text-xs text-slate-300">
                  {event.aiDiagnosis?.delayHours ? `(Optimal wait: ${event.aiDiagnosis.delayHours} hours)` : ''}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">{event.interventionReasoning}</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleAnalyze}
              isLoading={isExecuting}
              className="text-xs shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" /> Re-Diagnose
            </Button>
          </div>
        </div>
      )}

      {/* Tab 3: Bounded Workflow Timeline */}
      {activeTab === 'WORKFLOW' && (
        <div className="space-y-4">
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
            {event.timeline.map((item) => (
              <div key={item.id} className="relative group">
                {/* Node Icon */}
                <div className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center border text-[10px] ${
                  item.status === 'COMPLETED'
                    ? 'bg-emerald-950 border-emerald-600 text-emerald-400'
                    : item.status === 'BLOCKED'
                    ? 'bg-rose-950 border-rose-600 text-rose-400'
                    : 'bg-slate-900 border-slate-700 text-slate-400'
                }`}>
                  {item.status === 'COMPLETED' ? '✓' : item.status === 'BLOCKED' ? '✕' : item.stage}
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white flex items-center gap-2">
                      {item.title}
                      <span className="text-[10px] font-normal text-slate-400 font-mono bg-slate-900 px-1.5 py-0.5 rounded">
                        {item.actor}
                      </span>
                    </span>
                    <span suppressHydrationWarning className="font-mono text-[11px] text-slate-500">{formatDateTime(item.timestamp)}</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Bounded Actions */}
      <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {event.status !== 'RECOVERED' && event.status !== 'STOPPED' && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleStop}
              className="text-rose-400 border-rose-900/50 hover:bg-rose-950/40 text-xs"
            >
              <StopCircle className="w-3.5 h-3.5 mr-1" /> Stop Recovery
            </Button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {event.status === 'AWAITING_APPROVAL' && (
            <Button
              variant="glow"
              size="sm"
              onClick={handleApprove}
              isLoading={isExecuting}
            >
              <ShieldCheck className="w-4 h-4 mr-1.5 text-slate-950" /> Approve & Schedule
            </Button>
          )}

          {event.status !== 'RECOVERED' && event.status !== 'STOPPED' && (
            <>
              {event.recommendedIntervention === 'SMART_RETRY' && (
                <Button
                  variant="emerald"
                  size="sm"
                  onClick={() => handleExecuteAction('SMART_RETRY')}
                  isLoading={isExecuting}
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Execute Smart Retry
                </Button>
              )}
              {event.recommendedIntervention === 'PAYMENT_LINK' && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleExecuteAction('PAYMENT_LINK')}
                  isLoading={isExecuting}
                >
                  <LinkIcon className="w-3.5 h-3.5 mr-1.5" /> Generate Payment Link
                </Button>
              )}
              {event.recommendedIntervention === 'RECOVERY_REMINDER' && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleExecuteAction('RECOVERY_REMINDER')}
                  isLoading={isExecuting}
                >
                  <Send className="w-3.5 h-3.5 mr-1.5" /> Send Smart Reminder
                </Button>
              )}
            </>
          )}

          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
