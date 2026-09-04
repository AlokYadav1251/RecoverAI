'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRecoverStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Inbox, 
  Layers, 
  Bot, 
  BarChart3, 
  ScrollText, 
  SlidersHorizontal, 
  Settings,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import { formatINR } from '@/lib/utils';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { analytics, events } = useRecoverStore();

  const atRiskCount = events.filter(e => e.status !== 'RECOVERED' && e.status !== 'STOPPED').length;
  const pendingApprovalsCount = events.filter(e => e.status === 'AWAITING_APPROVAL').length;

  const NAV_ITEMS = [
    {
      name: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
    },
    {
      name: 'Revenue Risk Inbox',
      href: '/risk-inbox',
      icon: Inbox,
      badge: atRiskCount > 0 ? `${atRiskCount}` : undefined,
      badgeColor: 'bg-rose-950 text-rose-300 border-rose-800/60',
    },
    {
      name: 'Recovery Campaigns',
      href: '/campaigns',
      icon: Layers,
      badge: analytics.activeCampaignsCount > 0 ? `${analytics.activeCampaignsCount} Active` : undefined,
      badgeColor: 'bg-indigo-950 text-indigo-300 border-indigo-800/60',
    },
    {
      name: 'Recovery Copilot',
      href: '/copilot',
      icon: Bot,
      pill: 'AI Assistant',
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
    },
    {
      name: 'Audit Logs',
      href: '/audit',
      icon: ScrollText,
    },
    {
      name: 'Policies & Safety',
      href: '/policies',
      icon: SlidersHorizontal,
      badge: pendingApprovalsCount > 0 ? `${pendingApprovalsCount} Action` : undefined,
      badgeColor: 'bg-amber-950 text-amber-300 border-amber-800/60',
    },
    {
      name: 'Settings & Gateway',
      href: '/settings',
      icon: Settings,
    },
  ];

  return (
    <aside className="w-full lg:w-64 shrink-0 border-r border-slate-800 bg-slate-950/60 flex flex-col justify-between p-4">
      <div className="space-y-6">
        {/* Navigation Links */}
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group',
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-900/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className={cn('w-4 h-4 transition-colors', isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200')} />
                  <span>{item.name}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <span className={cn('text-[10px] font-mono px-2 py-0.5 rounded-full border', item.badgeColor)}>
                      {item.badge}
                    </span>
                  )}
                  {item.pill && (
                    <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                      {item.pill}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Live Money Recovered Mini-Card */}
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-800/40">
          <div className="flex items-center justify-between text-[11px] text-emerald-400 font-mono font-semibold">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              ACTUAL RECOVERED
            </span>
            <span>{analytics.overallRecoveryRate.toFixed(1)}%</span>
          </div>
          <div className="text-xl font-bold text-white mt-1">
            {formatINR(analytics.totalActualRecovered)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {analytics.totalSuccessfulRecoveries} customer payments rescued
          </div>
        </div>
      </div>

      {/* Footer System Status */}
      <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Bounded Guardrails
          </span>
          <span className="text-emerald-400 font-mono text-[10px]">ACTIVE</span>
        </div>
        <div className="text-[10px] text-slate-400">
          Razorpay Track 03 Prototype
        </div>
      </div>
    </aside>
  );
};
