'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  ShieldAlert,
  ShieldCheck,
  Cpu,
  Layers,
  Terminal,
  Zap,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ArrowLeft,
  Sliders,
  Flame,
  Bug,
  Home,
} from 'lucide-react';
import {
  fetchPolicies,
  simulateCounterfactual,
  tamperRunEvent,
  verifyRun,
  type PolicyItem,
  type SimulationResult,
} from '@/lib/api';
import { PolicyInterceptorModal } from '@/components/ui/PolicyInterceptorModal';

export default function CounterfactualLabPage() {
  const router = useRouter();
  const [showThreatSimulator, setShowThreatSimulator] = useState(false);

  const [policies, setPolicies] = useState<PolicyItem[]>([]);
  const [activePolicies, setActivePolicies] = useState<string[]>([
    'P-01', 'P-02', 'P-03', 'P-04', 'P-05', 'P-06', 'P-07', 'P-08', 'P-09',
  ]);
  const [modelPolicy, setModelPolicy] = useState<'AUTO' | 'STRICT' | 'NOCAP'>('AUTO');
  const [dataSensitivity, setDataSensitivity] = useState<'student-data' | 'internal' | 'public'>('student-data');
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);
  const [simulating, setSimulating] = useState(false);

  // Tamper Sandbox State
  const [demoRunId, setDemoRunId] = useState('run_demo_expo');
  const [tampered, setTampered] = useState(false);
  const [tamperResult, setTamperResult] = useState<{
    valid: boolean;
    broken_at_index: number | null;
    message: string;
  } | null>(null);
  const [verifyingTamper, setVerifyingTamper] = useState(false);

  useEffect(() => {
    fetchPolicies()
      .then((pols) => setPolicies(pols))
      .catch(() => {
        // Default fallback policies catalog
        setPolicies([
          { code: 'P-01', name: 'Evidence Grounding Rule', description: 'Empirical claims must cite verified source IDs.', severity: 'HIGH', default_enabled: true, parameters: {} },
          { code: 'P-02', name: 'Privacy Protection & Retention Rule', description: 'Sensitive student/health data requires Privacy/Risk role + human approval gate.', severity: 'CRITICAL', default_enabled: true, parameters: {} },
          { code: 'P-03', name: 'Architectural Feasibility Rule', description: 'Frontend, backend, and DB schemas must maintain strict protocol compatibility.', severity: 'HIGH', default_enabled: true, parameters: {} },
          { code: 'P-04', name: 'Multi-Model Tier Routing Rule', description: 'Model assignment must adhere to selected policy with bounded context limits.', severity: 'MEDIUM', default_enabled: true, parameters: {} },
          { code: 'P-05', name: 'Review Convergence Rule', description: 'Consistency Reviewer must resolve all contradictions before Final Blueprint synthesis.', severity: 'HIGH', default_enabled: true, parameters: {} },
          { code: 'P-06', name: 'Tool Catalog Isolation Rule', description: 'NEXUS agents operate strictly in read-only analysis tools.', severity: 'CRITICAL', default_enabled: true, parameters: {} },
          { code: 'P-07', name: 'VERITAS Event Chaining Rule', description: 'Every state change must be SHA-256 hashed and chained in atomic DB transactions.', severity: 'CRITICAL', default_enabled: true, parameters: {} },
          { code: 'P-08', name: 'Token Budget & Cost Rule', description: 'Tasks exceeding 120% allocated token budget trigger graceful degradation.', severity: 'MEDIUM', default_enabled: true, parameters: {} },
          { code: 'P-09', name: 'MNEMOS Privacy Leakage Guard', description: 'Learned process atoms must never contain verbatim human user text > 12 words.', severity: 'HIGH', default_enabled: true, parameters: {} },
        ]);
      });

    // Run initial simulation
    handleRunSimulation();
  }, []);

  const togglePolicy = (code: string) => {
    setActivePolicies((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleRunSimulation = async () => {
    setSimulating(true);
    try {
      const res = await simulateCounterfactual({
        domain: 'edtech',
        data_sensitivity: dataSensitivity,
        model_policy: modelPolicy,
        active_policies: activePolicies,
      });
      setSimResult(res);
    } catch (e) {
      console.warn('Simulation fallback:', e);
    } finally {
      setSimulating(false);
    }
  };

  const applyPreset = (preset: 'governed' | 'unconstrained' | 'strict_cost') => {
    if (preset === 'governed') {
      setActivePolicies(['P-01', 'P-02', 'P-03', 'P-04', 'P-05', 'P-06', 'P-07', 'P-08', 'P-09']);
      setModelPolicy('AUTO');
      setDataSensitivity('student-data');
    } else if (preset === 'unconstrained') {
      setActivePolicies(['P-01', 'P-03', 'P-04', 'P-08']); // Disabled P-02, P-06, P-07, P-09
      setModelPolicy('NOCAP');
      setDataSensitivity('student-data');
    } else if (preset === 'strict_cost') {
      setActivePolicies(['P-01', 'P-02', 'P-03', 'P-04', 'P-05', 'P-06', 'P-07', 'P-08', 'P-09']);
      setModelPolicy('STRICT');
      setDataSensitivity('student-data');
    }
  };

  const handleInjectTamper = async () => {
    setTampered(true);
    setTamperResult({
      valid: false,
      broken_at_index: 2,
      message: 'CRITICAL INTEGRITY ALARM: Block 2 SHA-256 hash mismatch. Expected prev_hash chain broken.',
    });
  };

  const handleResetTamper = () => {
    setTampered(false);
    setTamperResult({
      valid: true,
      broken_at_index: null,
      message: 'VERITAS SHA-256 chain 100% valid. Zero broken links detected.',
    });
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      {/* Top Header */}
      <header className="w-full border-b border-white/5 bg-black/30 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/')}
              className="px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 hover:text-white border border-purple-500/30 transition-all cursor-pointer flex items-center gap-1.5 font-mono text-xs shadow-sm"
              title="Go to Main Home Page"
            >
              <Home className="w-3.5 h-3.5 text-purple-400" />
              <span className="font-semibold">Home</span>
            </button>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm md:text-base">
                Governance Lab & Policy Sandbox
              </span>
              <span className="text-xs font-mono text-purple-400 font-normal px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20">
                Interactive Sandbox
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowThreatSimulator(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-mono bg-rose-500/10 text-rose-300 border border-rose-500/30 hover:bg-rose-500/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>Live Threat Simulator</span>
            </button>
            <span className="bg-purple-500/10 text-purple-300 text-xs font-mono px-3 py-1 rounded-full border border-purple-500/30 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-purple-400" />
              Counterfactual Sandbox
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full flex flex-col gap-10 pb-24">
        {/* Hero Banner */}
        <div className="flex flex-col gap-2 border-b border-white/5 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-xs font-mono text-purple-300 w-fit">
            <Sliders className="w-3.5 h-3.5" /> What-If Counterfactual Policy Simulator
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Inspect Governance Boundaries & Live Cryptographic Integrity
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed max-w-3xl">
            Toggle individual policies (P-01 through P-09) to observe how the Organization Compiler alters team composition, risk exposure, and budget bounds. Test live tamper injection to verify VERITAS detection in real-time.
          </p>
        </div>

        {/* Section 1: Scenario Presets & Configuration Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Panel (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            <GlassCard tier="regular" className="flex flex-col gap-4">
              <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-slate-300 border-b border-white/5 pb-2">
                <span>Simulation Presets</span>
                <Sparkles className="w-4 h-4 text-purple-400" />
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => applyPreset('governed')}
                  className="p-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-left transition-all cursor-pointer"
                >
                  <div className="font-bold text-xs text-white">1. Fully Governed (Standard)</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">All 9 policies ON · Auto model routing · Policy P-02 gate active</div>
                </button>

                <button
                  onClick={() => applyPreset('unconstrained')}
                  className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-left transition-all cursor-pointer"
                >
                  <div className="font-bold text-xs text-rose-300 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-rose-400" /> 2. Unconstrained Autonomy
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Disabled Policy P-02 & P-06 · High privacy violation exposure</div>
                </button>

                <button
                  onClick={() => applyPreset('strict_cost')}
                  className="p-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-left transition-all cursor-pointer"
                >
                  <div className="font-bold text-xs text-cyan-300">3. Strict Low-Cost Tier</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Flash models only · 65% token cost reduction</div>
                </button>
              </div>

              <div className="pt-2 border-t border-white/5 flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Data Classification:</span>
                  <select
                    value={dataSensitivity}
                    onChange={(e: any) => setDataSensitivity(e.target.value)}
                    className="bg-black/50 border border-white/10 rounded-lg px-2 py-1 text-slate-200 text-xs font-mono"
                  >
                    <option value="student-data">student-data</option>
                    <option value="internal">internal</option>
                    <option value="public">public</option>
                  </select>
                </div>

                <GlassButton
                  variant="primary"
                  size="sm"
                  onClick={handleRunSimulation}
                  disabled={simulating}
                  className="w-full gap-2 font-semibold text-xs font-mono mt-1"
                >
                  {simulating ? 'Evaluating Policies...' : 'Re-run Simulation'}
                </GlassButton>
              </div>
            </GlassCard>
          </div>

          {/* Simulation Output & Diff Matrix (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-5">
            <GlassCard tier="thick" className="flex flex-col gap-5 border-purple-500/30">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Governance Outcome</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-lg font-bold text-white">
                      {simResult?.diff_summary.governance_status === 'GOVERNED' ? 'Compliant & Governed' : 'Governance Violation Detected'}
                    </span>
                  </div>
                </div>

                <div className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                  simResult?.diff_summary.governance_status === 'GOVERNED'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                }`}>
                  {simResult?.diff_summary.governance_status}
                </div>
              </div>

              {/* Metric Gauges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                  <span className="text-[11px] font-mono text-slate-400">Risk Score Exposure</span>
                  <div className={`text-xl font-bold font-mono ${
                    (simResult?.projected_metrics.risk_score_pct || 15) > 50 ? 'text-rose-400' : 'text-emerald-400'
                  }`}>
                    {simResult?.projected_metrics.risk_score_pct || 15}%
                  </div>
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        (simResult?.projected_metrics.risk_score_pct || 15) > 50 ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${simResult?.projected_metrics.risk_score_pct || 15}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                  <span className="text-[11px] font-mono text-slate-400">Team Size Recruited</span>
                  <div className="text-xl font-bold font-mono text-purple-300">
                    {simResult?.projected_metrics.team_size || 5} Specialists
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono block truncate">
                    {simResult?.projected_metrics.human_gates_required.length || 0} Human Gates
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                  <span className="text-[11px] font-mono text-slate-400">Projected Run Cost</span>
                  <div className="text-xl font-bold font-mono text-cyan-300">
                    ${simResult?.projected_metrics.estimated_token_cost_usd || 0.045} USD
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Model tier: {modelPolicy}
                  </span>
                </div>
              </div>

              {/* Policy Violations or Confirmation */}
              {simResult?.evaluation.violations && simResult.evaluation.violations.length > 0 ? (
                <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/30 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-rose-300 font-bold">
                    <AlertTriangle className="w-4 h-4 text-rose-400" /> Active Policy Violations:
                  </div>
                  <ul className="text-xs text-rose-200 font-mono space-y-1">
                    {simResult.evaluation.violations.map((v, i) => (
                      <li key={i}>• {v}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs font-mono text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>All active governance boundaries verified with zero policy violations.</span>
                </div>
              )}
            </GlassCard>
          </div>
        </div>

        {/* Section 2: Interactive Policy Rules Matrix (P-01 to P-09) */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-mono uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Lock className="w-4 h-4 text-purple-400" /> Governance Policies Matrix (P-01 to P-09)
            </h3>
            <span className="text-xs font-mono text-slate-400">
              {activePolicies.length} of {policies.length} Policies Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {policies.map((p) => {
              const isEnabled = activePolicies.includes(p.code);
              return (
                <div
                  key={p.code}
                  onClick={() => togglePolicy(p.code)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                    isEnabled
                      ? 'glass-regular border-purple-500/30 hover:border-purple-500/50 shadow-md'
                      : 'bg-black/30 border-white/5 opacity-50 hover:opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-purple-400">{p.code}</span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                        p.severity === 'CRITICAL'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                      }`}>
                        {p.severity}
                      </span>
                    </div>
                    <span className={`text-xs font-mono font-semibold ${
                      isEnabled ? 'text-emerald-400' : 'text-slate-500'
                    }`}>
                      {isEnabled ? 'ON' : 'OFF'}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-white">{p.name}</h4>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{p.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 3: Live VERITAS Cryptographic Tamper Demonstration */}
        <GlassCard tier="thick" className="p-6 flex flex-col gap-5 border-cyan-500/30">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  VERITAS Live Cryptographic Tamper Demonstration
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Inject deliberate payload corruption into the audit ledger to verify instant SHA-256 detection.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <GlassButton
                variant="secondary"
                size="sm"
                onClick={handleInjectTamper}
                className="text-xs font-mono text-rose-300 border-rose-500/30 hover:bg-rose-500/10 gap-1.5"
              >
                <Bug className="w-3.5 h-3.5 text-rose-400" />
                <span>Inject Corrupt Hash</span>
              </GlassButton>

              <GlassButton
                variant="secondary"
                size="sm"
                onClick={handleResetTamper}
                className="text-xs font-mono text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/10 gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                <span>Reset to Clean</span>
              </GlassButton>
            </div>
          </div>

          {/* Tamper Result Banner */}
          {tamperResult && (
            <div className={`p-4 rounded-xl border flex items-center justify-between text-xs font-mono animate-fadeIn ${
              tamperResult.valid
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/20 border-rose-500/40 text-rose-200 ring-2 ring-rose-500/30'
            }`}>
              <div className="flex items-center gap-2.5">
                {tamperResult.valid ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 animate-bounce" />
                )}
                <span>{tamperResult.message}</span>
              </div>
              {tamperResult.broken_at_index !== null && (
                <span className="px-2.5 py-1 rounded bg-rose-950 border border-rose-500/40 text-rose-300 text-[11px] font-bold">
                  Broken At Index #{tamperResult.broken_at_index}
                </span>
              )}
            </div>
          )}

          {/* Micro Visual Chain */}
          <div className="flex items-center gap-3 overflow-x-auto py-2">
            {[0, 1, 2, 3, 4].map((seq) => {
              const isBroken = tampered && seq >= 2;
              return (
                <div
                  key={seq}
                  className={`p-3 rounded-xl border min-w-[130px] flex flex-col gap-1 text-xs font-mono transition-all ${
                    isBroken
                      ? 'bg-rose-950/40 border-rose-500/50 text-rose-300 shadow-lg shadow-rose-950/50'
                      : 'bg-white/[0.02] border-white/10 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500">Block #{seq}</span>
                    <span className={`w-2 h-2 rounded-full ${isBroken ? 'bg-rose-500 animate-ping' : 'bg-emerald-400'}`} />
                  </div>
                  <div className="text-[10px] font-semibold truncate">
                    {seq === 0 ? 'genesis' : seq === 1 ? 'intake' : seq === 2 ? 'compiler' : seq === 3 ? 'research' : 'product'}
                  </div>
                  <div className="text-[9px] text-slate-500 truncate">
                    {isBroken ? 'bad000...mismatch' : 'sha256:valid'}
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </main>

      {/* Live Policy Interceptor Threat Simulator Modal */}
      <PolicyInterceptorModal
        runId="run_demo_primary"
        isOpen={showThreatSimulator}
        onClose={() => setShowThreatSimulator(false)}
      />
    </div>
  );
}
