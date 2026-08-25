'use client';

import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  X,
  Cpu,
  ShieldCheck,
  Wrench,
  FileText,
  Coins,
  CheckCircle2,
} from 'lucide-react';
import type { AgentNodeData } from './AgentNode';

interface NodeInspectorProps {
  agent: AgentNodeData | null;
  onClose: () => void;
}

const MANDATES: Record<string, string> = {
  research_analyst: 'Gather credible empirical evidence, evaluate source tier quality, and formulate evidence-backed findings.',
  product_strategist: 'Translate research evidence and user contracts into prioritized MVP feature specifications and acceptance criteria.',
  ai_architect: 'Design model selection, retrieval pipeline, embeddings, evaluation dataset, and prompt topologies.',
  system_architect: 'Architect backend services, API contracts, data schemas, caching tiers, and event pub/sub infrastructure.',
  privacy_risk: 'Identify design risks, student/user data sensitivity, retention bounds, and mandatory human escalation gates.',
  consistency_reviewer: 'Inspect all intermediate artifacts for cross-claim contradictions, unsupported assertions, and policy violations.',
  solutions_officer: 'Synthesize verified inputs into a coherent, exportable Final Project Blueprint.',
};

export function NodeInspector({ agent, onClose }: NodeInspectorProps) {
  if (!agent) return null;

  const mandate = MANDATES[agent.role] || agent.mandate || 'Execute governed specialized tasks within role boundaries.';
  const budgetPct = Math.min((agent.tokensUsed / (agent.tokenBudget || 1)) * 100, 100);

  return (
    <div className="w-80 lg:w-96 flex flex-col h-full bg-[#080d1a]/85 backdrop-blur-2xl border-l border-white/10 p-5 overflow-y-auto shadow-2xl z-30 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              {agent.role.replace('_', ' ')}
            </h3>
            <span className="text-xs text-slate-400 font-mono">Specialist Agent</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Status & Metrics */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
          <span className="text-xs text-slate-400 font-mono">Current Status</span>
          <StatusBadge status={agent.status} />
        </div>

        {/* Token Budget Meter */}
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-purple-400" /> Token Usage
            </span>
            <span className="text-purple-300 font-semibold">{agent.tokensUsed} / {agent.tokenBudget}</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden w-full">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full transition-all duration-300"
              style={{ width: `${budgetPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Role Mandate */}
      <div className="mb-6 space-y-2">
        <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" /> Role Mandate
        </h4>
        <p className="text-xs text-slate-300 leading-relaxed p-3 rounded-xl bg-white/[0.02] border border-white/5">
          {mandate}
        </p>
      </div>

      {/* Permitted Tools */}
      <div className="mb-6 space-y-2">
        <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Wrench className="w-3.5 h-3.5 text-indigo-400" /> Permitted Tool Catalog
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {['document_retrieval', 'schema_validator', 'veritas_emitter'].map((tool) => (
            <span
              key={tool}
              className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-[10px] font-mono text-slate-300"
            >
              {tool}
            </span>
          ))}
        </div>
      </div>

      {/* Task Ownership */}
      <div className="space-y-2">
        <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-emerald-400" /> Task Assigned
        </h4>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-200">Execution Phase</span>
            <span className="text-[10px] font-mono text-cyan-400">P-01 Grounded</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Produces verified structured artifact envelopes with SHA-256 canonical hashing.
          </p>
        </div>
      </div>
    </div>
  );
}
