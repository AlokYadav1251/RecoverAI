'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRecoverStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { StatusBadge, RiskBadge, TypeBadge, InterventionBadge } from '@/components/ui/Badge';
import { EventDetailModal } from '@/components/events/EventDetailModal';
import { RevenueRiskEvent } from '@/types';
import { formatINR, formatPercent, formatDateTime, formatRelativeTime } from '@/lib/utils';
import { 
  TrendingUp, 
  ShieldAlert, 
  Sparkles, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Play, 
  Zap, 
  ArrowRight,
  Filter,
  BarChart2,
  PieChart as PieIcon
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';

export default function DashboardPage() {
  const { 
    events, 
    analytics, 
    auditLogs, 
    runHeroSingleEventDemo, 
    runHeroBatchCampaignDemo, 
    isProcessingHeroDemo 
  } = useRecoverStore();

  const [dateFilter, setDateFilter] = useState<'TODAY' | '7D' | '30D' | '90D'>('30D');
  const [selectedEvent, setSelectedEvent] = useState<RevenueRiskEvent | null>(null);

  // Time-series Chart Data (30-day simulated historical recovery trend)
  const timeSeriesData = [
    { day: 'Day 1', atRisk: 28000, recovered: 12000, rate: 42.8 },
    { day: 'Day 5', atRisk: 65000, recovered: 31000, rate: 47.6 },
    { day: 'Day 10', atRisk: 140000, recovered: 68000, rate: 48.5 },
    { day: 'Day 15', atRisk: 290000, recovered: 142000, rate: 48.9 },
    { day: 'Day 20', atRisk: 480000, recovered: 228000, rate: 47.5 },
    { day: 'Day 25', atRisk: 690000, recovered: 320000, rate: 46.3 },
    { day: 'Today', atRisk: analytics.totalRevenueAtRisk, recovered: analytics.totalActualRecovered, rate: analytics.overallRecoveryRate },
  ];

  // Revenue by Risk Type Breakdown Data
  const typeBreakdownData = [
    { name: 'Payment Failures', value: 420000, count: 85, color: '#F43F5E' },
    { name: 'Checkout Drop-offs', value: 185000, count: 42, color: '#F59E0B' },
    { name: 'Subscriptions', value: 85000, count: 28, color: '#6366F1' },
    { name: 'Overdue Invoices', value: 150000, count: 18, color: '#A855F7' },
  ];

  // Failure Reason Distribution Data
  const failureReasonData = [
    { reason: 'Insufficient Funds', count: 48, amount: 240000, rate: '87%' },
    { reason: 'Bank Outage', count: 32, amount: 160000, rate: '82%' },
    { reason: 'Card Expired', count: 24, amount: 110000, rate: '78%' },
    { reason: 'Cart Drop-off', count: 38, amount: 185000, rate: '71%' },
    { reason: 'Auth / OTP Timeout', count: 21, amount: 95000, rate: '69%' },
    { reason: 'Invoice AP Delay', count: 12, amount: 150000, rate: '63%' },
  ];

  const recentAtRiskEvents = events
    .filter(e => e.status !== 'RECOVERED' && e.status !== 'STOPPED')
    .slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Hero Welcome & Quick 1-Click Launchers */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
              Razorpay Track 03 Demo System
            </span>
            <span className="text-xs text-slate-400 font-mono">Live Autonomous Agent</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Revenue Recovery Operating System
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Find revenue that’s slipping away and win it back autonomously with explainable AI reasoning, strict policy boundaries, and actual ledger reconciliation.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="glow"
            size="md"
            onClick={runHeroSingleEventDemo}
            isLoading={isProcessingHeroDemo}
            className="text-xs"
          >
            <Play className="w-3.5 h-3.5 mr-1.5 fill-slate-950 text-slate-950" />
            1-Click Hero Recovery (₹4,999)
          </Button>
          <Link href="/campaigns">
            <Button
              variant="secondary"
              size="md"
              className="text-xs border-indigo-500/40 hover:bg-indigo-950/40 text-indigo-300"
            >
              <Layers className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
              Batch Campaign Hub
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
          Executive Recovery KPIs
        </div>
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
          {(['TODAY', '7D', '30D', '90D'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setDateFilter(filter)}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer font-mono text-[11px] ${
                dateFilter === filter
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Revenue At Risk */}
        <Card className="border-rose-900/40 bg-gradient-to-b from-slate-900 to-slate-950">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Revenue At Risk</span>
              <ShieldAlert className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-extrabold text-white mt-2">
              {formatINR(analytics.totalRevenueAtRisk)}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
              <span>{analytics.totalCasesProcessed} total risk events</span>
              <span className="text-rose-400 font-medium">100% Ingested</span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 2: Predicted Recoverable */}
        <Card className="border-indigo-900/40 bg-gradient-to-b from-slate-900 to-slate-950">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Predicted Recoverable</span>
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-extrabold text-indigo-300 mt-2">
              {formatINR(analytics.totalPredictedRecoverable)}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
              <span>AI Expected Recovery</span>
              <span className="text-indigo-400 font-medium">56.2% expected</span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 3: MONEY ACTUALLY RECOVERED (Hero Highlight) */}
        <Card className="border-2 border-emerald-500/60 bg-gradient-to-b from-emerald-950/30 via-slate-900 to-slate-950 shadow-xl shadow-emerald-950/30 relative">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-emerald-300 uppercase tracking-wider font-semibold">
                Money Actually Recovered
              </span>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-3xl font-extrabold text-emerald-400 mt-2 tracking-tight">
              {formatINR(analytics.totalActualRecovered)}
            </div>
            <div className="flex items-center justify-between text-[11px] text-emerald-300/90 mt-2">
              <span>Realized in Bank Ledger</span>
              <span className="font-bold">{formatPercent(analytics.overallRecoveryRate)} realized</span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 4: Recovery Velocity & Approvals */}
        <Card className="border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Active Campaigns</span>
              <Layers className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-extrabold text-white mt-2">
              {analytics.activeCampaignsCount} Active
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
              <span>{analytics.pendingApprovalsCount} pending approvals</span>
              <span className="text-amber-400 font-medium">Avg ~3h 42m</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visual Analytics Grid: Area Chart & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Realized Money Recovered Over Time */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Revenue At Risk vs. Money Actually Recovered
              </CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">
                Tracks cumulative at-risk revenue against confirmed bank settlements over time.
              </p>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeSeriesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAtRisk" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#F43F5E" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorRecovered" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis dataKey="day" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis 
                    stroke="#64748B" 
                    fontSize={11} 
                    tickLine={false} 
                    tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`} 
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#1E293B', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, '']}
                  />
                  <Area type="monotone" dataKey="atRisk" name="Revenue At Risk" stroke="#F43F5E" fillOpacity={1} fill="url(#colorAtRisk)" strokeWidth={2} />
                  <Area type="monotone" dataKey="recovered" name="Actually Recovered" stroke="#10B981" fillOpacity={1} fill="url(#colorRecovered)" strokeWidth={2.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-center gap-6 mt-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-rose-500" />
                <span className="text-slate-300">Revenue At Risk ({formatINR(analytics.totalRevenueAtRisk)})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-emerald-500" />
                <span className="text-emerald-300 font-semibold">Money Recovered ({formatINR(analytics.totalActualRecovered)})</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right 1 Col: Revenue by Risk Type */}
        <Card>
          <CardHeader>
            <CardTitle>
              <PieIcon className="w-4 h-4 text-indigo-400" />
              Revenue by Risk Type
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-4">
            <div className="space-y-3">
              {typeBreakdownData.map((item) => (
                <div key={item.name} className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      {item.name}
                    </span>
                    <span className="font-mono font-bold text-slate-200">{formatINR(item.value)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{item.count} total cases</span>
                    <span>{((item.value / analytics.totalRevenueAtRisk) * 100).toFixed(0)}% of risk</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Failure Reason & Strategy Efficiency Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <CardTitle>
              <BarChart2 className="w-4 h-4 text-teal-400" />
              Root Cause Failure Reason & Win-Back Performance
            </CardTitle>
            <span className="text-xs text-slate-400 font-mono">Calibrated across 210 events</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px]">
                <tr>
                  <th className="px-5 py-3">Failure Category</th>
                  <th className="px-5 py-3">Cases</th>
                  <th className="px-5 py-3">Revenue Impact</th>
                  <th className="px-5 py-3">Recovery Probability</th>
                  <th className="px-5 py-3">Primary Intervention</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {failureReasonData.map((row) => (
                  <tr key={row.reason} className="hover:bg-slate-900/40 transition-colors">
                    <td className="px-5 py-3 font-medium text-white">{row.reason}</td>
                    <td className="px-5 py-3 font-mono text-slate-300">{row.count}</td>
                    <td className="px-5 py-3 font-mono font-semibold text-slate-200">{formatINR(row.amount)}</td>
                    <td className="px-5 py-3">
                      <span className="font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                        {row.rate}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <InterventionBadge 
                        action={
                          row.reason.includes('Funds') || row.reason.includes('Outage') 
                            ? 'SMART_RETRY' 
                            : row.reason.includes('Invoice') 
                            ? 'RECOVERY_REMINDER' 
                            : 'PAYMENT_LINK'
                        } 
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* High-Value Revenue-at-Risk Table & Live Agent Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: High Value Events */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <div>
                <CardTitle>
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  High-Priority Revenue-at-Risk Queue
                </CardTitle>
                <p className="text-xs text-slate-400 mt-0.5">Top open cases requiring bounded agent recovery or merchant confirmation.</p>
              </div>
              <Link href="/risk-inbox">
                <Button variant="ghost" size="sm" className="text-xs text-indigo-400">
                  View Full Inbox <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-800/60">
              {recentAtRiskEvents.map((evt) => (
                <div 
                  key={evt.id}
                  onClick={() => setSelectedEvent(evt)}
                  className="p-4 hover:bg-slate-900/60 transition-colors flex items-center justify-between cursor-pointer group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-slate-400">{evt.id}</span>
                      <TypeBadge type={evt.type} />
                      <StatusBadge status={evt.status} />
                    </div>
                    <div className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">
                      {evt.customer.name} {evt.customer.company && `(${evt.customer.company})`}
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-3">
                      <span>Reason: <strong className="text-slate-300">{evt.aiDiagnosis?.title || 'Gateway Failure'}</strong></span>
                      <span>•</span>
                      <span>Score: <strong className="text-emerald-400">{evt.recoveryProbability}%</strong></span>
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <div className="text-base font-bold text-white">{formatINR(evt.amount)}</div>
                    <InterventionBadge action={evt.recommendedIntervention} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Right 1 Col: Live Agent Activity Feed */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CardTitle>
                <Clock className="w-4 h-4 text-indigo-400" />
                Live Agent Audit Stream
              </CardTitle>
              <Link href="/audit">
                <Button variant="ghost" size="sm" className="text-xs text-slate-400">
                  Full Log
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {auditLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-indigo-300 font-mono text-[11px]">{log.action}</span>
                  <span suppressHydrationWarning className="text-[10px] text-slate-500 font-mono">{formatRelativeTime(log.timestamp)}</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">{log.reason}</p>
                <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500 font-mono">
                  <span>Actor: {log.actor}</span>
                  {log.amount && <span>{formatINR(log.amount)}</span>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Event Detail Modal */}
      <EventDetailModal
        isOpen={!!selectedEvent}
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
}
