'use client';

import React, { useState } from 'react';
import { useRecoverStore } from '@/lib/store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatDateTime, formatRelativeTime, formatINR, formatTimeOnly } from '@/lib/utils';
import { 
  ScrollText, 
  Search, 
  Filter, 
  ShieldCheck, 
  Terminal, 
  Bot, 
  User, 
  Layers, 
  Key,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Download
} from 'lucide-react';
import { ActorType } from '@/types';

export default function AuditPage() {
  const { auditLogs } = useRecoverStore();
  const [search, setSearch] = useState('');
  const [actorFilter, setActorFilter] = useState<ActorType | 'ALL'>('ALL');

  const filteredLogs = auditLogs.filter((log) => {
    if (actorFilter !== 'ALL' && log.actorType !== actorFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        log.action.toLowerCase().includes(q) ||
        log.reason.toLowerCase().includes(q) ||
        log.actor.toLowerCase().includes(q) ||
        log.eventId?.toLowerCase().includes(q) ||
        log.idempotencyKey?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const exportAuditJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `recoverai_audit_log_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Audit Trail & Agent Activity Trace
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
              Immutable Log
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete cryptographic audit trail of every AI root cause diagnosis, policy validation, merchant approval, and financial execution.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={exportAuditJSON}
          className="text-xs"
        >
          <Download className="w-3.5 h-3.5 mr-1.5" />
          Export JSON Audit
        </Button>
      </div>

      {/* Filter Bar */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search audit actions, reasons, event IDs, or idempotency keys..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-mono text-[11px]">Actor:</span>
            {[
              { id: 'ALL', label: 'All Actors' },
              { id: 'AI_AGENT', label: 'AI Agent' },
              { id: 'POLICY_ENGINE', label: 'Policy Engine' },
              { id: 'MERCHANT', label: 'Merchant' },
              { id: 'SYSTEM', label: 'System' },
            ].map((a) => (
              <button
                key={a.id}
                onClick={() => setActorFilter(a.id as any)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                  actorFilter === a.id
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Audit Stream Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">Timestamp / ID</th>
                  <th className="px-4 py-3">Actor & Type</th>
                  <th className="px-4 py-3">Action & State Change</th>
                  <th className="px-4 py-3">Policy Verification</th>
                  <th className="px-4 py-3">Tool & Idempotency Key</th>
                  <th className="px-4 py-3 text-right">Settlement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="px-4 py-3.5 align-top">
                      <div suppressHydrationWarning className="font-mono text-[11px] font-semibold text-slate-300">{formatTimeOnly(log.timestamp)}</div>
                      <div suppressHydrationWarning className="text-[10px] text-slate-500 font-mono">{formatDateTime(log.timestamp)}</div>
                      <div className="text-[9px] text-slate-600 font-mono mt-0.5">{log.id}</div>
                    </td>

                    <td className="px-4 py-3.5 align-top">
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        {log.actorType === 'AI_AGENT' ? (
                          <Bot className="w-3.5 h-3.5 text-indigo-400" />
                        ) : log.actorType === 'POLICY_ENGINE' ? (
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <User className="w-3.5 h-3.5 text-slate-400" />
                        )}
                        {log.actor}
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 mt-1 inline-block">
                        {log.actorType}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 align-top max-w-sm">
                      <div className="font-bold text-white font-mono text-[11px] text-indigo-300">
                        {log.action}
                      </div>
                      <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">
                        {log.reason}
                      </p>
                      {log.previousState && log.newState && (
                        <div className="text-[10px] font-mono text-slate-400 mt-1 flex items-center gap-1">
                          <span className="text-slate-500">{log.previousState}</span>
                          <span>→</span>
                          <span className="text-emerald-400 font-semibold">{log.newState}</span>
                        </div>
                      )}
                      {log.eventId && (
                        <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                          Ref: {log.eventId}
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3.5 align-top">
                      {log.policyResult === 'PASSED' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> PASSED
                        </span>
                      ) : log.policyResult === 'BLOCKED' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/60">
                          <XCircle className="w-3 h-3 text-rose-400" /> BLOCKED
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-500">N/A</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 align-top max-w-xs">
                      {log.toolCalled && (
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1 text-[10px] font-mono text-indigo-300">
                            <Terminal className="w-3 h-3 text-indigo-400" />
                            {log.toolCalled}()
                          </div>
                          {log.toolResult && (
                            <div className="text-[10px] text-slate-400 truncate max-w-xs font-mono bg-slate-950 p-1 rounded border border-slate-800/80">
                              {log.toolResult}
                            </div>
                          )}
                        </div>
                      )}
                      {log.idempotencyKey && (
                        <div className="flex items-center gap-1 text-[9px] font-mono text-slate-500 mt-1 truncate">
                          <Key className="w-2.5 h-2.5 text-slate-500 shrink-0" />
                          {log.idempotencyKey}
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-right align-top">
                      {log.recoveredAmount ? (
                        <div>
                          <div className="font-bold text-emerald-400 font-mono text-xs">
                            +{formatINR(log.recoveredAmount)}
                          </div>
                          <div className="text-[9px] text-emerald-300 font-mono">CONFIRMED</div>
                        </div>
                      ) : log.amount ? (
                        <div className="text-slate-400 font-mono text-[11px]">
                          {formatINR(log.amount)}
                        </div>
                      ) : (
                        <span className="text-slate-600 font-mono text-[11px]">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
