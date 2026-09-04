import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'emerald' | 'danger' | 'outline' | 'ghost' | 'glow';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    const sizeClasses = {
      sm: 'h-8 px-3 text-xs font-medium rounded-md gap-1.5',
      md: 'h-9 px-4 text-sm font-medium rounded-lg gap-2',
      lg: 'h-11 px-5 text-base font-medium rounded-lg gap-2.5',
    };

    const variantClasses = {
      primary: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm active:scale-[0.98]',
      secondary: 'bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 active:scale-[0.98]',
      emerald: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/40 active:scale-[0.98]',
      danger: 'bg-rose-600 hover:bg-rose-500 text-white active:scale-[0.98]',
      outline: 'border border-slate-700 hover:border-slate-600 hover:bg-slate-800/50 text-slate-300 active:scale-[0.98]',
      ghost: 'hover:bg-slate-800/60 text-slate-400 hover:text-slate-200',
      glow: 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-semibold shadow-lg shadow-emerald-500/20 active:scale-[0.98]',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none focus:outline-none focus:ring-2 focus:ring-indigo-500/40',
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-0.5 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
