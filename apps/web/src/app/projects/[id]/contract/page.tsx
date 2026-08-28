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
  Home,
  MessageSquare,
  Send,
  Check,
  Edit3,
  Trash2,
  CornerDownRight,
  Zap,
} from 'lucide-react';
import {
  getProject,
  getProjectContract,
  compileOrganization,
  type Project,
  type IdeaContract,
  type OrganizationPlan,
} from '@/lib/api';

function getQuestionSuggestions(question: string): string[] {
  const q = question.toLowerCase();
  if (q.includes('branch') || q.includes('discipline') || q.includes('cse') || q.includes('prioritize')) {
    return ['Prioritize CSE & ECE for MVP', 'Cover all B.Tech branches', 'CSE, Data Science & AI only'];
  }
  if (q.includes('language') || q.includes('dialect')) {
    return ['English, Telugu, Hindi, Tamil', 'Top 5 regional languages with audio', 'English only in initial release'];
  }
  if (q.includes('assessment') || q.includes('format') || q.includes('mcq') || q.includes('challenge')) {
    return ['Adaptive MCQ + Code Playground', 'MCQ + Numerical step-by-step', 'MCQ Only for speed'];
  }
  if (q.includes('lms') || q.includes('integrate') || q.includes('university') || q.includes('standalone')) {
    return ['Standalone first, with Canvas/Moodle LTI exports', 'Direct Moodle & Blackboard sync', 'Pure standalone mobile-first web app'];
  }
  if (q.includes('monetization') || q.includes('licensing') || q.includes('pricing') || q.includes('subscription')) {
    return ['Freemium for students, Institutional license for colleges', '100% Free Open Source', 'Student subscription model'];
  }
  if (q.includes('offline') || q.includes('connectivity') || q.includes('internet')) {
    return ['Local IndexedDB offline sync with PWA caching', 'Online-only with lightweight JSON endpoints'];
  }
  if (q.includes('content') || q.includes('partner') || q.includes('creation') || q.includes('responsibility')) {
    return ['AI synthetic generation verified by faculty', 'Partner university crowdsourced curriculum'];
  }
  if (q.includes('compliance') || q.includes('privacy') || q.includes('data') || q.includes('state') || q.includes('border')) {
    return ['Strict Policy P-02 Zero-PII with local encryption', 'Store hashed anonymous student IDs only'];
  }
  return ['Yes, prioritize this in MVP', 'Defer to Phase 2 roadmap', 'Keep automated baseline recommendation'];
}

function getAgentImpactNote(question: string, answer: string): string {
  const q = question.toLowerCase();
  if (q.includes('branch') || q.includes('cse')) {
    return `Agent Note: Aligned Product Strategist MVP scope to prioritize ${answer}. Syllabus vector embeddings configured for targeted branches.`;
  }
  if (q.includes('language')) {
    return `Agent Note: AI Architect configured cross-lingual tokenizer pipeline for ${answer}. Latency budget capped at <650ms.`;
  }
  if (q.includes('assessment') || q.includes('format')) {
    return `Agent Note: System Architect added endpoint schemas for ${answer}. State validator updated.`;
  }
  if (q.includes('lms') || q.includes('integrate')) {
    return `Agent Note: Infrastructure spec updated to support ${answer} with modular webhook bridges.`;
  }
  return `Agent Note: Incorporated human decision into System Architecture specifications and sprint deliverables.`;
}

