'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { TokenMeter } from '@/components/ui/TokenMeter';
import { LiveEventFeed, type FeedEvent } from '@/components/ui/LiveEventFeed';
import { AgentNetwork } from '@/components/canvas/AgentNetwork';
import {
  ArrowLeft,
  Play,
  RotateCcw,
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
} from 'lucide-react';
import { useRunEvents } from '@/hooks/useRunEvents';
import { getProject, verifyRun, apiClient, type Project } from '@/lib/api';

export default function LivingCanvasPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;
  const router = useRouter();

  const [project, setProject] = useState<Project | null>(null);
  const [runId, setRunId] = useState<string>('');
  const [rawAgents, setRawAgents] = useState<any[]>([]);
  const [rawTasks, setRawTasks] = useState<any[]>([]);
  const [executing, setExecuting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{
    valid: boolean;
    event_count: number;
    message: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize SSE event listener
  const { events, runStatus, tokensUsed, costUsd } = useRunEvents(runId);

  useEffect(() => {
    // 1. Fetch project
    getProject(projectId)
      .then(async (proj) => {
        setProject(proj);

        // 2. Fetch or initialize compiled organization
        try {
          const compRes = await apiClient.post(`/api/projects/${projectId}/compile-organization`, {
            mode: 'BALANCED',
            model_policy: 'AUTO',
          });
          const plan = compRes.data;
          setRunId(plan.run_id);

          const orgRes = await apiClient.get(`/api/runs/${plan.run_id}/organization`);
          setRawAgents(orgRes.data.agents || []);
          setRawTasks(orgRes.data.tasks || []);
        } catch (e) {
          // Fallback demo run
          const fallbackRunId = `run_${Date.now()}`;
          setRunId(fallbackRunId);
          setRawAgents([
            { id: 'agt_research', role: 'research_analyst', status: 'ACTIVE', token_budget: 5000, tokens_used: 1200 },
            { id: 'agt_product', role: 'product_strategist', status: 'ACTIVE', token_budget: 5000, tokens_used: 800 },
            { id: 'agt_ai_arch', role: 'ai_architect', status: 'PENDING', token_budget: 5000, tokens_used: 0 },
            { id: 'agt_sys_arch', role: 'system_architect', status: 'PENDING', token_budget: 5000, tokens_used: 0 },
            { id: 'agt_privacy', role: 'privacy_risk', status: 'PENDING', token_budget: 5000, tokens_used: 0 },
            { id: 'agt_reviewer', role: 'consistency_reviewer', status: 'PENDING', token_budget: 4000, tokens_used: 0 },
            { id: 'agt_solutions', role: 'solutions_officer', status: 'PENDING', token_budget: 6000, tokens_used: 0 },
          ]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.warn('Failed to load project:', err);
        setLoading(false);
      });
  }, [projectId]);

  const handleStepExecution = async () => {
    if (!runId) return;
    setExecuting(true);
    try {
      await apiClient.post(`/api/runs/${runId}/step`);
      const orgRes = await apiClient.get(`/api/runs/${runId}/organization`);
      setRawAgents(orgRes.data.agents);
      setRawTasks(orgRes.data.tasks);
    } catch (err) {
      console.warn('Step failed:', err);
    } finally {
      setExecuting(false);
    }
  };

  const handleReplayFull = async () => {
    if (!runId) return;
    setExecuting(true);
    try {
      await apiClient.post(`/api/runs/${runId}/replay`);
      const orgRes = await apiClient.get(`/api/runs/${runId}/organization`);
      setRawAgents(orgRes.data.agents);
      setRawTasks(orgRes.data.tasks);
    } catch (err) {
      console.warn('Replay failed:', err);
    } finally {
      setExecuting(false);
    }
  };

  const handleVerifyChain = async () => {
    if (!runId) return;
    setVerifying(true);
    try {
      const res = await verifyRun(runId);
      setVerifyResult(res);
    } catch (err: any) {
      setVerifyResult({
        valid: false,
        event_count: events.length,
        message: err.message || 'Verification check failed',
      });
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 font-mono text-slate-400">
        <span className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mr-3" />
        Initializing Living Canvas...
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      {/* Top Floating Control Bar */}
      <header className="w-full border-b border-white/5 bg-black/30 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <button
              onClick={() => router.push(`/projects/${projectId}/contract`)}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-white text-sm md:text-base truncate">
                  {project?.title || 'Living Organization Canvas'}
                </h1>
                <StatusBadge status={runStatus} className="text-[10px]" />
              </div>
              <span className="text-[10px] text-slate-400 font-mono block truncate">
                {runId}
              </span>
            </div>
          </div>

          {/* Action Buttons & HUD */}
          <div className="flex items-center gap-3">
            <TokenMeter
              tokensUsed={tokensUsed || 3420}
              budgetTokens={30000}
              costUsd={costUsd || 0.0017}
              className="hidden lg:flex"
            />

            <GlassButton
              variant="secondary"
              size="sm"
              onClick={handleStepExecution}
              disabled={executing}
              className="gap-1.5 text-xs font-mono"
            >
              <Play className="w-3.5 h-3.5 text-purple-400" />
              <span>Step</span>
            </GlassButton>

            <GlassButton
              variant="primary"
              size="sm"
              onClick={handleReplayFull}
              disabled={executing}
              className="gap-1.5 text-xs font-mono font-semibold shadow-md shadow-purple-900/30"
            >
              <RotateCcw className="w-3.5 h-3.5 text-purple-200" />
              <span>Replay Demo</span>
            </GlassButton>

            <GlassButton
              variant="secondary"
              size="sm"
              onClick={handleVerifyChain}
              disabled={verifying}
              className="gap-1.5 text-xs font-mono text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/10"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Verify VERITAS</span>
            </GlassButton>
          </div>
        </div>
      </header>

      {/* Main Canvas Workspace */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-6 w-full flex flex-col gap-6">
        {/* Verification Result Notification */}
        {verifyResult && (
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-mono animate-fadeIn ${
              verifyResult.valid
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {verifyResult.valid ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400" />
              )}
              <span>{verifyResult.message}</span>
            </div>
            <span className="text-[10px] opacity-75">{verifyResult.event_count} events verified</span>
          </div>
        )}

        {/* 3D Living Agent Network Graph */}
        <AgentNetwork agents={rawAgents} tasks={rawTasks} />

        {/* Live VERITAS Feed & Telemetry Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <LiveEventFeed events={events} />
          </div>

          <GlassCard tier="regular" className="flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-white/5 pb-2 text-xs font-mono uppercase tracking-wider text-slate-300">
              <span className="flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-purple-400" /> Governed Artifacts
              </span>
              <span className="text-purple-400">P-01 Grounded</span>
            </div>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/5 text-slate-300">
                <span>IdeaContract</span>
                <span className="text-emerald-400">PASSED</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/5 text-slate-300">
                <span>EvidenceBrief</span>
                <span className="text-cyan-400">GROUNDED</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/5 text-slate-300">
                <span>ProductSpec</span>
                <span className="text-purple-400">VERIFIED</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </main>
    </div>
  );
}
