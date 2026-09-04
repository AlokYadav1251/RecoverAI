import React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  variant?: 'emerald' | 'indigo' | 'amber' | 'rose' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  variant = 'emerald',
  size = 'md',
  showLabel = false,
  className,
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const variantClasses = {
    emerald: 'bg-emerald-500',
    indigo: 'bg-indigo-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    gradient: 'bg-gradient-to-r from-indigo-500 via-teal-400 to-emerald-400',
  };

  return (
    <div className={cn('w-full', className)}>
      <div className={cn('w-full bg-slate-800/80 rounded-full overflow-hidden border border-slate-700/40 p-[1px]', sizeClasses[size])}>
        <div
          className={cn('h-full rounded-full transition-all duration-300', variantClasses[variant])}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1 font-mono">
          <span>{value} / {max}</span>
          <span>{percentage.toFixed(1)}%</span>
        </div>
      )}
    </div>
  );
};