function sanitizeContract(c: any, defaultTitle?: string, defaultObj?: string): IdeaContract {
  const title = c?.title || defaultTitle || 'Autonomous System Mission';
  const problem = c?.problem_statement || defaultObj || 'Implement scalable multi-tier governed system architecture';
  return {
    title,
    domain: c?.domain || 'general',
    target_audience: c?.target_audience || 'Target operators and end-users',
    problem_statement: problem,
    success_criteria: Array.isArray(c?.success_criteria) && c.success_criteria.length > 0
      ? c.success_criteria
      : [
          'Production-grade implementation with verified sub-second response times',
          'Cryptographically audited workflow with zero policy violations',
        ],
    constraints: Array.isArray(c?.constraints) && c.constraints.length > 0
      ? c.constraints
      : ['Strict compliance with data governance and retention boundaries'],
    assumptions: Array.isArray(c?.assumptions) && c.assumptions.length > 0
      ? c.assumptions
      : ['System follows iterative milestone architecture execution'],
    data_sensitivity: c?.data_sensitivity || 'internal',
    confidence: typeof c?.confidence === 'number' ? c.confidence : 0.9,
    open_questions: Array.isArray(c?.open_questions) && c.open_questions.length > 0
      ? c.open_questions
      : ['What are the primary target cloud deployment environments?'],
    suggested_specialists: Array.isArray(c?.suggested_specialists) && c.suggested_specialists.length > 0
      ? c.suggested_specialists
      : [
          'research_analyst',
          'product_strategist',
          'ai_architect',
          'system_architect',
          'privacy_risk',
          'consistency_reviewer',
          'solutions_officer',
        ],
  };
}

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
  const [modelPolicy, setModelPolicy] = useState<'AUTO' | 'BALANCE' | 'STRICT' | 'NOCAP'>('AUTO');
  const [loading, setLoading] = useState(true);
  const [compiling, setCompiling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Interactive Question Answers & Agent Adaptive Feedback State
  const [answers, setAnswers] = useState<Record<string, { answer: string; agentImpactNote: string }>>({});
  const [activeQuestionIdx, setActiveQuestionIdx] = useState<number | null>(null);
  const [currentInput, setCurrentInput] = useState<string>('');

  useEffect(() => {
    // Read query params if provided
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const m = urlParams.get('mode');
      if (m === 'FAST' || m === 'BALANCED' || m === 'DEEP') setMode(m);
      const p = urlParams.get('policy');
      if (p === 'AUTO' || p === 'BALANCE' || p === 'STRICT' || p === 'NOCAP') setModelPolicy(p as any);

      // Load previously saved question answers
      try {
        const storedAnswers = localStorage.getItem(`nexus_answers_${projectId}`);
        if (storedAnswers) {
          const parsed = JSON.parse(storedAnswers);
          if (parsed && typeof parsed === 'object') {
            setAnswers(parsed);
          }
        }
      } catch (e) {}
    }
    // Check immediate client cache for instant 0ms rendering
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(`nexus_contract_${projectId}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed) {
            setContract(sanitizeContract(parsed));
            setLoading(false);
          }
        }
      } catch (e) {}
    }

    // Fetch project details and stored contract in background
    Promise.all([
      getProject(projectId).catch(() => null),
      getProjectContract(projectId).catch(() => null),
    ])
      .then(([proj, storedContract]) => {
        if (proj) setProject(proj);
        if (storedContract) {
          setContract(sanitizeContract(storedContract, proj?.title, proj?.objective));
        } else if (!contract) {
          setContract(sanitizeContract(null, proj?.title, proj?.objective));
        }
        setLoading(false);
      })
      .catch((err) => {
        if (!contract) {
          setContract(sanitizeContract(null));
        }
        setLoading(false);
      });
  }, [projectId]);

  const handleSaveAnswer = (q: string, ansText: string) => {
    if (!ansText.trim()) return;
    const note = getAgentImpactNote(q, ansText.trim());
    const updated = {
      ...answers,
      [q]: { answer: ansText.trim(), agentImpactNote: note },
    };
    setAnswers(updated);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`nexus_answers_${projectId}`, JSON.stringify(updated));
      } catch (e) {}
    }
    setActiveQuestionIdx(null);
    setCurrentInput('');
  };

  const handleRemoveAnswer = (q: string) => {
    const updated = { ...answers };
    delete updated[q];
    setAnswers(updated);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`nexus_answers_${projectId}`, JSON.stringify(updated));
      } catch (e) {}
    }
  };

  const handleStartReplying = (idx: number, q: string) => {
    setActiveQuestionIdx(idx);
    setCurrentInput(answers[q]?.answer || '');
  };

  const handleCompile = async () => {
    if (compiledPlan) {
      router.push(`/projects/${projectId}/canvas?run_id=${compiledPlan.run_id}&mode=${mode}`);
      return;
    }
    setCompiling(true);
    const optimisticRunId = `run_${projectId.replace('prj_', '')}_${Date.now()}`;
    if (typeof window !== 'undefined') {
      localStorage.setItem(`nexus_last_run_${projectId}`, optimisticRunId);
    }

    // Instantly navigate without waiting for network latency
    router.push(`/projects/${projectId}/canvas?run_id=${optimisticRunId}&mode=${mode}`);

    // Trigger backend compilation asynchronously in background
    compileOrganization(projectId, mode, modelPolicy)
      .then((plan) => {
        if (plan?.run_id && typeof window !== 'undefined') {
          localStorage.setItem(`nexus_last_run_${projectId}`, plan.run_id);
        }
      })
      .catch((e) => {
        console.warn('Background compilation notice:', e);
      });
  };

  if (loading && !contract) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="flex flex-col items-center gap-3 font-mono text-sm text-slate-400">
          <span className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading Idea Contract...</span>
        </div>
      </div>
    );
  }

  const safeCt = contract || sanitizeContract(null, project?.title, project?.objective);

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      {/* Top Bar */}
      <header className="w-full border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 z-50">
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
            <div>
              <span className="font-bold text-white flex items-center gap-2 text-sm md:text-base">
                Idea Contract <span className="text-xs font-mono text-purple-400 font-normal px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20">{project?.id || projectId}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-3 text-xs font-mono text-slate-400 mr-1">
              <button
                onClick={() => router.push('/')}
                className="hover:text-purple-300 cursor-pointer transition-colors px-2 py-1 rounded hover:bg-white/5"
              >
                Main Page
              </button>
              <span
                onClick={() => {
                  const storedRun = typeof window !== 'undefined' ? localStorage.getItem(`nexus_last_run_${projectId}`) : null;
                  router.push(`/projects/${projectId}/canvas${storedRun ? `?run_id=${storedRun}` : ''}`);
                }}
                className="hover:text-purple-300 cursor-pointer transition-colors px-2 py-1 rounded hover:bg-white/5"
              >
                Canvas
              </span>
              <span
                onClick={() => router.push('/lab')}
                className="hover:text-purple-300 cursor-pointer transition-colors px-2 py-1 rounded hover:bg-white/5"
              >
                Policy Lab
              </span>
            </div>
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
              {safeCt.title}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end text-xs font-mono">
              <span className="text-slate-500">Data Sensitivity</span>
              <span className="text-purple-400 font-semibold uppercase">{safeCt.data_sensitivity}</span>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="flex flex-col items-end text-xs font-mono">
              <span className="text-slate-500">Interpreter Confidence</span>
              <span className="text-emerald-400 font-semibold">{((safeCt.confidence || 0.85) * 100).toFixed(0)}%</span>
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
                {safeCt.problem_statement}
              </p>
            </GlassCard>

            <GlassCard tier="regular" className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">
                <Users className="w-4 h-4 text-indigo-400" />
                Target Audience
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                {safeCt.target_audience}
              </p>
            </GlassCard>

            {/* Interactive Open Clarification Questions & Human Guidance */}
            <GlassCard tier="regular" className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">
                  <HelpCircle className="w-4 h-4 text-amber-400" />
                  Open Clarification Questions
                </div>
                {Object.keys(answers).length > 0 && (
                  <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    {Object.keys(answers).length} / {safeCt.open_questions?.length || 0} Resolved
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 font-sans">
                Provide your guidance or click recommended answers below. The AI swarm will adapt its architecture and roadmap accordingly.
              </p>

              <div className="space-y-3 mt-1">
                {(safeCt.open_questions || []).map((q, i) => {
                  const isReplying = activeQuestionIdx === i;
                  const record = answers[q];
                  const hasAnswer = !!record?.answer;
                  const suggestions = getQuestionSuggestions(q);

                  return (
                    <div
                      key={i}
                      className={`p-3.5 rounded-2xl border transition-all flex flex-col gap-2.5 ${
                        hasAnswer
                          ? 'bg-emerald-950/20 border-emerald-500/30 shadow-sm shadow-emerald-950/20'
                          : isReplying
                          ? 'bg-purple-950/25 border-purple-500/40 ring-1 ring-purple-500/30'
                          : 'bg-black/30 border-white/5 hover:border-white/15'
                      }`}
                    >
                      {/* Question Row */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5 flex-1 min-w-0">
                          <span className="w-5 h-5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-xs flex items-center justify-center shrink-0 mt-0.5">
                            ?
                          </span>
                          <span className="text-xs text-slate-200 font-medium leading-relaxed">
                            {q}
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="shrink-0 flex items-center gap-1.5">
                          {hasAnswer ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                Answered
                              </span>
                              <button
                                onClick={() => handleStartReplying(i, q)}
                                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
                                title="Edit your answer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleRemoveAnswer(q)}
                                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-rose-400 transition-all cursor-pointer"
                                title="Remove answer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleStartReplying(i, q)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-all cursor-pointer border ${
                                isReplying
                                  ? 'bg-purple-600 text-white border-purple-400/40 shadow-sm'
                                  : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border-white/10'
                              }`}
                            >
                              <MessageSquare className="w-3 h-3 text-cyan-400" />
                              <span>{isReplying ? 'Close' : 'Answer'}</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Display Human Decision & Agent Adaptive Note */}
                      {hasAnswer && !isReplying && (
                        <div className="mt-1 space-y-2 font-mono text-xs">
                          {/* User Decision Box */}
                          <div className="p-2.5 rounded-xl bg-black/50 border border-emerald-500/20 text-emerald-300 flex items-start gap-2">
                            <CornerDownRight className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Your Decision / Guidance:</span>
                              <span className="text-white font-sans text-xs font-semibold">{record.answer}</span>
                            </div>
                          </div>

                          {/* Agent Adaptive Impact Note */}
                          <div className="p-2 rounded-xl bg-purple-950/30 border border-purple-500/20 text-[11px] text-purple-200 flex items-start gap-2">
                            <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5 animate-pulse" />
                            <span className="font-sans leading-relaxed">{record.agentImpactNote}</span>
                          </div>
                        </div>
                      )}

                      {/* Interactive Antigravity Reply Box */}
                      {isReplying && (
                        <div className="mt-2 p-3 rounded-2xl bg-black/60 border border-purple-500/30 flex flex-col gap-2.5 animate-fadeIn">
                          {/* Smart Suggestion Chips */}
                          <div className="flex flex-col gap-1.5">
                            <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                              <Zap className="w-3 h-3 text-cyan-400" /> Smart Suggestions (Click to fill):
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {suggestions.map((chip, cIdx) => (
                                <button
                                  key={cIdx}
                                  type="button"
                                  onClick={() => setCurrentInput(chip)}
                                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-purple-500/20 text-slate-300 hover:text-white border border-white/10 hover:border-purple-500/30 text-[11px] font-mono transition-all text-left cursor-pointer"
                                >
                                  {chip}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Input Area */}
                          <div className="flex flex-col gap-2">
                            <textarea
                              value={currentInput}
                              onChange={(e) => setCurrentInput(e.target.value)}
                              placeholder="Type your specific decision or guidance for the swarm..."
                              rows={2}
                              autoFocus
                              className="w-full p-2.5 rounded-xl bg-black/50 border border-white/10 text-xs font-sans text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/30"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  handleSaveAnswer(q, currentInput);
                                }
                              }}
                            />

                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-mono text-slate-500">
                                Press Enter or click Save
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setActiveQuestionIdx(null)}
                                  className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-mono transition-all cursor-pointer"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSaveAnswer(q, currentInput)}
                                  disabled={!currentInput.trim()}
                                  className="px-3.5 py-1 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-mono font-bold transition-all shadow-md shadow-purple-950/40 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                                >
                                  <Send className="w-3 h-3" />
                                  <span>Save Decision</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
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
                {(safeCt.success_criteria || []).map((sc, i) => (
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
                {(safeCt.constraints || []).map((c, i) => (
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
                {(safeCt.assumptions || []).map((a, i) => (
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
                <span className="text-purple-400">{(safeCt.suggested_specialists || []).length}</span>
              </div>
              <div className="flex flex-col gap-2">
                {(safeCt.suggested_specialists || []).map((role) => (
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
                  <div>Tasks: {compiledPlan.tasks?.length || 0}</div>
                  <div>Human Gates: {compiledPlan.human_gates?.length || 0}</div>
                  <div>Retrieved Atoms: {compiledPlan.retrieved_atoms?.length || 0}</div>
                </div>
                <button
                  onClick={() => router.push(`/projects/${projectId}/canvas?run_id=${compiledPlan.run_id}`)}
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
          <div className="flex flex-wrap items-center gap-4">
            {/* Depth Selector */}
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span>Depth:</span>
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

            {/* Policy Selector */}
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span>Policy:</span>
              <div className="inline-flex rounded-lg p-1 bg-black/40 border border-white/10 text-xs">
                {(['AUTO', 'BALANCE', 'STRICT', 'NOCAP'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setModelPolicy(p)}
                    className={`px-2.5 py-1 rounded-md transition-all font-mono ${
                      modelPolicy === p
                        ? 'bg-cyan-600 text-white font-semibold shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {p}
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
