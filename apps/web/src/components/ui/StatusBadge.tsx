import React from 'react';
import { cn } from '@/lib/cn';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalized = status.toUpperCase();

  const getVariantStyles = () => {
    switch (normalized) {
      case 'COMPLETED':
      case 'APPROVED':
      case 'PASSED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'ACTIVE':
      case 'RUNNING':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'REVIEW':
      case 'REVIEWING':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      case 'WAITING_FOR_HUMAN':
      case 'PENDING':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'FAILED':
      case 'REJECTED':
      case 'CANCELLED':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono border',
        getVariantStyles(),
        className
      )}
    >
      {normalized}
    </span>
  );
}
