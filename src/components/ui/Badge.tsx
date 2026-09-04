import React from 'react';
import { cn } from '@/lib/utils';
import { EventStatus, RiskLevel, RevenueRiskType, InterventionType } from '@/types';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  size = 'md',
  children,
  ...props
}) => {
  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 rounded',
    md: 'text-xs px-2.5 py-1 rounded-md font-medium',
    lg: 'text-sm px-3 py-1.5 rounded-lg font-medium',
  };

  const variantClasses = {
    default: 'bg-slate-800 text-slate-200 border border-slate-700',
    success: 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/60',
    warning: 'bg-amber-950/70 text-amber-300 border border-amber-800/60',
    danger: 'bg-rose-950/70 text-rose-300 border border-rose-800/60',
    info: 'bg-cyan-950/70 text-cyan-300 border border-cyan-800/60',
    purple: 'bg-indigo-950/70 text-indigo-300 border border-indigo-800/60',
    neutral: 'bg-slate-900/80 text-slate-400 border border-slate-800',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 tracking-wide transition-all select-none',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: EventStatus; className?: string }> = ({ status, className }) => {
  switch (status) {
    case 'RECOVERED':
      return <Badge variant="success" className={cn('bg-emerald-900/40 text-emerald-400 border-emerald-700/50', className)}>✓ RECOVERED</Badge>;
    case 'AT_RISK':
      return <Badge variant="danger" className={cn('bg-rose-950/60 text-rose-400 border-rose-800/60', className)}>● AT RISK</Badge>;
    case 'ANALYZING':
      return <Badge variant="purple" className={cn('bg-indigo-950/60 text-indigo-400 border-indigo-800/60 animate-pulse', className)}>⚡ ANALYZING</Badge>;
    case 'RECOMMENDED':
      return <Badge variant="info" className={cn('bg-cyan-950/60 text-cyan-300 border-cyan-800/60', className)}>★ RECOMMENDED</Badge>;
    case 'AWAITING_APPROVAL':
      return <Badge variant="warning" className={cn('bg-amber-950/60 text-amber-300 border-amber-800/60', className)}>⏳ AWAITING APPROVAL</Badge>;
    case 'SCHEDULED':
      return <Badge variant="purple" className={cn('bg-indigo-950/60 text-indigo-300 border-indigo-800/60', className)}>🕒 SCHEDULED</Badge>;
    case 'IN_PROGRESS':
      return <Badge variant="info" className={cn('bg-sky-950/60 text-sky-300 border-sky-800/60 animate-pulse', className)}>⚙ IN PROGRESS</Badge>;
    case 'MANUAL_REVIEW':
      return <Badge variant="warning" className={cn('bg-amber-950/60 text-amber-300 border-amber-800/60', className)}>👤 MANUAL REVIEW</Badge>;
    case 'STOPPED':
      return <Badge variant="neutral" className={cn('bg-slate-900 text-slate-400 border-slate-800', className)}>⛔ STOPPED</Badge>;
    case 'FAILED':
      return <Badge variant="danger" className={cn('bg-rose-950/60 text-rose-400 border-rose-800/60', className)}>✕ FAILED</Badge>;
    default:
      return <Badge variant="neutral" className={className}>{status}</Badge>;
  }
};

export const RiskBadge: React.FC<{ level: RiskLevel; className?: string }> = ({ level, className }) => {
  switch (level) {
    case 'LOW':
      return <Badge variant="success" size="sm" className={className}>LOW RISK</Badge>;
    case 'MEDIUM':
      return <Badge variant="warning" size="sm" className={className}>MED RISK</Badge>;
    case 'HIGH':
      return <Badge variant="danger" size="sm" className={className}>HIGH RISK</Badge>;
  }
};

export const TypeBadge: React.FC<{ type: RevenueRiskType; className?: string }> = ({ type, className }) => {
  switch (type) {
    case 'PAYMENT_FAILURE':
      return <span className={cn('text-xs font-medium text-rose-300 flex items-center gap-1', className)}>💳 Payment Failure</span>;
    case 'CHECKOUT_ABANDONMENT':
      return <span className={cn('text-xs font-medium text-amber-300 flex items-center gap-1', className)}>🛒 Cart Abandoned</span>;
    case 'SUBSCRIPTION_FAILURE':
      return <span className={cn('text-xs font-medium text-indigo-300 flex items-center gap-1', className)}>🔄 Subscription</span>;
    case 'OVERDUE_INVOICE':
      return <span className={cn('text-xs font-medium text-purple-300 flex items-center gap-1', className)}>📄 B2B Invoice</span>;
  }
};

export const InterventionBadge: React.FC<{ action: InterventionType; className?: string }> = ({ action, className }) => {
  const formatted = action.replace(/_/g, ' ');
  return (
    <span className={cn('px-2 py-0.5 rounded text-[11px] font-mono font-medium tracking-wide bg-slate-800/90 text-slate-300 border border-slate-700/70', className)}>
      {formatted}
    </span>
  );
};
