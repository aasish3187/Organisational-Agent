'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { TokenMeter } from '@/components/ui/TokenMeter';
import { LiveEventFeed, type FeedEvent } from '@/components/ui/LiveEventFeed';
import {
  ShieldCheck,
  Cpu,
  Database,
  Sparkles,
  ArrowRight,
  Zap,
  Layers,
  Terminal,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { fetchHealth, createProject, submitIntake, type HealthStatus } from '@/lib/api';

const SAMPLE_MISSIONS = [
  {
    id: 'edtech',
    title: '🎓 EdTech (Primary Demo)',
    domain: 'edtech',
    idea: 'Design a multilingual AI exam-prep platform for B.Tech students in India',
    tags: ['Multilingual NLP', 'Student Privacy', 'Exam Prep'],
  },
  {
    id: 'marketplace',
    title: '🍱 Food Redistribution',
    domain: 'marketplace',
    idea: 'Build a surplus-food redistribution marketplace connecting restaurants with food banks',
    tags: ['Logistics', 'Perishability Risk', 'Matching Engine'],
  },
  {
    id: 'campus',
    title: '🏛️ Grievance Triage',
    domain: 'campus-admin',
    idea: 'AI-assisted student grievance triage system with synthetic policy documents',
    tags: ['Policy Enforcement', 'Escalation Gate', 'Audit Chain'],
  },
];

const SAMPLE_EVENTS: FeedEvent[] = [
  {
    id: 'evt_001',
    sequence: 0,
    type: 'run_initialized',
    actor: 'system',
    summary: 'Organization compiled with 6 governed specialist agents',
    hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    timestamp: new Date().toISOString(),
  },
  {
    id: 'evt_002',
    sequence: 1,
    type: 'mnemos_retrieved',
    actor: 'mnemos',
    summary: 'Retrieved 2 process atoms for student data privacy & multilingual NLP',
    hash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
    timestamp: new Date().toISOString(),
  },
  {
    id: 'evt_003',
    sequence: 2,
    type: 'task_started',
    actor: 'research_analyst',
    summary: 'Gathering regional NLP corpus evidence & accreditation standards',
    hash: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',
    timestamp: new Date().toISOString(),
  },
  {
    id: 'evt_004',
    sequence: 3,
    type: 'policy_check_passed',
    actor: 'compliance_gate',
    summary: 'P-02 Personal data activates Privacy/Risk Analyst role',
    hash: '992a0e987c6543210fedcba9876543210fedcba9876543210fedcba987654321',
    timestamp: new Date().toISOString(),
  },
];

export default function LandingPage() {
  const router = useRouter();
  const [idea, setIdea] = useState(SAMPLE_MISSIONS[0].idea);
  const [selectedDomain, setSelectedDomain] = useState(SAMPLE_MISSIONS[0].domain);
  const [mode, setMode] = useState<'FAST' | 'BALANCED' | 'DEEP'>('BALANCED');
  const [modelPolicy, setModelPolicy] = useState<'AUTO' | 'BALANCE' | 'STRICT' | 'NOCAP'>('AUTO');
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchHealth()
      .then((data) => setHealth(data))
      .catch((err) => console.warn('Health check failed:', err));
  }, []);

  const handleSelectSample = (sample: typeof SAMPLE_MISSIONS[0]) => {
    setIdea(sample.idea);
    setSelectedDomain(sample.domain);
    setStatusMessage(`Loaded preset: ${sample.title}`);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleStartMission = async () => {
    if (!idea.trim()) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    setStatusMessage('Creating project and interpreting mission intake...');

    try {
      // 1. Create Project
      const project = await createProject(
        `${selectedDomain.toUpperCase()} — Mission`,
        idea
      );

      // 2. Submit Intake
      await submitIntake(project.id, idea, selectedDomain);

      setStatusMessage('Idea Contract ready. Redirecting to Contract review...');
      setTimeout(() => {
        router.push(`/projects/${project.id}/contract`);
      }, 500);
    } catch (err: any) {
      console.error('Mission start error:', err);
      setErrorMessage(err.message || 'Failed to initialize mission. Falling back to demo mode.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      {/* Top Navigation Bar */}
      <header className="w-full border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-600/30 border border-purple-500/50 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Cpu className="w-4 h-4 text-purple-300" />
            </div>
            <div>
              <span className="font-bold tracking-tight text-white flex items-center gap-2">
                NEXUS <span className="text-xs font-mono text-purple-400 font-normal px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/20">OS</span>
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6 text-xs text-slate-400 font-mono">
            <span
              onClick={() => router.push('/lab')}
              className="flex items-center gap-1.5 hover:text-slate-200 transition-colors cursor-pointer"
            >
              <Terminal className="w-3.5 h-3.5 text-purple-400" /> Policy Lab
            </span>
          </div>

          <div className="flex items-center gap-3">
            {health?.demo_mode ? (
              <span className="bg-cyan-500/10 text-cyan-300 text-xs font-mono px-2.5 py-1 rounded-full border border-cyan-500/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                DEMO REPLAY
              </span>
            ) : (
              <span className="bg-emerald-500/10 text-emerald-300 text-xs font-mono px-2.5 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                LIVE
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 flex flex-col items-center w-full">
        {/* Hero Tagline */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur-md mb-6">
          <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
          <span className="text-xs font-mono tracking-wider text-purple-200 uppercase">
            Governed AI Organization Operating System
          </span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-center max-w-4xl bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent mb-4 leading-tight">
          Turn one raw idea into a governed AI organization.
        </h1>
        <p className="text-slate-400 text-base md:text-lg text-center max-w-2xl mb-10 leading-relaxed">
          NEXUS dynamically compiles specialized agent teams, enforces strict governance boundaries, cryptographically chains every event with VERITAS, and returns a verified project blueprint.
        </p>

        {/* Hero Mission Input Card (glass-thick) */}
        <GlassCard tier="thick" className="w-full max-w-3xl mb-12 flex flex-col gap-6 shadow-2xl shadow-purple-950/20">
          {/* Preset Example Chips */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Choose a Seeded Mission or write your own:
            </span>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_MISSIONS.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => handleSelectSample(sample)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all duration-200 cursor-pointer font-medium ${
                    idea === sample.idea
                      ? 'bg-purple-500/20 text-purple-200 border-purple-500/40 shadow-sm shadow-purple-900/30'
                      : 'glass-thin text-slate-300 hover:bg-white/10 hover:text-white border-white/10'
                  }`}
                >
                  {sample.title}
                </button>
              ))}
            </div>
          </div>

          {/* Textarea Input */}
          <div className="relative">
            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="Describe your raw idea (e.g. Build an AI-assisted compliance review system for medical device audits...)"
              rows={4}
              className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-slate-100 placeholder-slate-500 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all resize-none font-sans"
            />
          </div>

          {/* Configuration Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-white/5">
            {/* Mode Selector Pill Group */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400">Mode:</span>
              <div className="inline-flex rounded-lg p-1 bg-black/40 border border-white/10 text-xs font-mono">
                {(['FAST', 'BALANCED', 'DEEP'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`px-3 py-1 rounded-md transition-all ${
                      mode === m
                        ? 'bg-purple-600 text-white shadow-md font-semibold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Model Policy Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400">Policy:</span>
              <div className="inline-flex rounded-lg p-1 bg-black/40 border border-white/10 text-xs font-mono">
                {(['AUTO', 'BALANCE', 'STRICT', 'NOCAP'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setModelPolicy(p)}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      modelPolicy === p
                        ? 'bg-cyan-600 text-white font-semibold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Primary Action Button */}
            <GlassButton
              variant="primary"
              size="lg"
              onClick={handleStartMission}
              disabled={isSubmitting || !idea.trim()}
              className="gap-2 shrink-0 font-semibold"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-purple-200 border-t-transparent rounded-full animate-spin" />
                  Interpreting Intake...
                </>
              ) : (
                <>
                  Start Mission
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </GlassButton>
          </div>

          {/* Interactive Status & Error Feedback */}
          {statusMessage && (
            <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30 text-xs font-mono text-purple-300 flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs font-mono text-rose-300 flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </GlassCard>

        {/* Live HUD & Telemetry Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mb-12">
          <div className="md:col-span-2">
            <LiveEventFeed events={SAMPLE_EVENTS} />
          </div>
          <div className="flex flex-col gap-4">
            <TokenMeter
              tokensUsed={8420}
              budgetTokens={30000}
              costUsd={0.0042}
              budgetCostUsd={2.0}
            />
            <GlassCard tier="thin" className="p-3.5 flex flex-col gap-1.5 text-xs font-mono text-slate-400">
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" /> VERITAS Hash
                </span>
                <span className="text-cyan-400">SHA-256 Active</span>
              </div>
              <span className="text-[10px] text-slate-500 truncate">
                Genesis: 00000000000000000000000000000000
              </span>
            </GlassCard>
          </div>
        </div>

        {/* Three Proof / Architecture Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
          {/* Proof 1: Dynamic Organization Compiler */}
          <GlassCard tier="regular" className="flex flex-col gap-4 hover:-translate-y-1 transition-all duration-300">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 w-fit border border-purple-500/20">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">Dynamic Org Compiler</h3>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                No fixed chat rooms. The compiler selects a minimal justified team per mission with explicit mandates, tools, and token limits.
              </p>
            </div>
            <div className="mt-auto pt-4 flex items-center justify-between border-t border-white/5 text-xs text-slate-400 font-mono">
              <span>Governance</span>
              <StatusBadge status="ACTIVE" />
            </div>
          </GlassCard>

          {/* Proof 2: VERITAS Cryptographic Chain */}
          <GlassCard tier="regular" className="flex flex-col gap-4 hover:-translate-y-1 transition-all duration-300">
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 w-fit border border-cyan-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">VERITAS Cryptographic Chain</h3>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                Every prompt, tool call, artifact version, and review decision is SHA-256 chained in a tamper-evident audit ledger.
              </p>
            </div>
            <div className="mt-auto pt-4 flex items-center justify-between border-t border-white/5 text-xs text-slate-400 font-mono">
              <span>Proof</span>
              <span className="text-cyan-400">Tamper-Evident</span>
            </div>
          </GlassCard>

          {/* Proof 3: MNEMOS Memory */}
          <GlassCard tier="regular" className="flex flex-col gap-4 hover:-translate-y-1 transition-all duration-300">
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 w-fit border border-indigo-500/20">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">MNEMOS Memory</h3>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                Learns reusable process atoms from completed runs, retrieving relevant lessons via hybrid tag-filtering and semantic reranking.
              </p>
            </div>
            <div className="mt-auto pt-4 flex items-center justify-between border-t border-white/5 text-xs text-slate-400 font-mono">
              <span>Learning</span>
              <span className="text-indigo-400">Process Atoms</span>
            </div>
          </GlassCard>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/5 py-6 text-center text-xs font-mono text-slate-500">
        NEXUS Organization OS · Dynamic Governance · Cryptographic Integrity · Reusable Memory
      </footer>
    </div>
  );
}
