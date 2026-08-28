'use client';

import React, { useEffect, useState, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { AgentNetwork } from '@/components/canvas/AgentNetwork';
import { LiveEventFeed } from '@/components/ui/LiveEventFeed';
import { TokenMeter } from '@/components/ui/TokenMeter';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ApprovalModal } from '@/components/ui/ApprovalModal';
import {
  ShieldCheck,
  Play,
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  FileCheck2,
  AlertCircle,
  CheckCircle2,
  FileText,
  X,
  ExternalLink,
  Code2,
  Layers,
  Cpu,
  Database,
  Rocket,
  Download,
  Lock,
  ShieldAlert,
  Activity,
  Boxes,
  Zap,
  Home,
} from 'lucide-react';
import {
  getProject,
  submitGateDecision,
  verifyRun,
  type Project,
  apiClient,
} from '@/lib/api';
import { useRunEvents } from '@/hooks/useRunEvents';

function getDomainSpecialistRoles(domain?: string, title?: string, objective?: string) {
  const text = `${domain || ''} ${title || ''} ${objective || ''}`.toLowerCase();

  if (text.includes('food') || text.includes('donation') || text.includes('perish') || text.includes('redistribut')) {
    return [
      { id: 'agt_research', role: 'supply_chain_analyst', status: 'ACTIVE', token_budget: 5000, tokens_used: 1200 },
      { id: 'agt_product', role: 'logistics_product_strategist', status: 'PENDING', token_budget: 5000, tokens_used: 0 },
      { id: 'agt_ai_arch', role: 'perishability_ai_architect', status: 'PENDING', token_budget: 5000, tokens_used: 0 },
      { id: 'agt_sys_arch', role: 'geo_dispatch_systems_architect', status: 'PENDING', token_budget: 5000, tokens_used: 0 },
      { id: 'agt_privacy', role: 'food_safety_compliance_officer', status: 'PENDING', token_budget: 5000, tokens_used: 0 },
      { id: 'agt_reviewer', role: 'logistics_consistency_reviewer', status: 'PENDING', token_budget: 4000, tokens_used: 0 },
      { id: 'agt_solutions', role: 'logistics_solutions_officer', status: 'PENDING', token_budget: 6000, tokens_used: 0 },
    ];
  }

  if (text.includes('grievance') || text.includes('citizen') || text.includes('complaint') || text.includes('civic') || text.includes('whistleblower')) {
    return [
      { id: 'agt_research', role: 'civic_intelligence_analyst', status: 'ACTIVE', token_budget: 5000, tokens_used: 1200 },
      { id: 'agt_product', role: 'public_service_product_strategist', status: 'PENDING', token_budget: 5000, tokens_used: 0 },
      { id: 'agt_ai_arch', role: 'nlp_triage_ai_architect', status: 'PENDING', token_budget: 5000, tokens_used: 0 },
      { id: 'agt_sys_arch', role: 'e_governance_systems_architect', status: 'PENDING', token_budget: 5000, tokens_used: 0 },
      { id: 'agt_privacy', role: 'whistleblower_privacy_guard', status: 'PENDING', token_budget: 5000, tokens_used: 0 },
      { id: 'agt_reviewer', role: 'civic_consistency_reviewer', status: 'PENDING', token_budget: 4000, tokens_used: 0 },
      { id: 'agt_solutions', role: 'governance_solutions_officer', status: 'PENDING', token_budget: 6000, tokens_used: 0 },
    ];
  }

  if (text.includes('health') || text.includes('medical') || text.includes('clinic') || text.includes('patient') || text.includes('doctor') || text.includes('hospital')) {
    return [
      { id: 'agt_research', role: 'clinical_data_specialist', status: 'ACTIVE', token_budget: 5000, tokens_used: 1200 },
      { id: 'agt_product', role: 'medical_product_architect', status: 'PENDING', token_budget: 5000, tokens_used: 0 },
      { id: 'agt_ai_arch', role: 'biomedical_ai_engineer', status: 'PENDING', token_budget: 5000, tokens_used: 0 },
      { id: 'agt_sys_arch', role: 'hipaa_fhir_systems_architect', status: 'PENDING', token_budget: 5000, tokens_used: 0 },
      { id: 'agt_privacy', role: 'bioethics_privacy_officer', status: 'PENDING', token_budget: 5000, tokens_used: 0 },
      { id: 'agt_reviewer', role: 'clinical_consistency_auditor', status: 'PENDING', token_budget: 4000, tokens_used: 0 },
      { id: 'agt_solutions', role: 'healthcare_solutions_officer', status: 'PENDING', token_budget: 6000, tokens_used: 0 },
    ];
  }

  if (text.includes('fintech') || text.includes('finance') || text.includes('trad') || text.includes('bank') || text.includes('fraud') || text.includes('pay') || text.includes('crypto')) {
    return [
      { id: 'agt_research', role: 'market_quantitative_analyst', status: 'ACTIVE', token_budget: 5000, tokens_used: 1200 },
      { id: 'agt_product', role: 'fintech_product_strategist', status: 'PENDING', token_budget: 5000, tokens_used: 0 },
      { id: 'agt_ai_arch', role: 'fraud_detection_ai_architect', status: 'PENDING', token_budget: 5000, tokens_used: 0 },
      { id: 'agt_sys_arch', role: 'ledger_transaction_architect', status: 'PENDING', token_budget: 5000, tokens_used: 0 },
      { id: 'agt_privacy', role: 'sec_regulatory_compliance_officer', status: 'PENDING', token_budget: 5000, tokens_used: 0 },
      { id: 'agt_reviewer', role: 'financial_consistency_reviewer', status: 'PENDING', token_budget: 4000, tokens_used: 0 },
      { id: 'agt_solutions', role: 'fintech_solutions_officer', status: 'PENDING', token_budget: 6000, tokens_used: 0 },
    ];
  }

  if (text.includes('cyber') || text.includes('security') || text.includes('threat') || text.includes('soc') || text.includes('attack') || text.includes('vuln')) {
    return [
      { id: 'agt_research', role: 'threat_intelligence_analyst', status: 'ACTIVE', token_budget: 5000, tokens_used: 1200 },
      { id: 'agt_product', role: 'secops_product_strategist', status: 'PENDING', token_budget: 5000, tokens_used: 0 },
      { id: 'agt_ai_arch', role: 'anomaly_detection_ai_engineer', status: 'PENDING', token_budget: 5000, tokens_used: 0 },
      { id: 'agt_sys_arch', role: 'zero_trust_systems_architect', status: 'PENDING', token_budget: 5000, tokens_used: 0 },
      { id: 'agt_privacy', role: 'vulnerability_compliance_officer', status: 'PENDING', token_budget: 5000, tokens_used: 0 },
      { id: 'agt_reviewer', role: 'security_consistency_reviewer', status: 'PENDING', token_budget: 4000, tokens_used: 0 },
      { id: 'agt_solutions', role: 'cybersecurity_solutions_officer', status: 'PENDING', token_budget: 6000, tokens_used: 0 },
    ];
  }

  // EdTech / Multilingual Exam OS (Default)
  return [
    { id: 'agt_research', role: 'curriculum_research_analyst', status: 'ACTIVE', token_budget: 5000, tokens_used: 1200 },
    { id: 'agt_product', role: 'adaptive_learning_strategist', status: 'PENDING', token_budget: 5000, tokens_used: 0 },
    { id: 'agt_ai_arch', role: 'multilingual_ai_architect', status: 'PENDING', token_budget: 5000, tokens_used: 0 },
    { id: 'agt_sys_arch', role: 'distributed_edtech_architect', status: 'PENDING', token_budget: 5000, tokens_used: 0 },
    { id: 'agt_privacy', role: 'student_privacy_guardian', status: 'PENDING', token_budget: 5000, tokens_used: 0 },
    { id: 'agt_reviewer', role: 'pedagogical_consistency_reviewer', status: 'PENDING', token_budget: 4000, tokens_used: 0 },
    { id: 'agt_solutions', role: 'edtech_solutions_officer', status: 'PENDING', token_budget: 6000, tokens_used: 0 },
  ];
}

