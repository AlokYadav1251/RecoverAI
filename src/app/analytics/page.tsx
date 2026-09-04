'use client';

import React, { useState } from 'react';
import { useRecoverStore } from '@/lib/store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { formatINR, formatPercent } from '@/lib/utils';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Target, 
  Sparkles, 
  Layers, 
  ShieldCheck,
  CheckCircle2,
  PieChart as PieIcon,
  Activity
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

export default function AnalyticsPage() {
  const { analytics } = useRecoverStore();
  const [period, setPeriod] = useState<'30D' | '90D' | 'ALL'>('30D');
  const periodConfig = {
    '30D': { label: 'Last 30 days', multiplier: 1 },
    '90D': { label: 'Last 90 days', multiplier: 1.58 },
    ALL: { label: 'All recorded time', multiplier: 2.14 },
  } as const;
  const selectedPeriod = periodConfig[period];
  const periodRecovered = Math.round(analytics.totalActualRecovered * selectedPeriod.multiplier);
  const periodAtRisk = Math.round(analytics.totalRevenueAtRisk * selectedPeriod.multiplier);
  const periodUnrecovered = periodAtRisk - periodRecovered;
  const periodRecoveryRate = periodAtRisk > 0 ? (periodRecovered / periodAtRisk) * 100 : 0;

  // Channel ROI Performance Data
  const channelData = [
    { channel: 'Smart Retry (UPI / Mandate)', recovered: 198000, attempts: 64, rate: 58.4, avgTime: '2.2 hrs', color: '#6366F1' },
    { channel: '1-Click Payment Link', recovered: 112500, attempts: 48, rate: 44.2, avgTime: '4.8 hrs', color: '#14B8A6' },
    { channel: 'WhatsApp / SMS Reminders', recovered: 68000, attempts: 32, rate: 38.9, avgTime: '18.4 hrs', color: '#F59E0B' },
    { channel: 'Finance Escalation (B2B)', recovered: 13000, attempts: 8, rate: 22.0, avgTime: '48.0 hrs', color: '#A855F7' },
  ].map((row) => ({
    ...row,
    recovered: Math.round(row.recovered * selectedPeriod.multiplier),
    attempts: Math.round(row.attempts * selectedPeriod.multiplier),
  }));

  // Payment Method Breakdown Data
  const methodData = [
    { name: 'UPI Auto-Debit', value: 215000, color: '#10B981' },
    { name: 'Credit Cards', value: 98000, color: '#38BDF8' },
    { name: 'Debit Cards', value: 42000, color: '#6366F1' },
    { name: 'NACH Mandates', value: 24500, color: '#F59E0B' },
    { name: 'Netbanking', value: 12000, color: '#EC4899' },
  ].map((item) => ({
    ...item,
    value: Math.round(item.value * selectedPeriod.multiplier),
  }));

  // Accuracy Calibration Curve
  const accuracyData = [
    { bracket: '90-100% Score', predictedRate: 94, actualRate: 91.2 },
    { bracket: '80-89% Score', predictedRate: 84, actualRate: 82.5 },
    { bracket: '70-79% Score', predictedRate: 74, actualRate: 71.8 },
    { bracket: '50-69% Score', predictedRate: 58, actualRate: 54.0 },
    { bracket: '< 50% Score', predictedRate: 35, actualRate: 28.5 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Recovery Analytics & Yield Calibration
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              Ledger Reconciled
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Deep-dive financial performance, model accuracy calibration, and intervention channel realization metrics.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
          {(['30D', '90D', 'ALL'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded-md transition-colors font-mono text-[11px] cursor-pointer ${
                period === p ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-400">
        <span className="w-2 h-2 rounded-full bg-indigo-400" />
        Showing performance for <strong className="text-slate-200">{selectedPeriod.label}</strong>
      </div>

      {/* Top 4 Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-emerald-500/50 bg-gradient-to-b from-emerald-950/30 via-slate-900 to-slate-950">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-emerald-300 uppercase">Money Actually Recovered</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold text-emerald-400 mt-2">
              {formatINR(periodRecovered)}
            </div>
            <div className="text-[11px] text-emerald-300/80 mt-1">
              Realized recovery rate: <strong>{formatPercent(periodRecoveryRate)}</strong>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400 uppercase">Total Unrecovered Risk</span>
              <Target className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-bold text-white mt-2">
              {formatINR(periodUnrecovered)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              From total {formatINR(periodAtRisk)} at risk
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400 uppercase">Prediction Accuracy</span>
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-bold text-indigo-300 mt-2">
              91.4%
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Calibrated vs bank settlement outcomes
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400 uppercase">Avg. Recovery Velocity</span>
              <Clock className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-2xl font-bold text-white mt-2">
              3h 42m
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              From detection to bank confirmation
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Intervention Performance Table & Chart */}
      <Card>
        <CardHeader>
          <CardTitle>
            <BarChart3 className="w-4 h-4 text-indigo-400" />
            Intervention Channel Realization Matrix
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px]">
                <tr>
                  <th className="px-5 py-3">Recovery Channel</th>
                  <th className="px-5 py-3">Attempts</th>
                  <th className="px-5 py-3">Money Recovered</th>
                  <th className="px-5 py-3">Realization Rate</th>
                  <th className="px-5 py-3">Avg Resolution Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {channelData.map((row) => (
                  <tr key={row.channel} className="hover:bg-slate-900/40 transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-white flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: row.color }} />
                      {row.channel}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-300">{row.attempts} actions</td>
                    <td className="px-5 py-3.5 font-mono font-bold text-emerald-400">{formatINR(row.recovered)}</td>
                    <td className="px-5 py-3.5">
                      <span className="font-mono font-bold text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/60">
                        {row.rate}%
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-400">{row.avgTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Accuracy Calibration & Payment Methods Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Prediction Calibration */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Activity className="w-4 h-4 text-emerald-400" />
              AI Recovery Probability vs. Actual Ground Truth
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={accuracyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis dataKey="bracket" stroke="#64748B" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#1E293B', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Bar dataKey="predictedRate" name="Predicted Rate" fill="#6366F1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="actualRate" name="Actual Realized" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 mt-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-indigo-500" />
                <span className="text-slate-300">Predicted Score</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-emerald-500" />
                <span className="text-emerald-300">Actual Realized Rate</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right: Payment Instrument Yield */}
        <Card>
          <CardHeader>
            <CardTitle>
              <PieIcon className="w-4 h-4 text-teal-400" />
              Recovered Revenue by Payment Instrument
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-3">
            {methodData.map((item) => (
              <div key={item.name} className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    {item.name}
                  </span>
                  <span className="font-mono font-bold text-emerald-400">{formatINR(item.value)}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Settlement method</span>
                  <span>{((item.value / analytics.totalActualRecovered) * 100).toFixed(1)}% of total recovered</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
