'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { TokenMeter } from '@/components/ui/TokenMeter';
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
  Sliders,
  KeyRound,
  FileCode2,
  Activity,
  ChevronRight,
  Copy,
  Check,
  MessageSquare,
  Send,
  RefreshCw,
  Clock,
  Coins,
  Paperclip,
  Image as ImageIcon,
  FileText,
  X,
  UploadCloud,
  ExternalLink,
  Lock,
  Code2,
  Eye,
  Briefcase,
} from 'lucide-react';
import {
  fetchHealth,
  createProject,
  submitIntake,
  submitDirectQuery,
  type HealthStatus,
  type DirectQueryResponse,
  type AttachedFile,
} from '@/lib/api';

const SAMPLE_MISSIONS = [
  {
    id: 'edtech',
    title: 'EdTech Adaptive Exam Engine',
    domain: 'edtech',
    idea: 'Design a multilingual AI exam-prep platform for B.Tech students in India',
    tags: ['Multilingual NLP', 'Student Privacy', 'Exam Prep'],
    stats: { time: '4 Weeks', budget: '$0.045', score: '98.4%' },
  },
  {
    id: 'marketplace',
    title: 'Food Surplus Redistribution',
    domain: 'marketplace',
    idea: 'Build a surplus-food redistribution marketplace connecting restaurants with food banks',
    tags: ['Logistics', 'Perishability Risk', 'Matching Engine'],
    stats: { time: '3 Weeks', budget: '$0.038', score: '97.8%' },
  },
  {
    id: 'campus',
    title: 'Administrative Grievance Triage',
    domain: 'campus-admin',
    idea: 'AI-assisted student grievance triage system with synthetic policy documents',
    tags: ['Policy Enforcement', 'Escalation Gate', 'Audit Chain'],
    stats: { time: '2 Weeks', budget: '$0.029', score: '99.1%' },
  },
  {
    id: 'fintech',
    title: 'FinTech Double-Entry Ledger',
    domain: 'fintech',
    idea: 'Real-time double-entry transaction ledger with sub-10ms anomaly detection and PCI-DSS tokenization',
    tags: ['Ledger Audit', 'PCI-DSS', 'Fraud Scoring'],
    stats: { time: '5 Weeks', budget: '$0.052', score: '99.5%' },
  },
  {
    id: 'healthcare',
    title: 'HealthCare Clinical EHR Copilot',
    domain: 'healthcare',
    idea: 'HIPAA-compliant medical diagnostics copilot with FHIR R4 clinical knowledge retrieval and PII redaction',
    tags: ['FHIR R4', 'HIPAA Redaction', 'Diagnostic RAG'],
    stats: { time: '6 Weeks', budget: '$0.064', score: '99.8%' },
  },
];

