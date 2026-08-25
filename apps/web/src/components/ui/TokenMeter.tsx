'use client';

import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Coins, Zap } from 'lucide-react';
import { cn } from '@/lib/cn';

interface TokenMeterProps {
  tokensUsed: number;
  budgetTokens?: number;
  costUsd?: number;
  budgetCostUsd?: number;
  className?: string;
}

export function TokenMeter({
  tokensUsed,
  budgetTokens = 30000,
  costUsd = 0.0,
  budgetCostUsd = 2.0,
  className,
}: TokenMeterProps) {
  const pct = Math.min((tokensUsed / (budgetTokens || 1)) * 100, 100);
  const isHigh = pct > 80;

  return (
    <GlassCard tier="thin" className={cn('p-3.5 flex flex-col gap-2 min-w-[200px]', className)}>
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-400 font-medium">
          <Coins className="w-3.5 h-3.5 text-purple-400" />
          <span>Run Cost</span>
        </div>
        <span className="font-mono font-semibold text-emerald-400">
          ${costUsd.toFixed(4)}
        </span>
      </div>

      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
        <span>{tokensUsed.toLocaleString()} tokens</span>
        <span className="text-slate-500">/ {budgetTokens.toLocaleString()}</span>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden w-full">
        <div
          className={cn(
            'h-full transition-all duration-300 rounded-full',
            isHigh
              ? 'bg-gradient-to-r from-amber-500 to-rose-500'
              : 'bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400'
          )}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-0.5">
        <span className="flex items-center gap-1">
          <Zap className="w-2.5 h-2.5 text-amber-400" />
          Budget: ${budgetCostUsd.toFixed(2)}
        </span>
        <span className={cn(isHigh ? 'text-amber-400' : 'text-slate-400')}>
          {pct.toFixed(0)}% used
        </span>
      </div>
    </GlassCard>
  );
}
