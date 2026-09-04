import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatINR(amount: number, options?: { showPaisa?: boolean; compact?: boolean }): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  
  if (options?.compact && Math.abs(amount) >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (options?.compact && Math.abs(amount) >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} L`;
  }
  if (options?.compact && Math.abs(amount) >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}k`;
  }

  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: options?.showPaisa ? 2 : 0,
    minimumFractionDigits: options?.showPaisa ? 2 : 0,
  });

  return formatter.format(amount);
}

export function formatPercent(value: number): string {
  if (isNaN(value)) return '0.0%';
  return `${value.toFixed(1)}%`;
}

export function formatDateTime(isoString: string): string {
  if (!isoString) return '-';
  try {
    const d = new Date(isoString);
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return isoString;
  }
}

export function formatTimeOnly(isoString: string): string {
  if (!isoString) return '-';
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  } catch {
    return isoString;
  }
}

export function formatRelativeTime(isoString: string): string {
  if (!isoString) return '-';
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return `${diffSecs}s ago`;
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  } catch {
    return isoString;
  }
}

export function generateId(prefix: string): string {
  const randomStr = Math.random().toString(36).substring(2, 9).toUpperCase();
  return `${prefix}-${randomStr}`;
}

export function generateIdempotencyKey(action: string, entityId: string): string {
  const timestampBlock = Math.floor(Date.now() / 60000); // 1-minute window
  return `IDEMP_${action.toUpperCase()}_${entityId}_${timestampBlock}`;
}