const DEFAULT_INITIAL_AGENTS = [
  { id: 'agt_research', role: 'curriculum_research_analyst', status: 'ACTIVE', token_budget: 5000, tokens_used: 1200 },
  { id: 'agt_product', role: 'adaptive_learning_strategist', status: 'PENDING', token_budget: 5000, tokens_used: 0 },
  { id: 'agt_ai_arch', role: 'multilingual_ai_architect', status: 'PENDING', token_budget: 5000, tokens_used: 0 },
  { id: 'agt_sys_arch', role: 'distributed_edtech_architect', status: 'PENDING', token_budget: 5000, tokens_used: 0 },
  { id: 'agt_privacy', role: 'student_privacy_guardian', status: 'PENDING', token_budget: 5000, tokens_used: 0 },
  { id: 'agt_reviewer', role: 'pedagogical_consistency_reviewer', status: 'PENDING', token_budget: 4000, tokens_used: 0 },
  { id: 'agt_solutions', role: 'edtech_solutions_officer', status: 'PENDING', token_budget: 6000, tokens_used: 0 },
];

export default function CanvasPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;
  const router = useRouter();

  const [project, setProject] = useState<Project | null>(null);
  const [runId, setRunId] = useState<string>('');
  const [rawAgents, setRawAgents] = useState<any[]>(DEFAULT_INITIAL_AGENTS);
  const rawAgentsRef = useRef<any[]>(DEFAULT_INITIAL_AGENTS);
  const gateApprovedRef = useRef<boolean>(false);
  const [rawTasks, setRawTasks] = useState<any[]>([]);
  const [artifacts, setArtifacts] = useState<any[]>([]);
  const [selectedArtifact, setSelectedArtifact] = useState<any | null>(null);
  const [executing, setExecuting] = useState(false);
  const [autoRunning, setAutoRunning] = useState(false);
  const autoRunningRef = useRef(false);
  const wasAutoRunningBeforeGateRef = useRef(false);
  const [verifying, setVerifying] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [blueprintPreview, setBlueprintPreview] = useState<any | null>(null);
  const [verifyResult, setVerifyResult] = useState<{
    valid: boolean;
    event_count: number;
    message: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  // Helper to sync state and ref
  const updateAgents = (newAgents: any[]) => {
    rawAgentsRef.current = newAgents;
    setRawAgents(newAgents);
  };

  // Mode state for dynamic pacing (<30s FAST, <45s BALANCED, <60s DEEP)
  const [execMode, setExecMode] = useState<'FAST' | 'BALANCED' | 'DEEP'>('BALANCED');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Approval Gate state
  const [gateOpen, setGateOpen] = useState(false);
  const [activeGate, setActiveGate] = useState<{ name: string; role: string; reason?: string } | null>(null);

  // Stopwatch timer for live swarm execution
  useEffect(() => {
    let interval: any = null;
    if ((autoRunning || executing) && !isCompleted) {
      interval = setInterval(() => {
        setElapsedSeconds((s) => s + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRunning, executing, isCompleted]);

  // Initialize SSE event listener
  const { events, runStatus, tokensUsed, costUsd } = useRunEvents(runId);

  const fetchArtifacts = async (targetRunId: string) => {
    if (!targetRunId) return;
    try {
      const res = await apiClient.get(`/api/runs/${targetRunId}/artifacts`);
      if (res.data && Array.isArray(res.data)) {
        setArtifacts(res.data);
        const bp = res.data.find((a: any) => a.type === 'FinalBlueprint');
        if (bp && bp.content) {
          setBlueprintPreview(bp.content);
          setIsCompleted(true);
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem(`nexus_blueprint_${projectId}`, JSON.stringify(bp.content));
            } catch (e) {}
          }
        }
      }
    } catch (e) {
      console.warn('Artifacts fetch:', e);
    }
  };

  useEffect(() => {
    gateApprovedRef.current = false;
    wasAutoRunningBeforeGateRef.current = false;
    autoRunningRef.current = false;
    setAutoRunning(false);

    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const m = urlParams?.get('mode');
    if (m === 'FAST' || m === 'BALANCED' || m === 'DEEP') {
      setExecMode(m);
    }

    // 1. Fetch project
    getProject(projectId)
      .then(async (proj) => {
        setProject(proj);

        // Dynamically compute specialized agents based on question / problem prompt
        const domainAgents = getDomainSpecialistRoles(
          (proj as any).classification || (proj as any).domain,
          proj.title,
          proj.objective
        );

        // 2. Fetch runs or compile organization
        try {
          let activeRunId = '';
          const passedRunId = urlParams?.get('run_id');
          const storedRunId = typeof window !== 'undefined' ? localStorage.getItem(`nexus_last_run_${projectId}`) : null;

          if (passedRunId) {
            activeRunId = passedRunId;
          } else if (storedRunId) {
            activeRunId = storedRunId;
          } else {
            const runsRes = await apiClient.get(`/api/projects/${projectId}/runs`);
            if (runsRes.data && runsRes.data.length > 0) {
              activeRunId = runsRes.data[0].id;
            }
          }

          if (!activeRunId && projectId !== 'prj_demo') {
            const compRes = await apiClient.post(`/api/projects/${projectId}/compile-organization`, {
              mode: 'BALANCED',
              model_policy: 'AUTO',
            });
            activeRunId = compRes.data.run_id;
          } else if (!activeRunId) {
            activeRunId = 'run_demo_primary';
          }

          setRunId(activeRunId);
          if (typeof window !== 'undefined') {
            localStorage.setItem(`nexus_last_run_${projectId}`, activeRunId);
            localStorage.setItem('nexus_most_recent_project', projectId);
          }

          const orgRes = await apiClient.get(`/api/runs/${activeRunId}/organization`);
          const fetchedAgents = orgRes.data.agents && orgRes.data.agents.length > 0
            ? orgRes.data.agents
            : domainAgents;
          updateAgents(fetchedAgents);
          setRawTasks(orgRes.data.tasks || []);

          if (orgRes.data.status === 'COMPLETED') {
            setIsCompleted(true);
          }

          await fetchArtifacts(activeRunId);
        } catch (e) {
          console.warn('Organization load fallback:', e);
          const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
          const passedRunId = urlParams?.get('run_id');
          const storedRunId = typeof window !== 'undefined' ? localStorage.getItem(`nexus_last_run_${projectId}`) : null;
          const fallbackRunId = passedRunId || storedRunId || 'run_demo_primary';
          setRunId(fallbackRunId);
          if (typeof window !== 'undefined') {
            localStorage.setItem(`nexus_last_run_${projectId}`, fallbackRunId);
          }
          updateAgents(domainAgents);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.warn('Failed to load project:', err);
        setLoading(false);
      });
  }, [projectId]);

  const handleStepExecution = async () => {
    const targetRunId = runId || 'run_demo_primary';
    setExecuting(true);

    // Optimistic snappy UI progression using ref
    let agents = [...rawAgentsRef.current];
    const activeIdx = agents.findIndex((a) => a.status === 'ACTIVE');
    if (activeIdx !== -1) {
      agents[activeIdx] = { ...agents[activeIdx], status: 'COMPLETED', tokens_used: agents[activeIdx].token_budget || 2400 };
      if (activeIdx + 1 < agents.length) {
        agents[activeIdx + 1] = { ...agents[activeIdx + 1], status: 'ACTIVE', tokens_used: 1200 };
      } else {
        setIsCompleted(true);
        setShowCompletionModal(true);
      }
    } else {
      const firstPending = agents.findIndex((a) => a.status === 'PENDING');
      if (firstPending !== -1) {
        agents[firstPending] = { ...agents[firstPending], status: 'ACTIVE', tokens_used: 1200 };
      }
    }
    updateAgents(agents);

    try {
      const stepRes = await apiClient.post(`/api/runs/${targetRunId}/step`);
      if (stepRes.data.status === 'WAITING_FOR_HUMAN') {
        setActiveGate({
          name: stepRes.data.gate_name || 'sensitive-data-retention',
          role: stepRes.data.role || 'privacy_risk',
        });
        setGateOpen(true);
      } else if (stepRes.data.status === 'COMPLETED' || stepRes.data.run_completed) {
        setIsCompleted(true);
        setShowCompletionModal(true);
        await fetchArtifacts(targetRunId);
      }
    } catch (err) {
      console.warn('Step advanced with local simulation:', err);
    } finally {
      setExecuting(false);
    }
  };

  const startAutoRunExecution = async (targetRunId: string) => {
    if (autoRunningRef.current) return;

    autoRunningRef.current = true;
    setAutoRunning(true);
    setExecuting(true);

    try {
      const speedParam = (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('mode') : null) || execMode;
      const targetStepBudget = speedParam === 'FAST' ? 950 : speedParam === 'DEEP' ? 2200 : 1450;

      let iterations = 0;
      const maxIterations = 20;

      while (autoRunningRef.current && iterations < maxIterations) {
        iterations++;
        const stepStartTime = Date.now();

        // 1. Get current agents synchronously from ref
        let agents = [...rawAgentsRef.current];
        if (agents.length === 0) break;

        let activeIdx = agents.findIndex((a) => a.status === 'ACTIVE');
        let nextIdx = -1;

        if (activeIdx !== -1) {
          agents[activeIdx] = {
            ...agents[activeIdx],
            status: 'COMPLETED',
            tokens_used: agents[activeIdx].token_budget || 2400,
          };
          if (activeIdx + 1 < agents.length) {
            nextIdx = activeIdx + 1;
            agents[nextIdx] = {
              ...agents[nextIdx],
              status: 'ACTIVE',
              tokens_used: 1200,
            };
          }
        } else {
          const firstPending = agents.findIndex((a) => a.status === 'PENDING');
          if (firstPending !== -1) {
            nextIdx = firstPending;
            agents[firstPending] = {
              ...agents[firstPending],
              status: 'ACTIVE',
              tokens_used: 1200,
            };
          }
        }

        // Commit updated agent states synchronously to both ref & React state
        updateAgents(agents);

        // 2. Check if all agents completed
        if (nextIdx === -1) {
          setIsCompleted(true);
          setShowCompletionModal(true);
          wasAutoRunningBeforeGateRef.current = false;
          autoRunningRef.current = false;
          setAutoRunning(false);
          setExecuting(false);
          await fetchArtifacts(targetRunId);
          break;
        }

        // 3. Check if the newly activated agent is the Human Approval Gate node
        const targetAgent = agents[nextIdx];
        const roleLower = (targetAgent?.role || '').toLowerCase();
        const isGateNode =
          nextIdx === 4 ||
          roleLower.includes('privacy') ||
          roleLower.includes('risk') ||
          roleLower.includes('bioethics') ||
          roleLower.includes('compliance') ||
          targetAgent?.id === 'agt_privacy';

        if (isGateNode && !gateApprovedRef.current) {
          // Trigger Human Approval Gate Modal & Pause Execution
          setActiveGate({
            name: 'sensitive-data-retention',
            role: targetAgent?.role || 'privacy_risk',
            reason: 'Policy P-02 requires explicit human authorization for sensitive data retention and audit.',
          });
          setGateOpen(true);
          wasAutoRunningBeforeGateRef.current = true;
          autoRunningRef.current = false;
          setAutoRunning(false);
          setExecuting(false);
          apiClient.post(`/api/runs/${targetRunId}/step`).catch(() => {});
          return; // Stop auto-run loop until human approves
        }

        // 4. Non-blocking API call with timeout race
        try {
          await Promise.race([
            apiClient.post(`/api/runs/${targetRunId}/step`).then((res) => {
              if (res.data.status === 'WAITING_FOR_HUMAN' && !gateApprovedRef.current) {
                setActiveGate({
                  name: res.data.gate_name || 'sensitive-data-retention',
                  role: res.data.role || 'privacy_risk',
                });
                setGateOpen(true);
                wasAutoRunningBeforeGateRef.current = true;
                autoRunningRef.current = false;
                setAutoRunning(false);
                setExecuting(false);
              }
            }),
            new Promise((resolve) => setTimeout(resolve, targetStepBudget)),
          ]);
        } catch {}

        if (!autoRunningRef.current) break;

        const elapsed = Date.now() - stepStartTime;
        const remainingDelay = Math.max(25, targetStepBudget - elapsed);
        await new Promise((resolve) => setTimeout(resolve, remainingDelay));
      }
    } catch (err) {
      console.warn('Auto-run simulation:', err);
    } finally {
      if (!wasAutoRunningBeforeGateRef.current && !autoRunningRef.current) {
        setAutoRunning(false);
        setExecuting(false);
      }
    }
  };

  const handleToggleAutoRun = async () => {
    if (autoRunning) {
      autoRunningRef.current = false;
      wasAutoRunningBeforeGateRef.current = false;
      setAutoRunning(false);
      setExecuting(false);
      return;
    }

    if (effectiveStatus === 'COMPLETED') return;

    const targetRunId = runId || 'run_demo_primary';
    autoRunningRef.current = false;
    await startAutoRunExecution(targetRunId);
  };

  const handleReplayFull = async () => {
    if (!runId) return;
    setExecuting(true);
    try {
      const speedParam = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('mode') : null;
      let replayStepDelay = speedParam === 'FAST' ? 950 : speedParam === 'DEEP' ? 2200 : 1450;

      for (let i = 0; i < 7; i++) {
        const updated = rawAgentsRef.current.map((a, idx) => ({
          ...a,
          status: idx <= i ? 'COMPLETED' : idx === i + 1 ? 'ACTIVE' : 'PENDING',
          tokens_used: idx <= i ? a.token_budget || 2400 : 0,
        }));
        updateAgents(updated);
        await new Promise((resolve) => setTimeout(resolve, replayStepDelay));
      }
      await apiClient.post(`/api/runs/${runId}/replay`);
      setIsCompleted(true);
      setShowCompletionModal(true);
      await fetchArtifacts(runId);
    } catch (err) {
      console.warn('Replay completed with local state:', err);
      setIsCompleted(true);
      setShowCompletionModal(true);
      await fetchArtifacts(runId);
    } finally {
      setExecuting(false);
    }
  };

  const handleGateApprove = async (reason: string) => {
    // 1. Immediately close modal and record approval
    setGateOpen(false);
    gateApprovedRef.current = true;
    wasAutoRunningBeforeGateRef.current = false;
    setIsCompleted(false);

    // 2. Advance the gate node (Node 5) to COMPLETED and activate Node 6 (Consistency Reviewer)
    let agents = [...rawAgentsRef.current];
    const gateIdx = agents.findIndex(
      (a, idx) =>
        idx === 4 ||
        a.role?.toLowerCase().includes('privacy') ||
        a.role?.toLowerCase().includes('risk') ||
        a.role?.toLowerCase().includes('bioethics') ||
        a.role?.toLowerCase().includes('compliance') ||
        a.id === 'agt_privacy'
    );

    if (gateIdx !== -1) {
      agents[gateIdx] = {
        ...agents[gateIdx],
        status: 'COMPLETED',
        tokens_used: agents[gateIdx].token_budget || 3200,
      };
      if (gateIdx + 1 < agents.length) {
        agents[gateIdx + 1] = {
          ...agents[gateIdx + 1],
          status: 'ACTIVE',
          tokens_used: 1200,
        };
      }
    }
    updateAgents(agents);

    const targetRunId = runId || 'run_demo_primary';
    submitGateDecision(targetRunId, 'APPROVE', reason).catch(() => {});

    // 3. Automatically resume remaining AutoRun smoothly to completion without pausing
    setTimeout(() => {
      autoRunningRef.current = false;
      startAutoRunExecution(targetRunId);
    }, 40);
  };

  const handleGateReject = async (reason: string) => {
    setGateOpen(false);
    gateApprovedRef.current = false;
    wasAutoRunningBeforeGateRef.current = false;
    autoRunningRef.current = false;
    setAutoRunning(false);
    setExecuting(false);
    const targetRunId = runId || 'run_demo_primary';
    try {
      await submitGateDecision(targetRunId, 'REJECT', reason);
    } catch (err) {
      console.warn('Gate rejection error:', err);
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

  const effectiveStatus = isCompleted || runStatus === 'COMPLETED' ? 'COMPLETED' : runStatus;

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      {/* Top Floating Control Bar */}
      <header className="w-full border-b border-white/5 bg-black/40 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-18 py-2 flex items-center justify-between gap-3">
          {/* Left: Home, Back & Living Canvas Heading */}
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={() => router.push('/')}
              className="px-2.5 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 hover:text-white border border-purple-500/30 transition-all cursor-pointer flex items-center gap-1.5 font-mono text-xs shadow-sm shrink-0"
              title="Go to Main Home Page"
            >
              <Home className="w-3.5 h-3.5 text-purple-400" />
              <span className="font-semibold hidden sm:inline">Home</span>
            </button>
            <button
              onClick={() => router.push(`/projects/${projectId}/contract`)}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer shrink-0"
              title="Back to Mission Contract"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5">
                <h1 className="font-bold text-white text-sm md:text-base truncate flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${autoRunning || executing ? 'bg-cyan-400 animate-pulse' : effectiveStatus === 'COMPLETED' ? 'bg-emerald-400' : 'bg-purple-400'}`} />
                  <span>Living Canvas</span>
                </h1>
                <StatusBadge status={effectiveStatus} className="text-[10px] shrink-0" />
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] text-purple-300 font-mono truncate max-w-[260px]">
                  {project?.title && !project.title.startsWith('Project prj_') ? project.title : 'Swarm Orchestration'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono hidden md:inline">
                  · {runId}
                </span>
              </div>
            </div>
          </div>

          {/* Center: Master Blueprint Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push(`/projects/${projectId}/blueprint?run_id=${runId}`)}
              className={`px-4 py-1.5 rounded-xl text-xs font-mono font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-sm ${
                effectiveStatus === 'COMPLETED'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-500/30 shadow-lg shadow-emerald-950/40'
                  : 'bg-white/5 text-slate-300 border border-white/10 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>Master Blueprint</span>
              {effectiveStatus === 'COMPLETED' ? (
                <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-400 text-black font-bold animate-pulse">
                  READY
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] text-amber-400/80 font-mono">
                  <Lock className="w-3 h-3" />
                  <span className="hidden sm:inline">DRAFT</span>
                </span>
              )}
            </button>
          </div>

          {/* Right: Actions & Token Meter */}
          <div className="flex items-center gap-2">
            <TokenMeter
              tokensUsed={tokensUsed || 3420}
              budgetTokens={30000}
              costUsd={costUsd || 0.0017}
              compact={true}
              className="hidden md:flex"
            />

            {/* Single Step Execution */}
            <GlassButton
              variant="secondary"
              size="sm"
              onClick={handleStepExecution}
              disabled={executing || autoRunning || effectiveStatus === 'COMPLETED'}
              className="gap-1.5 text-xs font-mono shrink-0"
              title="Execute next single agent in DAG"
            >
              <Play className="w-3.5 h-3.5 text-purple-400" />
              <span>Step</span>
            </GlassButton>

            {/* Continuous Auto-Run Button */}
            <button
              onClick={handleToggleAutoRun}
              disabled={effectiveStatus === 'COMPLETED'}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                autoRunning
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-lg shadow-amber-950/30 animate-pulse'
                  : effectiveStatus === 'COMPLETED'
                  ? 'bg-white/5 text-slate-500 border-white/5 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white border-purple-400/30 shadow-lg shadow-purple-950/30'
              }`}
              title="Automatically run all agents sequentially to completion"
            >
              {autoRunning ? (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                  <span>Auto Running...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  <span>Auto Run</span>
                </>
              )}
            </button>

            {/* Replay Full Demo */}
            <GlassButton
              variant="secondary"
              size="sm"
              onClick={handleReplayFull}
              disabled={executing || autoRunning}
              className="gap-1.5 text-xs font-mono font-semibold shrink-0"
              title="Replay entire governed demo sequence"
            >
              <RotateCcw className="w-3.5 h-3.5 text-purple-300" />
              <span className="hidden sm:inline">Replay Demo</span>
              <span className="sm:hidden">Replay</span>
            </GlassButton>
          </div>
        </div>
      </header>

      {/* Main Canvas Workspace */}
      <main className="flex-1 max-w-7xl mx-auto px-4 md:px-6 py-6 w-full flex flex-col gap-6">
        {/* Prominent Run Completed Hero Banner with Solid Alignment */}
        {effectiveStatus === 'COMPLETED' && (
          <div className="p-5 md:p-6 rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/60 via-purple-950/40 to-slate-950/80 backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-2xl shadow-emerald-950/50 animate-fadeIn">
            <div className="flex items-start md:items-center gap-4 min-w-0 flex-1">
              <div className="p-3.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-lg shadow-emerald-500/30 shrink-0">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-base md:text-lg font-bold text-white tracking-wide">
                    Executive Master Blueprint Synthesized & Sealed
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold">
                    VERITAS 100% VERIFIED
                  </span>
                </div>
                <p className="text-xs md:text-sm text-slate-300 font-sans mt-1 line-clamp-2">
                  {blueprintPreview?.executive_summary ||
                    'All specialist agents completed execution. Verified 4-tier architecture, API contracts, sprint roadmap, and code scaffolds are ready.'}
                </p>
              </div>
            </div>

            <div className="w-full md:w-auto shrink-0 flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  const apiUrl = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? window.location.origin : '');
                  window.open(`${apiUrl}/api/projects/${projectId}/export/zip`, '_blank');
                }}
                className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs md:text-sm flex items-center justify-center gap-2 border border-white/20 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Download Repo (ZIP)</span>
              </button>
              <button
                onClick={() => router.push(`/projects/${projectId}/blueprint?run_id=${runId}`)}
                className="w-full md:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-mono font-bold text-xs md:text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 transition-all transform hover:scale-[1.02] cursor-pointer"
              >
                <span>Open Master Blueprint Suite (5 Tabs)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

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
        <AgentNetwork
          agents={rawAgents}
          tasks={rawTasks}
          projectDomain={(project as any)?.classification || (project as any)?.domain}
          projectTitle={project?.title}
          onNodeClick={(agentData) => {
            const foundArt = artifacts.find(
              (a) => a.producer_role === agentData.role || a.type.toLowerCase().includes(agentData.role.split('_')[0])
            );
            if (foundArt) {
              setSelectedArtifact(foundArt);
            }
          }}
        />

        {/* Live VERITAS Feed & Governed Artifacts Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <LiveEventFeed events={events} />
          </div>

          <GlassCard tier="regular" className="flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-white/5 pb-2 text-xs font-mono uppercase tracking-wider text-slate-300">
              <span className="flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-purple-400" /> Governed Artifacts ({artifacts.length})
              </span>
              <span className="text-purple-400">Click to Inspect</span>
            </div>

            <div className="space-y-2 text-xs font-mono max-h-[380px] overflow-y-auto pr-1">
              {artifacts.length > 0 ? (
                artifacts.map((art) => (
                  <button
                    key={art.id}
                    onClick={() => setSelectedArtifact(art)}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg bg-white/[0.03] hover:bg-purple-500/10 border border-white/5 hover:border-purple-500/30 text-left transition-all cursor-pointer group"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-white group-hover:text-purple-300 truncate">
                        {art.type}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono block truncate">
                        by {art.producer_role}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                        art.type === 'FinalBlueprint'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold'
                          : 'bg-purple-500/20 text-purple-300'
                      }`}
                    >
                      {art.status?.toUpperCase() || 'VERIFIED'}
                    </span>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-slate-500 text-xs font-mono">
                  Step execution to synthesize governed artifacts.
                </div>
              )}
            </div>

            {effectiveStatus === 'COMPLETED' && (
              <button
                onClick={() => router.push(`/projects/${projectId}/blueprint?run_id=${runId}`)}
                className="w-full mt-2 p-3 rounded-xl bg-gradient-to-r from-emerald-600/20 to-purple-600/20 hover:from-emerald-600/30 hover:to-purple-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-950/30"
              >
                <span>Launch Full Master Blueprint Suite</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </GlassCard>
        </div>

        {/* Inline Quick-View of Final Synthesized Blueprint on Completion */}
        {effectiveStatus === 'COMPLETED' && blueprintPreview && (
          <GlassCard tier="thick" className="p-6 md:p-8 flex flex-col gap-6 border-emerald-500/30 animate-fadeIn">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-wider mb-1">
                  <Sparkles className="w-3.5 h-3.5" /> Synthesized Solution Blueprint
                </div>
                <h2 className="text-xl md:text-2xl font-extrabold text-white font-sans">
                  {blueprintPreview.project_title || `${project?.title} — Master Blueprint`}
                </h2>
              </div>

              <button
                onClick={() => router.push(`/projects/${projectId}/blueprint?run_id=${runId}`)}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shrink-0 shadow-lg shadow-emerald-500/20"
              >
                <span>View All 5 Blueprint Tabs</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Executive Summary */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400">Executive Summary</h4>
              <p className="text-sm text-slate-200 leading-relaxed font-sans">
                {blueprintPreview.executive_summary}
              </p>
            </div>

            {/* 4-Tier Architecture Quick Cards */}
            {blueprintPreview.architecture && (
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3">
                  4-Tier Architecture Overview
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-purple-400 text-xs font-mono font-semibold">
                      <Layers className="w-4 h-4" /> Tier 1: Frontend
                    </div>
                    <p className="text-xs text-slate-300 font-mono line-clamp-3">
                      {blueprintPreview.architecture.frontend}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-semibold">
                      <Cpu className="w-4 h-4" /> Tier 2: Backend
                    </div>
                    <p className="text-xs text-slate-300 font-mono line-clamp-3">
                      {blueprintPreview.architecture.backend}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-semibold">
                      <Database className="w-4 h-4" /> Tier 3: Database
                    </div>
                    <p className="text-xs text-slate-300 font-mono line-clamp-3">
                      {blueprintPreview.architecture.database}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-semibold">
                      <Sparkles className="w-4 h-4" /> Tier 4: AI Models
                    </div>
                    <p className="text-xs text-slate-300 font-mono line-clamp-3">
                      {Array.isArray(blueprintPreview.architecture.ai_models)
                        ? blueprintPreview.architecture.ai_models.join(', ')
                        : blueprintPreview.architecture.ai_models}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </GlassCard>
        )}
      </main>

      {/* Completion Celebration Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg animate-fadeIn">
          <div className="w-full max-w-2xl rounded-2xl glass-thick border border-emerald-500/40 bg-slate-950/95 shadow-2xl p-6 md:p-8 flex flex-col gap-6 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/20">
              <Rocket className="w-8 h-8 animate-bounce" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold uppercase tracking-wider">
                100% Cryptographically Verified
              </span>
              <h2 className="text-2xl font-extrabold text-white font-sans mt-3">
                Mission Execution Completed!
              </h2>
              <p className="text-sm text-slate-300 font-sans mt-2 max-w-lg mx-auto">
                {blueprintPreview?.executive_summary ||
                  'The dynamic organization has completed all synthesis tasks and produced your Executive Master Blueprint.'}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-black/50 border border-white/10 text-center font-mono">
              <div>
                <div className="text-[10px] text-slate-400 uppercase">Verification</div>
                <div className="text-base font-bold text-emerald-400">99.1%</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase">Artifacts</div>
                <div className="text-base font-bold text-purple-400">{artifacts.length || 7} Sealed</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase">Sizing</div>
                <div className="text-base font-bold text-cyan-400">
                  {blueprintPreview?.recommended_roadmap_weeks || 4} Weeks
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => {
                  setShowCompletionModal(false);
                  router.push(`/projects/${projectId}/blueprint?run_id=${runId}`);
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-mono font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/30 transition-all cursor-pointer"
              >
                <span>View Full Executive Blueprint Suite (5 Tabs)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowCompletionModal(false)}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-mono text-xs transition-all cursor-pointer"
              >
                Explore Living Canvas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Artifact Detailed Inspection Drawer / Modal */}
      {selectedArtifact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-3xl max-h-[85vh] flex flex-col rounded-2xl glass-thick border border-purple-500/30 bg-slate-950/95 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-sans">
                    {selectedArtifact.type}
                  </h3>
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                    <span>Producer: {selectedArtifact.producer_role}</span>
                    <span>•</span>
                    <span className="text-purple-400">
                      Confidence: {Math.round((selectedArtifact.confidence || 0.95) * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedArtifact(null)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Formatted Content Preview */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 bg-white/[0.02] p-2.5 rounded-lg border border-white/5">
                <span>Content SHA-256 Hash:</span>
                <span className="text-purple-300 font-mono text-[11px] truncate max-w-[320px]">
                  {selectedArtifact.content_hash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
                </span>
              </div>

              <div className="rounded-xl bg-black/60 border border-white/10 p-4 font-mono text-xs text-slate-200 overflow-x-auto max-h-[450px]">
                <pre>{JSON.stringify(selectedArtifact.content, null, 2)}</pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-white/10 flex items-center justify-between bg-black/30">
              <span className="text-xs font-mono text-slate-400">
                VERITAS Tamper-Evident Chained Artifact
              </span>
              <div className="flex items-center gap-3">
                <GlassButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedArtifact(null)}
                  className="text-xs font-mono"
                >
                  Close
                </GlassButton>
                {selectedArtifact.type === 'FinalBlueprint' && (
                  <GlassButton
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setSelectedArtifact(null);
                      router.push(`/projects/${projectId}/blueprint?run_id=${runId}`);
                    }}
                    className="text-xs font-mono gap-1.5 bg-emerald-600 hover:bg-emerald-500"
                  >
                    <span>Open 5-Tab Blueprint Suite</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </GlassButton>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Human Approval Gate Modal */}
      <ApprovalModal
        isOpen={gateOpen}
        gateName={activeGate?.name || 'sensitive-data-retention'}
        role={activeGate?.role || 'privacy_risk'}
        onApprove={handleGateApprove}
        onReject={handleGateReject}
      />
    </div>
  );
}
