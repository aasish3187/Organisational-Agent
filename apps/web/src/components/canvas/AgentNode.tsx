'use client';

import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  Search,
  Sparkles,
  Cpu,
  Layers,
  ShieldCheck,
  FileCheck2,
  CheckCircle,
  Clock,
  Coins,
} from 'lucide-react';
import { cn } from '@/lib/cn';

export interface AgentNodeData {
  role: string;
  status: string;
  tokensUsed: number;
  tokenBudget: number;
  taskCount: number;
  confidence?: number;
  mandate?: string;
  selected?: boolean;
}

const roleIconMap: Record<string, React.ReactNode> = {
  research_analyst: <Search className="w-4 h-4 text-cyan-400" />,
  product_strategist: <Sparkles className="w-4 h-4 text-purple-400" />,
  ai_architect: <Cpu className="w-4 h-4 text-indigo-400" />,
  system_architect: <Layers className="w-4 h-4 text-blue-400" />,
  privacy_risk: <ShieldCheck className="w-4 h-4 text-amber-400" />,
  consistency_reviewer: <FileCheck2 className="w-4 h-4 text-cyan-400" />,
  solutions_officer: <CheckCircle className="w-4 h-4 text-emerald-400" />,
};

const roleLabelMap: Record<string, string> = {
  research_analyst: 'Research Analyst',
  product_strategist: 'Product Strategist',
  ai_architect: 'AI / RAG Architect',
  system_architect: 'System Architect',
  privacy_risk: 'Privacy & Risk',
  consistency_reviewer: 'Consistency Reviewer',
  solutions_officer: 'Solutions Officer',
  mission_interpreter: 'Mission Interpreter',
  organization_compiler: 'Org Compiler',
};

export const AgentNode = memo(({ data, selected }: NodeProps<AgentNodeData>) => {
  const {
    role = 'specialist',
    status = 'PENDING',
    tokensUsed = 0,
    tokenBudget = 5000,
    taskCount = 1,
  } = data || {};

  const budgetPct = Math.min((tokensUsed / (tokenBudget || 1)) * 100, 100);

  const getGlowClass = () => {
    switch (status.toUpperCase()) {
      case 'ACTIVE':
      case 'RUNNING':
        return 'bg-purple-500/30 opacity-70 animate-pulse-glow shadow-purple-500/50';
      case 'REVIEW':
      case 'REVIEWING':
        return 'bg-cyan-500/30 opacity-70 animate-pulse-glow shadow-cyan-500/50';
      case 'COMPLETED':
        return 'bg-emerald-500/20 opacity-40 shadow-emerald-500/30';
      case 'WAITING_FOR_HUMAN':
        return 'bg-amber-500/30 opacity-60 animate-pulse-glow shadow-amber-500/40';
      case 'FAILED':
        return 'bg-rose-500/30 opacity-60 shadow-rose-500/40';
      default:
        return 'bg-white/5 opacity-10';
    }
  };

  return (
    <div className="relative group min-w-[170px] max-w-[200px]">
      {/* Outer Glow Ring */}
      <div
        className={cn(
          'absolute -inset-2 rounded-2xl filter blur-md transition-all duration-500',
          getGlowClass()
        )}
      />

      {/* Main Glass Node Card */}
      <div
        className={cn(
          'relative rounded-xl p-3.5 glass-regular border transition-all duration-200 cursor-pointer shadow-lg',
          selected ? 'border-purple-400 ring-2 ring-purple-500/40 scale-105' : 'border-white/10 hover:border-white/20'
        )}
      >
        {/* Top Handle */}
        <Handle
          type="target"
          position={Position.Left}
          className="!w-2.5 !h-2.5 !bg-purple-400 !border-2 !border-black"
        />

        <div className="flex items-center gap-2.5 mb-2">
          <div className="p-1.5 rounded-lg bg-black/40 border border-white/10 shrink-0">
            {roleIconMap[role] || <Cpu className="w-4 h-4 text-purple-400" />}
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-semibold text-white truncate font-sans">
              {roleLabelMap[role] || role}
            </h4>
            <span className="text-[10px] text-slate-400 font-mono block truncate">
              {role}
            </span>
          </div>
        </div>

        {/* Status & Tasks Row */}
        <div className="flex items-center justify-between gap-1 mb-2 pt-1 border-t border-white/5">
          <StatusBadge status={status} className="text-[9px] px-1.5 py-0" />
          <span className="text-[10px] font-mono text-slate-400">
            {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
          </span>
        </div>

        {/* Token Budget Micro-Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[9px] font-mono text-slate-500">
            <span>{tokensUsed} tok</span>
            <span>{budgetPct.toFixed(0)}%</span>
          </div>
          <div className="h-1 bg-white/10 rounded-full overflow-hidden w-full">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full transition-all duration-300"
              style={{ width: `${budgetPct}%` }}
            />
          </div>
        </div>

        {/* Source Handle */}
        <Handle
          type="source"
          position={Position.Right}
          className="!w-2.5 !h-2.5 !bg-cyan-400 !border-2 !border-black"
        />
      </div>
    </div>
  );
});

AgentNode.displayName = 'AgentNode';