const PROMPT_SUGGESTIONS = [
  '+ <50ms SLA',
  '+ pgvector RAG',
  '+ Policy P-02 Zero-PII',
  '+ Docker Setup',
  '+ Multilingual NLP',
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
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [directAnswer, setDirectAnswer] = useState<DirectQueryResponse | null>(null);
  const [isDirectQuerying, setIsDirectQuerying] = useState(false);
  const [copiedDirect, setCopiedDirect] = useState(false);

  // Multimodal File & Image Upload State
  const [attachments, setAttachments] = useState<AttachedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Continuous Looping Typewriter Animation for Main Headline
  const FULL_HEADLINE = "Turn any idea into a verified tech blueprint.";
  const [typedHeadline, setTypedHeadline] = useState("");

  useEffect(() => {
    let index = 0;
    let timeoutId: NodeJS.Timeout;

    const tick = () => {
      index++;
      if (index <= FULL_HEADLINE.length) {
        setTypedHeadline(FULL_HEADLINE.slice(0, index));
        timeoutId = setTimeout(tick, 45);
      } else {
        // Complete: hold for 3.5 seconds, then restart
        timeoutId = setTimeout(() => {
          setTypedHeadline("");
          index = 0;
          timeoutId = setTimeout(tick, 400);
        }, 3500);
      }
    };

    timeoutId = setTimeout(tick, 500);
    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    fetchHealth()
      .then((data) => setHealth(data))
      .catch((err) => console.warn('Health check failed:', err));
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const isImage = file.type.startsWith('image/');
      const isCodeOrSchema = file.name.match(/\.(sql|json|yaml|yml|py|ts|tsx|js|txt|md)$/i);

      if (isImage) {
        const reader = new FileReader();
        reader.onload = () => {
          setAttachments((prev) => [
            ...prev,
            {
              name: file.name,
              type: 'image',
              content: `[Image / UI / Architecture Diagram: ${file.name}]`,
              size: file.size,
              dataUrl: reader.result as string,
            },
          ]);
        };
        reader.readAsDataURL(file);
      } else {
        const reader = new FileReader();
        reader.onload = () => {
          setAttachments((prev) => [
            ...prev,
            {
              name: file.name,
              type: isCodeOrSchema ? 'schema' : 'document',
              content: (reader.result as string) || '',
              size: file.size,
            },
          ]);
        };
        reader.readAsText(file);
      }
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAppendSuggestion = (suggestion: string) => {
    const cleanText = suggestion.replace(/^\+\s*/, '');
    if (!idea.includes(cleanText)) {
      setIdea((prev) => prev.trim() + ` with ${cleanText.toLowerCase()}`);
    }
  };

  const handleDirectQuery = async () => {
    if (!idea.trim()) return;
    setIsDirectQuerying(true);
    setErrorMessage(null);
    setStatusMessage('Querying single-agent LLM engine directly...');
    try {
      const res = await submitDirectQuery(idea, modelPolicy);
      setDirectAnswer(res);
      setStatusMessage(null);
    } catch (err: any) {
      setErrorMessage(err.message || 'Direct query failed');
      setStatusMessage(null);
    } finally {
      setIsDirectQuerying(false);
    }
  };

  const handleSelectSample = (sample: (typeof SAMPLE_MISSIONS)[0]) => {
    setIdea(sample.idea);
    setSelectedDomain(sample.domain);
    setStatusMessage(`Loaded preset: ${sample.title}`);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleStartMission = async () => {
    if (!idea.trim()) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    setStatusMessage('Creating project and interpreting mission intake with multimodal analysis...');

    try {
      // 1. Create Project
      const project = await createProject(
        `${selectedDomain.toUpperCase()} — Mission`,
        idea
      );

      // 2. Submit Intake with multimodal attachments
      await submitIntake(project.id, idea, selectedDomain, attachments);

      setStatusMessage('Idea Contract ready. Redirecting to Contract review...');
      setTimeout(() => {
        router.push(`/projects/${project.id}/contract?mode=${mode}&policy=${modelPolicy}`);
      }, 500);
    } catch (err: any) {
      console.error('Mission start error:', err);
      setErrorMessage(err.message || 'Failed to initialize mission. Falling back to demo mode.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen relative overflow-x-clip bg-[#050810]">
      {/* Ambient Radial Aurora Background Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-purple-900/15 blur-[120px] pointer-events-none" />
      <div className="absolute top-[10%] right-[-10%] w-[650px] h-[650px] rounded-full bg-cyan-900/15 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[30%] w-[700px] h-[700px] rounded-full bg-indigo-900/10 blur-[150px] pointer-events-none" />

      {/* Top Floating Pill Navigation Bar (Fixed on Scroll with Glassmorphism) */}
      <div className="fixed top-4 left-0 right-0 z-50 px-4 sm:px-6 flex justify-center pointer-events-none">
        <header className="floating-nav-pill px-5 py-2.5 flex items-center justify-between gap-6 max-w-3xl w-full pointer-events-auto shadow-2xl shadow-black/80 border border-white/15 backdrop-blur-2xl">
          {/* Logo Badge */}
          <div
            onClick={() => router.push('/')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white font-extrabold tracking-wider text-xs flex items-center gap-1.5 shadow-sm group-hover:bg-white/20 transition-all">
              <Cpu className="w-3.5 h-3.5 text-purple-400" />
              <span>NEXUS</span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="flex items-center gap-5 text-xs font-medium text-slate-300">
            <button
              onClick={() => router.push('/lab')}
              className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 text-purple-300 hover:text-purple-200"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              <span>Policy Lab</span>
            </button>
            <button
              onClick={() => setShowSettingsModal(true)}
              className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 text-slate-400 hover:text-slate-200"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Settings</span>
            </button>
          </nav>

          {/* System Status Pill */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-mono text-emerald-300">
              <span className="nexus-live-dot" />
              <span>LIVE</span>
            </div>
          </div>
        </header>
      </div>

      {/* Main Content Area with pt-24 for Floating Navbar */}
      <main className="flex-1 max-w-5xl mx-auto px-6 pt-24 pb-16 flex flex-col items-center w-full z-10">
        {/* Version Badge Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/30 backdrop-blur-md mb-6 shadow-sm shadow-cyan-950/40">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-mono tracking-wide text-cyan-200">
            Autonomous AI Team &amp; Architecture Compiler
          </span>
        </div>

        {/* Hero Title with Typewriter Animation */}
        <div className="text-center max-w-4xl mb-4">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.25] mb-3 min-h-[90px] sm:min-h-[140px] flex flex-col items-center justify-center">
            <div>
              <span>{typedHeadline.length <= 21 ? typedHeadline : "Turn any idea into a"}</span>
              {typedHeadline.length <= 21 && (
                <span className="inline-block w-[3px] h-7 sm:h-12 bg-cyan-400 ml-1.5 animate-pulse align-middle" />
              )}
            </div>
            {typedHeadline.length > 21 && (
              <div className="bg-gradient-to-r from-purple-400 via-purple-300 to-indigo-300 bg-clip-text text-transparent text-glow-purple">
                <span>{typedHeadline.slice(21)}</span>
                <span className="inline-block w-[3px] h-7 sm:h-12 bg-purple-400 ml-1.5 animate-pulse align-middle" />
              </div>
            )}
          </h1>
          <h2 className="text-base sm:text-2xl md:text-3xl font-bold tracking-tight text-slate-300 leading-tight whitespace-normal sm:whitespace-nowrap">
            Powered by an autonomous team of{' '}
            <span className="bg-gradient-to-r from-sky-400 to-cyan-300 bg-clip-text text-transparent text-glow-cyan">
              specialized AI agents.
            </span>
          </h2>
        </div>

        {/* Hero Subtitle in Exactly Two Lines */}
        <div className="text-slate-300 text-sm sm:text-base md:text-lg text-center max-w-5xl mx-auto mb-6 leading-normal font-normal flex flex-col gap-1.5">
          <p className="whitespace-normal md:whitespace-nowrap">
            Describe what you want to build. NEXUS automatically forms specialized AI agents —
          </p>
          <p className="text-slate-400 whitespace-normal md:whitespace-nowrap">
            researchers, system architects, and reviewers — to design, audit, and generate ready-to-deploy code with cryptographic proof.
          </p>
        </div>

        {/* Enterprise Proof & Performance Metric Ribbon */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mb-8 text-xs font-mono">
          <div className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 flex items-center gap-1.5 shadow-sm">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>1.8s Synthesis</span>
          </div>
          <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 flex items-center gap-1.5 shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% Policy-Enforced</span>
          </div>
          <div className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/25 text-purple-300 flex items-center gap-1.5 shadow-sm">
            <Lock className="w-3.5 h-3.5 text-purple-400" />
            <span>SHA-256 Merkle Chained</span>
          </div>
          <div className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 flex items-center gap-1.5 shadow-sm">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>$0.045 AI Cost</span>
          </div>
          <div className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 flex items-center gap-1.5 shadow-sm">
            <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
            <span>Multimodal Vision &amp; Schemas</span>
          </div>
        </div>

        {/* Liquid Glass Mission Input Card */}
        <div className="liquid-glass-card w-full max-w-3xl p-6 md:p-8 flex flex-col gap-5 mb-10 shadow-2xl relative">
          {/* Preset Example Chips */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Choose a Domain Preset or type custom:
            </span>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_MISSIONS.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => handleSelectSample(sample)}
                  className={`text-xs px-3.5 py-1.5 rounded-full border transition-all duration-200 cursor-pointer font-medium ${
                    idea === sample.idea
                      ? 'bg-purple-600/30 text-purple-200 border-purple-500/50 shadow-sm shadow-purple-900/40'
                      : 'glass-thin text-slate-300 hover:bg-white/10 hover:text-white border-white/10'
                  }`}
                >
                  {sample.title}
                </button>
              ))}
            </div>
          </div>

          {/* Liquid Glass Search & Textarea Container with Corner Pin (Like modern AI chat boxes) */}
          <div className="liquid-glass-input p-4 flex flex-col gap-3 relative focus-within:ring-2 focus-within:ring-purple-500/30 transition-all">
            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              multiple
              accept=".png,.jpg,.jpeg,.webp,.pdf,.sql,.json,.yaml,.yml,.txt,.md,.py,.ts"
              className="hidden"
            />

            {/* Attached file chips inside the search container */}
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 pb-2 border-b border-white/5">
                {attachments.map((file, idx) => (
                  <div
                    key={idx}
                    className="p-1.5 px-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2 text-xs font-mono text-slate-300"
                  >
                    {file.type === 'image' && file.dataUrl ? (
                      <img
                        src={file.dataUrl}
                        alt={file.name}
                        className="w-5 h-5 rounded object-cover border border-white/10"
                      />
                    ) : (
                      <Paperclip className="w-3.5 h-3.5 text-purple-400" />
                    )}
                    <span className="truncate max-w-[120px] text-xs font-medium text-white">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(idx)}
                      className="text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Remove attachment"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Textarea Input */}
            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="Describe what you want to build or attach architecture diagrams, database schemas, and specifications..."
              rows={4}
              className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-sm md:text-base focus:outline-none resize-none font-sans"
            />

            {/* Bottom Row Inside Search Container: Pin at Corner + Character/Readiness Info */}
            <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs font-mono">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 px-2 rounded-lg bg-white/5 hover:bg-purple-500/20 text-slate-400 hover:text-purple-300 border border-white/10 hover:border-purple-500/30 transition-all flex items-center gap-1.5 cursor-pointer group"
                  title="Attach architecture diagrams, SQL schemas, or PRDs"
                >
                  <Paperclip className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[11px] text-slate-400 group-hover:text-purple-200 hidden sm:inline">Attach</span>
                </button>
                {attachments.length > 0 && (
                  <span className="text-[11px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                    {attachments.length} attached
                  </span>
                )}
              </div>

              <div className="text-[10px] text-slate-500">
                {idea.length} chars · {idea.length > 50 ? 'Ready for Blueprint' : 'Brief'}
              </div>
            </div>
          </div>

          {/* Prompt Enhancer Suggestion Pills - Single Row Compact */}
          <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
            <span className="text-slate-500 shrink-0">Enhance:</span>
            {PROMPT_SUGGESTIONS.map((sug, idx) => (
              <button
                key={idx}
                onClick={() => handleAppendSuggestion(sug)}
                className="px-2 py-0.5 rounded-full bg-white/5 hover:bg-purple-500/20 text-slate-300 hover:text-purple-300 border border-white/10 hover:border-purple-500/30 transition-all cursor-pointer whitespace-nowrap"
              >
                {sug}
              </button>
            ))}
          </div>

          {/* Controls Bar: Execution Depth + Policy + CTAs */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-white/5">
            {/* Mode & Policy Group */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Mode Selector */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono text-slate-400">Depth:</span>
                <div className="inline-flex rounded-lg p-1 bg-black/50 border border-white/10 text-xs font-mono">
                  {(['FAST', 'BALANCED', 'DEEP'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
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

              {/* Policy Selector */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono text-slate-400">Policy:</span>
                <div className="inline-flex rounded-lg p-1 bg-black/50 border border-white/10 text-xs font-mono">
                  {(['AUTO', 'BALANCE', 'STRICT', 'NOCAP'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setModelPolicy(p)}
                      className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
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
            </div>

            {/* Action Buttons: Quick Answer vs Start Full Organization Mission */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleDirectQuery}
                disabled={isDirectQuerying || isSubmitting || !idea.trim()}
                className="px-4 py-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 hover:text-cyan-200 border border-cyan-500/30 font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-all shadow-sm"
                title="Ask a single question or get an instant direct response without spinning up full organization"
              >
                {isDirectQuerying ? (
                  <>
                    <span className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                    <span>Thinking...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-cyan-400" />
                    <span>Quick Answer</span>
                  </>
                )}
              </button>

              <button
                onClick={handleStartMission}
                disabled={isSubmitting || isDirectQuerying || !idea.trim()}
                className="nexus-btn-primary px-6 py-3 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Compiling Organization...</span>
                  </>
                ) : (
                  <>
                    <span>Start Mission</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Instant Direct Query Answer Console */}
          {directAnswer && (
            <div className="glass-thick rounded-2xl p-6 border border-cyan-500/30 bg-black/60 shadow-2xl flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      Single-Agent Instant Response
                      <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                        {directAnswer.model_used}
                      </span>
                    </h3>
                  </div>
                </div>

                {/* Telemetry metadata */}
                <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    {directAnswer.latency_ms}ms
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-purple-400" />
                    {directAnswer.tokens_used} tok
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Coins className="w-3 h-3 text-amber-400" />
                    ${directAnswer.cost_usd.toFixed(4)}
                  </span>
                </div>
              </div>

              {/* Response Text / Code Block */}
              <div className="text-xs font-mono text-slate-200 leading-relaxed max-h-[350px] overflow-y-auto whitespace-pre-wrap p-3 rounded-xl bg-black/40 border border-white/5">
                {directAnswer.answer}
              </div>

              {/* Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(directAnswer.answer);
                    setCopiedDirect(true);
                    setTimeout(() => setCopiedDirect(false), 2000);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-slate-300 hover:text-white border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedDirect ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied Answer</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Answer</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDirectAnswer(null)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
                  >
                    Dismiss
                  </button>
                  <button
                    onClick={handleStartMission}
                    disabled={isSubmitting}
                    className="nexus-btn-primary px-4 py-1.5 text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Promote to Full Organization Project</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Feedback Messages */}
          {statusMessage && (
            <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30 text-xs font-mono text-purple-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs font-mono text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* 1-Click Flagship Expo Blueprints Gallery */}
        <div className="w-full max-w-4xl mb-12 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-mono uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Flagship Expo Blueprints (1-Click Explore)
            </h3>
            <span className="text-xs font-mono text-slate-500">Verified Benchmarks</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SAMPLE_MISSIONS.slice(0, 3).map((sample) => (
              <div
                key={sample.id}
                className="liquid-glass-card p-5 rounded-2xl flex flex-col justify-between gap-4 border border-white/10 hover:border-purple-500/40 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                      {sample.domain}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                      {sample.stats.score}
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-sm group-hover:text-purple-300 transition-colors">
                    {sample.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {sample.idea}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                    <span>{sample.stats.time}</span>
                    <span>·</span>
                    <span className="text-amber-400">{sample.stats.budget}</span>
                  </div>

                  <button
                    onClick={() => {
                      if (sample.id === 'edtech') {
                        router.push('/projects/prj_demo/blueprint');
                      } else {
                        handleSelectSample(sample);
                      }
                    }}
                    className="text-xs font-mono text-purple-300 hover:text-white flex items-center gap-1 cursor-pointer font-semibold"
                  >
                    <span>{sample.id === 'edtech' ? 'View Blueprint' : 'Load Mission'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3-Step Interactive "How NEXUS Works" Visual Workflow */}
        <div className="w-full max-w-4xl mb-12 p-6 rounded-3xl bg-black/40 border border-white/10 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-mono uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              How the Autonomous Organization Operates
            </h3>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              Phase-Gated Governance
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Step 1 */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col gap-2">
              <div className="w-7 h-7 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 font-mono font-bold flex items-center justify-center text-xs">
                1
              </div>
              <h4 className="text-sm font-bold text-white">Multimodal Mission Intake</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Mission Interpreter translates raw text, diagrams, and SQL schemas into a formal Idea Contract with clear SLAs and data policies.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col gap-2">
              <div className="w-7 h-7 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono font-bold flex items-center justify-center text-xs">
                2
              </div>
              <h4 className="text-sm font-bold text-white">Governed 7-Agent DAG</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Specialized AI agents (Architect, Tech Lead, DevOps, Security Auditor) execute tasks with strict tool permissions and human approval gates.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col gap-2">
              <div className="w-7 h-7 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono font-bold flex items-center justify-center text-xs">
                3
              </div>
              <h4 className="text-sm font-bold text-white">VERITAS Cryptographic Proof</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every decision, API schema, and Docker config is SHA-256 chained into a tamper-evident Master Blueprint and downloadable repo.
              </p>
            </div>
          </div>
        </div>

        {/* 3 Core Architecture Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
          {/* Pillar 1: Dynamic Organization Compiler */}
          <div className="glass-regular rounded-2xl p-6 flex flex-col gap-4 hover:-translate-y-1 transition-all duration-300 group">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 w-fit border border-purple-500/20 group-hover:scale-110 transition-transform">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">Dynamic Org Compiler</h3>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                No fixed chat rooms. Dynamically generates governed teams with strict tool permissions, token budgets, and phase gates.
              </p>
            </div>
            <div className="mt-auto pt-4 flex items-center justify-between border-t border-white/5 text-xs text-slate-400 font-mono">
              <span>Governance</span>
              <StatusBadge status="ACTIVE" />
            </div>
          </div>

          {/* Pillar 2: VERITAS Cryptographic Chain */}
          <div className="glass-regular rounded-2xl p-6 flex flex-col gap-4 hover:-translate-y-1 transition-all duration-300 group">
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 w-fit border border-cyan-500/20 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">VERITAS Cryptographic Chain</h3>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                Every agent prompt, tool call, artifact version, and review decision is SHA-256 chained in a tamper-evident audit ledger.
              </p>
            </div>
            <div className="mt-auto pt-4 flex items-center justify-between border-t border-white/5 text-xs text-slate-400 font-mono">
              <span>Proof</span>
              <span className="text-cyan-400">Tamper-Evident</span>
            </div>
          </div>

          {/* Pillar 3: MNEMOS Reusable Memory */}
          <div className="glass-regular rounded-2xl p-6 flex flex-col gap-4 hover:-translate-y-1 transition-all duration-300 group">
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 w-fit border border-indigo-500/20 group-hover:scale-110 transition-transform">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">MNEMOS Memory</h3>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                Extracts reusable organizational lessons from completed runs, retrieving process atoms via hybrid tag-filtering and semantic reranking.
              </p>
            </div>
            <div className="mt-auto pt-4 flex items-center justify-between border-t border-white/5 text-xs text-slate-400 font-mono">
              <span>Learning</span>
              <span className="text-indigo-400">Process Atoms</span>
            </div>
          </div>
        </div>
      </main>

      {/* Settings Modal (LLM Gateway Status & Providers) */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className="liquid-glass-card max-w-lg w-full p-6 space-y-6 border border-purple-500/30">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-bold text-white">NEXUS Multi-Model Gateway</h3>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-slate-400 hover:text-white text-xs font-mono px-2 py-1 rounded bg-white/10 cursor-pointer"
              >
                ESC
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-bold">Google Gemini</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Active (gemini-3.6-flash)
                  </span>
                </div>
                <p className="text-slate-500">Primary reasoning engine for DAG synthesis &amp; contract compilation.</p>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-bold">Groq Cloud</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Active (qwen/qwen3.6-27b)
                  </span>
                </div>
                <p className="text-slate-500">Ultra-fast sub-200ms fallback inference pool.</p>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-bold">OpenRouter Gateway</span>
                  <span className="text-cyan-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    Configured (qwen-2.5-72b)
                  </span>
                </div>
                <p className="text-slate-500">Universal routing pool for multi-agent diversity.</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold cursor-pointer"
              >
                Close Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full border-t border-white/5 py-6 text-center text-xs font-mono text-slate-500 z-10">
        NEXUS Organization OS · Dynamic Governance · Cryptographic Integrity · Reusable Memory
      </footer>
    </div>
  );
}
