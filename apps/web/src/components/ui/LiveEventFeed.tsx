'use client';

import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Activity, ShieldCheck, Cpu, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface FeedEvent {
  id: string;
  sequence: number;
  type: string;
  actor: string;
  summary?: string;
  hash: string;
  timestamp: string;
}

interface LiveEventFeedProps {
  events: FeedEvent[];
  className?: string;
  compact?: boolean;
}

export function LiveEventFeed({ events, className, compact = false }: LiveEventFeedProps) {
  const getActorIcon = (actor: string) => {
    switch (actor.toLowerCase()) {
      case 'system':
      case 'orchestrator':
        return <Activity className="w-3.5 h-3.5 text-purple-400" />;
      case 'veritas':
      case 'compliance':
      case 'reviewer':
        return <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />;
      default:
        return <Cpu className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  return (
    <GlassCard tier="thin" className={cn('p-4 flex flex-col gap-3', className)}>
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <h4 className="text-xs font-semibold text-slate-200 tracking-wider uppercase">
            Live VERITAS Event Feed
          </h4>
        </div>
        <span className="text-[10px] font-mono text-slate-400">
          {events.length} chained events
        </span>
      </div>

      <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1 select-text scrollbar-thin scrollbar-thumb-white/10">
        {events.length === 0 ? (
          <div className="text-xs text-slate-500 py-4 text-center font-mono">
            Waiting for event stream to initialize...
          </div>
        ) : (
          events.slice(-8).reverse().map((evt) => (
            <div
              key={evt.id}
              className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 transition-all text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-1 rounded bg-white/5">
                  {getActorIcon(evt.actor)}
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5 font-medium text-slate-200 truncate">
                    <span className="text-purple-300 font-mono text-[11px]">{evt.actor}</span>
                    <ArrowRight className="w-2.5 h-2.5 text-slate-500 shrink-0" />
                    <span className="text-[11px] truncate">{evt.type}</span>
                  </div>
                  {evt.summary && (
                    <span className="text-[10px] text-slate-400 truncate">
                      {evt.summary}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="font-mono text-[10px] text-cyan-400/80 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                  #{evt.sequence} {evt.hash.substring(0, 6)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </GlassCard>
  );
}
