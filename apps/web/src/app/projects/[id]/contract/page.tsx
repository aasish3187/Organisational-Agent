'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  ShieldCheck,
  Cpu,
  Database,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Layers,
  FileCheck2,
  AlertCircle,
  HelpCircle,
  Users,
  Target,
  CheckCircle2,
} from 'lucide-react';
import {
  getProject,
  compileOrganization,
  type Project,
  type IdeaContract,
  type OrganizationPlan,
} from '@/lib/api';

export default function IdeaContractPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;
  const router = useRouter();

  const [project, setProject] = useState<Project | null>(null);
  const [contract, setContract] = useState<IdeaContract | null>(null);
  const [compiledPlan, setCompiledPlan] = useState<OrganizationPlan | null>(null);
  const [mode, setMode] = useState<'FAST' | 'BALANCED' | 'DEEP'>('BALANCED');
  const [loading, setLoading] = useState(true);
  const [compiling, setCompiling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch project details and stored contract
    getProject(projectId)
      .then((proj) => {
        setProject(proj);
        // Default contract fallback derived from project if needed
        setContract({
          title: proj.title,
          domain: 'edtech',
          target_audience: 'B.Tech engineering students and university faculty',
          problem_statement: proj.objective,
          success_criteria: [
            'Support for English, Hindi, Telugu, and Tamil with validated regional corpus',
            'Personalized adaptive question practice and syllabus coverage',
            'Privacy-preserving retention of student learning analytics',
          ],
          constraints: [
            'Low-latency response across mobile devices',
            'Strict compliance with student data retention policies (Policy P-02)',
            'Regional language terminology accuracy',
          ],
          assumptions: [
            'Target curriculum covers undergraduate engineering core subjects',
            'Initial deployment targets responsive web client',
          ],
          data_sensitivity: 'student-data',
          confidence: 0.88,
          open_questions: [
            'What specific regional languages should be prioritized for Phase 1?',
            'Will institutional SSO integration be required?',
          ],
          suggested_specialists: [
            'research_analyst',
            'product_strategist',
            'ai_architect',
            'system_architect',
            'privacy_risk',
            'consistency_reviewer',
            'solutions_officer',
          ],
        });
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load project contract');
        setLoading(false);
      });
  }, [projectId]);

  const handleCompile = async () => {
    setCompiling(true);
    try {
      const plan = await compileOrganization(projectId, mode, 'AUTO');
      setCompiledPlan(plan);
      setCompiling(false);
      setTimeout(() => {
        router.push(`/projects/${projectId}/canvas`);
      }, 700);
    } catch (err: any) {
      setError(err.message || 'Compilation failed');
      setCompiling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="flex flex-col items-center gap-3 font-mono text-sm text-slate-400">
          <span className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading Idea Contract...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      {/* Top Bar */}
      <header className="w-full border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <span className="font-bold text-white flex items-center gap-2 text-sm md:text-base">
                Idea Contract <span className="text-xs font-mono text-purple-400 font-normal px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20">{project?.id}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <StatusBadge status="SUBMITTED" />
            <span className="bg-cyan-500/10 text-cyan-300 text-xs font-mono px-2.5 py-1 rounded-full border border-cyan-500/30">
              VERITAS Chained
            </span>
          </div>
        </div>
      </header>

      {/* Main Contract Content */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full flex flex-col gap-6 pb-28">
        {/* Header Summary */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-xs font-mono text-purple-300 mb-2">
              <FileCheck2 className="w-3.5 h-3.5" /> Structured Mission Contract
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              {contract?.title || project?.title}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end text-xs font-mono">
              <span className="text-slate-500">Data Sensitivity</span>
              <span className="text-purple-400 font-semibold uppercase">{contract?.data_sensitivity}</span>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="flex flex-col items-end text-xs font-mono">
              <span className="text-slate-500">Interpreter Confidence</span>
              <span className="text-emerald-400 font-semibold">{((contract?.confidence || 0.85) * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>

        {/* 3-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Problem & Audience (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <GlassCard tier="regular" className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">
                <Target className="w-4 h-4 text-purple-400" />
                Problem Statement
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                {contract?.problem_statement}
              </p>
            </GlassCard>

            <GlassCard tier="regular" className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">
                <Users className="w-4 h-4 text-indigo-400" />
                Target Audience
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                {contract?.target_audience}
              </p>
            </GlassCard>

            <GlassCard tier="thin" className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                Open Clarification Questions
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                {contract?.open_questions.map((q, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-400 font-mono">?</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>
          </div>

          {/* Center Column: Criteria, Constraints, Assumptions (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <GlassCard tier="regular" className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Success Criteria
              </div>
              <ul className="space-y-2.5 text-xs text-slate-300">
                {contract?.success_criteria.map((sc, i) => (
                  <li key={i} className="flex items-start gap-2.5 p-2 rounded-lg bg-white/[0.02] border border-white/5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{sc}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>

            <GlassCard tier="regular" className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                Constraints & Policies
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                {contract?.constraints.map((c, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>

            <GlassCard tier="thin" className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">
                <AlertCircle className="w-4 h-4 text-slate-400" />
                Explicit Assumptions
              </div>
              <ul className="space-y-1.5 text-xs text-slate-400 italic font-mono">
                {contract?.assumptions.map((a, i) => (
                  <li key={i}>• {a}</li>
                ))}
              </ul>
            </GlassCard>
          </div>

          {/* Right Column: Suggested Specialists & Memory (3 cols) */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            <GlassCard tier="regular" className="flex flex-col gap-4">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">
                <span className="flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-purple-400" /> Specialist Roles
                </span>
                <span className="text-purple-400">{contract?.suggested_specialists.length}</span>
              </div>
              <div className="flex flex-col gap-2">
                {contract?.suggested_specialists.map((role) => (
                  <div
                    key={role}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.02] border border-white/5 text-xs font-mono"
                  >
                    <span className="text-slate-300">{role}</span>
                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Compiled Plan Preview Card */}
            {compiledPlan && (
              <GlassCard tier="thick" className="flex flex-col gap-3 border-purple-500/30 bg-purple-950/20">
                <div className="flex items-center justify-between text-xs font-mono text-purple-300">
                  <span className="font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Org Compiled
                  </span>
                  <StatusBadge status="ACTIVE" />
                </div>
                <div className="text-xs text-slate-300 font-mono space-y-1">
                  <div>Tasks: {compiledPlan.tasks.length}</div>
                  <div>Human Gates: {compiledPlan.human_gates.length}</div>
                  <div>Retrieved Atoms: {compiledPlan.retrieved_atoms.length}</div>
                </div>
                <button
                  onClick={() => router.push(`/projects/${projectId}/canvas`)}
                  className="pt-2 text-[11px] font-mono text-purple-300 hover:text-purple-100 flex items-center gap-1 cursor-pointer"
                >
                  Enter Living Canvas →
                </button>
              </GlassCard>
            )}
          </div>
        </div>
      </main>

      {/* Floating Bottom Sticky Action Bar (glass-thick) */}
      <div className="fixed bottom-6 inset-x-0 z-40 max-w-4xl mx-auto px-6">
        <GlassCard tier="thick" className="p-4 flex flex-wrap items-center justify-between gap-4 shadow-2xl shadow-purple-950/40 border-purple-500/30">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span>Execution Depth:</span>
              <div className="inline-flex rounded-lg p-1 bg-black/40 border border-white/10 text-xs">
                {(['FAST', 'BALANCED', 'DEEP'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`px-3 py-1 rounded-md transition-all font-mono ${
                      mode === m
                        ? 'bg-purple-600 text-white font-semibold shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <GlassButton
              variant="primary"
              size="lg"
              onClick={handleCompile}
              disabled={compiling}
              className="gap-2 font-semibold shadow-lg shadow-purple-900/40"
            >
              {compiling ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Compiling & Launching Canvas...
                </>
              ) : compiledPlan ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  Launch Living Canvas
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  Compile Organization
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </GlassButton>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
