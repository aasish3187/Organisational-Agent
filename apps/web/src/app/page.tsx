'use client';

import React, { useEffect, useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ShieldCheck, Cpu, Database, Activity, Sparkles, Terminal } from 'lucide-react';
import { fetchHealth, type HealthStatus } from '@/lib/api';

export default function LandingPage() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHealth()
      .then((data) => {
        setHealth(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to connect to backend API');
        setLoading(false);
      });
  }, []);

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 max-w-6xl mx-auto w-full">
      {/* Header Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur-md mb-8">
        <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
        <span className="text-xs font-mono tracking-wider text-purple-200 uppercase">
          NEXUS Organization OS — Phase 0 Active
        </span>
        {health?.demo_mode && (
          <span className="bg-cyan-500/20 text-cyan-300 text-[10px] font-mono px-2 py-0.5 rounded border border-cyan-500/30">
            DEMO REPLAY
          </span>
        )}
      </div>

      {/* Main Title */}
      <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-center bg-gradient-to-b from-white via-slate-200 to-slate-400 bg-clip-text text-transparent mb-4">
        Governed Multi-Agent Operating System
      </h1>
      <p className="text-slate-400 text-lg md:text-xl text-center max-w-2xl mb-12">
        Transforms raw human ideas into cryptographically verified, explainable project blueprints through dynamic AI organization compilation.
      </p>

      {/* Grid of Core Layers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-12">
        {/* Organization Compiler Card */}
        <GlassCard tier="regular" className="flex flex-col gap-4">
          <div className="p-3 rounded-lg bg-purple-500/10 w-fit text-purple-400 border border-purple-500/20">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-100">Org Compiler</h3>
            <p className="text-sm text-slate-400 mt-1">
              Dynamically composes specialized agent teams and assigns work by capability with bounded authority.
            </p>
          </div>
          <div className="mt-auto pt-4 flex items-center justify-between border-t border-white/5 text-xs text-slate-400">
            <span>Status</span>
            <StatusBadge status="ACTIVE" />
          </div>
        </GlassCard>

        {/* VERITAS Chain Card */}
        <GlassCard tier="regular" className="flex flex-col gap-4">
          <div className="p-3 rounded-lg bg-cyan-500/10 w-fit text-cyan-400 border border-cyan-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-100">VERITAS Chain</h3>
            <p className="text-sm text-slate-400 mt-1">
              SHA-256 tamper-evident event log securing every prompt, artifact, tool call, and policy check.
            </p>
          </div>
          <div className="mt-auto pt-4 flex items-center justify-between border-t border-white/5 text-xs text-slate-400">
            <span>Integrity</span>
            <span className="text-cyan-400 font-mono">100% Chained</span>
          </div>
        </GlassCard>

        {/* MNEMOS Memory Card */}
        <GlassCard tier="regular" className="flex flex-col gap-4">
          <div className="p-3 rounded-lg bg-indigo-500/10 w-fit text-indigo-400 border border-indigo-500/20">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-100">MNEMOS Memory</h3>
            <p className="text-sm text-slate-400 mt-1">
              Cross-run organizational learning distilling process atoms with hybrid tag-filtered semantic reranking.
            </p>
          </div>
          <div className="mt-auto pt-4 flex items-center justify-between border-t border-white/5 text-xs text-slate-400">
            <span>Storage</span>
            <span className="text-indigo-400 font-mono">Process Atoms</span>
          </div>
        </GlassCard>
      </div>

      {/* Backend API Connection Status Card */}
      <GlassCard tier="thick" className="w-full max-w-2xl flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-emerald-400" />
            <h4 className="font-semibold text-slate-200">System Environment Diagnostic</h4>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-mono text-emerald-400">ONLINE</span>
          </div>
        </div>

        <div className="bg-black/40 rounded-lg p-4 font-mono text-xs text-slate-300 border border-white/5 space-y-1.5">
          <div className="flex justify-between">
            <span className="text-slate-500">API Health:</span>
            <span>{loading ? 'Checking...' : error ? `Error: ${error}` : health?.status}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Backend App:</span>
            <span>{health?.app || 'NEXUS Organization OS'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Version:</span>
            <span>{health?.version || '0.1.0'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Environment:</span>
            <span>{health?.environment || 'development'}</span>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <GlassButton variant="secondary" size="sm" onClick={() => window.location.reload()}>
            Refresh Diagnostics
          </GlassButton>
        </div>
      </GlassCard>
    </main>
  );
}
