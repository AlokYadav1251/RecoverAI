'use client';

import React, { useState, useMemo } from 'react';
import { useRecoverStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { StatusBadge, RiskBadge, TypeBadge, InterventionBadge } from '@/components/ui/Badge';
import { EventDetailModal } from '@/components/events/EventDetailModal';
import { RevenueRiskEvent, RevenueRiskType, EventStatus } from '@/types';
import { formatINR, formatDateTime, formatRelativeTime } from '@/lib/utils';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Sparkles, 
  ShieldCheck, 
  Eye, 
  Play, 
  RefreshCw, 
  Layers, 
  CheckSquare, 
  Square,
  AlertCircle
} from 'lucide-react';

export default function RiskInboxPage() {
  const { events, analyzeEvent, approveEvent, executeRecovery } = useRecoverStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<RevenueRiskType | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<EventStatus | 'ALL'>('ALL');
  const [highValueOnly, setHighValueOnly] = useState(false);
  const [highProbOnly, setHighProbOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'AMOUNT_DESC' | 'DATE_DESC' | 'PROB_DESC'>('DATE_DESC');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [inspectingEvent, setInspectingEvent] = useState<RevenueRiskEvent | null>(null);
  const [isBulkRunning, setIsBulkRunning] = useState(false);

  // Filter and sort events
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = e.customer.name.toLowerCase().includes(q);
        const matchesEmail = e.customer.email.toLowerCase().includes(q);
        const matchesCompany = e.customer.company?.toLowerCase().includes(q);
        const matchesId = e.id.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesCompany && !matchesId) {
          return false;
        }
      }

      // Type
      if (typeFilter !== 'ALL' && e.type !== typeFilter) return false;

      // Status
      if (statusFilter !== 'ALL' && e.status !== statusFilter) return false;

      // High value (>= 10,000)
      if (highValueOnly && e.amount < 10000) return false;

      // High prob (>= 75%)
      if (highProbOnly && e.recoveryProbability < 75) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'AMOUNT_DESC') return b.amount - a.amount;
      if (sortBy === 'PROB_DESC') return b.recoveryProbability - a.recoveryProbability;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [events, searchQuery, typeFilter, statusFilter, highValueOnly, highProbOnly, sortBy]);

  const handleSelectAll = () => {
    if (selectedIds.size === filteredEvents.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredEvents.map(e => e.id)));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkAnalyze = async () => {
    setIsBulkRunning(true);
    for (const id of Array.from(selectedIds)) {
      await analyzeEvent(id);
    }
    setIsBulkRunning(false);
    setSelectedIds(new Set());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Revenue Risk Inbox
            <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800">
              {filteredEvents.length} open cases
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Central real-time stream of all failed payments, abandoned checkouts, failed subscriptions, and overdue invoices.
          </p>
        </div>

        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2 bg-indigo-950/70 border border-indigo-700/60 p-2 rounded-xl text-xs text-white">
            <span className="font-semibold">{selectedIds.size} selected</span>
            <Button
              variant="glow"
              size="sm"
              onClick={handleBulkAnalyze}
              isLoading={isBulkRunning}
              className="text-xs py-1 h-7"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1" /> Run Batch AI Triage
            </Button>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-4 space-y-3">
          {/* Top Search and Sorters */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by customer name, email, company, or event ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 font-sans"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span>Sort:</span>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="DATE_DESC">Newest First</option>
                <option value="AMOUNT_DESC">Highest Amount</option>
                <option value="PROB_DESC">Highest Recovery Probability</option>
              </select>
            </div>
          </div>

          {/* Quick Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/60 text-xs">
            <span className="text-slate-400 font-mono text-[11px]">Type:</span>
            {[
              { id: 'ALL', label: 'All Risks' },
              { id: 'PAYMENT_FAILURE', label: 'Payment Failures' },
              { id: 'CHECKOUT_ABANDONMENT', label: 'Checkout Abandoned' },
              { id: 'SUBSCRIPTION_FAILURE', label: 'Subscriptions' },
              { id: 'OVERDUE_INVOICE', label: 'Overdue Invoices' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTypeFilter(t.id as any)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                  typeFilter === t.id
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {t.label}
              </button>
            ))}

            <div className="h-4 w-[1px] bg-slate-800 mx-1 hidden sm:block" />

            <button
              onClick={() => setHighValueOnly(!highValueOnly)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                highValueOnly
                  ? 'bg-amber-600 text-white font-semibold'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              High Value (≥ ₹10,000)
            </button>

            <button
              onClick={() => setHighProbOnly(!highProbOnly)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                highProbOnly
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              High Recovery Score (≥ 75%)
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Main Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px]">
                <tr>
                  <th className="p-4 w-10 text-center">
                    <button onClick={handleSelectAll} className="cursor-pointer text-slate-400 hover:text-white">
                      {selectedIds.size > 0 && selectedIds.size === filteredEvents.length ? (
                        <CheckSquare className="w-4 h-4 text-indigo-400" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3">Event / ID</th>
                  <th className="px-4 py-3">Customer & Company</th>
                  <th className="px-4 py-3">Revenue At Risk</th>
                  <th className="px-4 py-3">Recovery Probability</th>
                  <th className="px-4 py-3">Recommended Action</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredEvents.map((evt) => {
                  const isSelected = selectedIds.has(evt.id);
                  return (
                    <tr 
                      key={evt.id} 
                      className={`hover:bg-slate-900/60 transition-colors ${isSelected ? 'bg-indigo-950/20' : ''}`}
                    >
                      <td className="p-4 text-center">
                        <button onClick={() => handleToggleSelect(evt.id)} className="cursor-pointer text-slate-400 hover:text-white">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-indigo-400" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      <td className="px-4 py-3">
                        <div className="space-y-0.5">
                          <span className="font-mono text-[11px] text-slate-400 font-semibold">{evt.id}</span>
                          <TypeBadge type={evt.type} />
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="space-y-0.5">
                          <div className="font-semibold text-white">{evt.customer.name}</div>
                          {evt.customer.company && (
                            <div className="text-[11px] text-indigo-300">{evt.customer.company}</div>
                          )}
                          <div className="text-[10px] text-slate-400 font-mono">{evt.customer.email}</div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-bold text-sm text-white">{formatINR(evt.amount)}</div>
                        <div className="text-[10px] text-slate-400">
                          {evt.status === 'RECOVERED' ? (
                            <span className="text-emerald-400 font-medium">✓ Recovered</span>
                          ) : (
                            `Exp: ${formatINR(evt.predictedRecoverableAmount)}`
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                            {evt.recoveryProbability}%
                          </span>
                          <span className="text-[10px] text-slate-400">({evt.aiDiagnosis?.confidence || 'HIGH'})</span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[140px]">
                          {evt.aiDiagnosis?.title || 'Pending triage'}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <InterventionBadge action={evt.recommendedIntervention} />
                      </td>

                      <td className="px-4 py-3">
                        <StatusBadge status={evt.status} />
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setInspectingEvent(evt)}
                            className="text-xs h-7 px-2.5"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1 text-slate-400" />
                            Inspect
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Event Detail Modal */}
      <EventDetailModal
        isOpen={!!inspectingEvent}
        event={inspectingEvent}
        onClose={() => setInspectingEvent(null)}
      />
    </div>
  );
}
