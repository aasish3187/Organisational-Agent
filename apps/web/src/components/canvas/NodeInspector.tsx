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
  projectDomain?: string;
  projectTitle?: string;
}

export function getRoleMandate(role: string, domain?: string, title?: string): string {
  const r = role.toLowerCase();
  const d = (domain || '').toLowerCase();

  if (r.includes('research') || r.includes('supply_chain') || r.includes('curriculum') || r.includes('clinical') || r.includes('threat') || r.includes('intelligence') || r.includes('market')) {
    if (d.includes('food') || r.includes('supply_chain')) return 'Analyze food perishability guidelines, cold-chain temperature thresholds, food safety laws, and local shelter distribution networks.';
    if (d.includes('grievance') || r.includes('civic')) return 'Analyze citizen rights, e-governance service SLAs, municipal complaint taxonomy, and legal whistleblower protections.';
    if (d.includes('health') || r.includes('clinical')) return 'Extract clinical trial inclusion criteria, biomedical ontology mappings, and HIPAA/FHIR medical compliance benchmarks.';
    if (d.includes('fintech') || r.includes('market')) return 'Analyze SEC regulations, financial transaction audit standards, ISO 20022 schemas, and AML fraud vectors.';
    if (d.includes('cyber') || r.includes('threat')) return 'Gather threat intelligence feeds, zero-day CVE databases, MITRE ATT&CK vectors, and NIST compliance criteria.';
    return 'Gather credible empirical evidence, evaluate source tier quality, and formulate evidence-backed domain findings.';
  }

  if (r.includes('product') || r.includes('strategist')) {
    if (d.includes('food') || r.includes('logistics')) return 'Specify surplus food batch ingestion models, volunteer claim flows, shelter allocation algorithms, and MVP acceptance criteria.';
    if (d.includes('grievance') || r.includes('service')) return 'Define citizen grievance intake forms, multilingual voice/text triage flows, auto-escalation matrix, and SLA criteria.';
    if (d.includes('health') || r.includes('medical')) return 'Architect patient diagnostic user journeys, telehealth encounter workflows, and doctor-patient interaction criteria.';
    if (d.includes('fintech')) return 'Define real-time ledger settlement flows, multi-currency transaction boundaries, and fraud alert MVP criteria.';
    if (d.includes('cyber') || r.includes('secops')) return 'Define automated incident response playbooks, quarantine triggers, and security operations MVP scope.';
    return 'Translate research evidence and user contracts into prioritized MVP feature specifications and acceptance criteria.';
  }

  if (r.includes('ai') || r.includes('rag') || r.includes('model') || r.includes('neural')) {
    if (d.includes('food') || r.includes('perishability')) return 'Design route optimization algorithms, perishability countdown models, and donation-to-shelter matching neural graphs.';
    if (d.includes('grievance') || r.includes('nlp')) return 'Design multilingual semantic vector embeddings, sentiment urgency classifiers, and automated department dispatch models.';
    if (d.includes('health') || r.includes('biomedical')) return 'Architect medical RAG retrieval pipelines, FHIR-compliant biomedical embeddings, and diagnostic cross-validation models.';
    if (d.includes('fintech') || r.includes('fraud')) return 'Build real-time anomaly detection graphs, transaction risk scoring models, and vector similarity fraud detectors.';
    if (d.includes('cyber') || r.includes('anomaly')) return 'Design real-time zero-day intrusion detection models, behavioral packet classifiers, and automated kill-chain analyzers.';
    return 'Design foundation model selection, retrieval pipeline, embeddings, evaluation dataset, and prompt topologies.';
  }

  if (r.includes('system') || r.includes('infra') || r.includes('ledger') || r.includes('dispatch') || r.includes('distributed')) {
    if (d.includes('food') || r.includes('geo')) return 'Architect real-time WebSockets telemetry, geospatial PostGIS database schemas, Redis Pub/Sub fleet event queues, and Docker microservices.';
    if (d.includes('grievance') || r.includes('governance')) return 'Architect high-throughput citizen intake APIs, PostgreSQL partitioned audit logs, encrypted queue workers, and Docker services.';
    if (d.includes('health') || r.includes('hipaa')) return 'Architect HIPAA-compliant end-to-end encrypted databases, FHIR JSON-REST endpoints, and isolated VPC cloud containers.';
    if (d.includes('fintech') || r.includes('ledger')) return 'Architect ACID-compliant distributed transaction ledgers, idempotent payment webhooks, and Redis caching layers.';
    if (d.includes('cyber') || r.includes('zero_trust')) return 'Architect zero-trust API gateways, mTLS microservice mesh, event streaming bus, and immutable system audit logs.';
    return 'Architect backend services, API contracts, database schemas, caching tiers, and event pub/sub infrastructure.';
  }

  if (r.includes('privacy') || r.includes('risk') || r.includes('guard') || r.includes('compliance') || r.includes('guardian') || r.includes('safety')) {
    if (d.includes('food') || r.includes('safety')) return 'Enforce food temperature safety limits, cold-chain audit bounds, and require Human Approval Gate for shelf-life overrides.';
    if (d.includes('grievance') || r.includes('whistleblower')) return 'Enforce zero-knowledge citizen anonymization, scrub sensitive telemetry, and gate public whistleblowing data.';
    if (d.includes('health') || r.includes('bioethics')) return 'Audit HIPAA/GDPR health data boundaries, eliminate PII leakage, and gate patient record transmission.';
    if (d.includes('fintech') || r.includes('sec')) return 'Audit financial transaction retention, enforce KYC/AML compliance rules, and gate high-value settlement limits.';
    if (d.includes('cyber') || r.includes('vulnerability')) return 'Perform automated vulnerability scans, enforce zero-trust boundary isolation, and gate root-privilege changes.';
    return 'Identify design risks, user data sensitivity, retention bounds, and mandatory human escalation gates.';
  }

  if (r.includes('reviewer') || r.includes('auditor') || r.includes('consistency')) {
    if (d.includes('food')) return 'Verify that delivery route time bounds never exceed perishability countdown limits across all generated schemas.';
    if (d.includes('grievance')) return 'Verify that grievance auto-dispatch categories match department jurisdiction without routing conflicts.';
    if (d.includes('health')) return 'Cross-audit medical contraindication logic and verify zero dosage contradictions across specifications.';
    if (d.includes('fintech')) return 'Verify that double-entry balance constraints and currency rounding rules are strictly preserved.';
    if (d.includes('cyber')) return 'Audit attack surface minimization and verify zero open ports or unauthorized API access routes.';
    return 'Inspect all intermediate artifacts for cross-claim contradictions, unsupported assertions, and policy violations.';
  }

  if (r.includes('solutions') || r.includes('officer') || r.includes('lead')) {
    return 'Synthesize verified inputs, architectural specifications, and code scaffolds into a unified, cryptographically sealed Master Blueprint.';
  }

  return 'Execute governed specialized tasks within certified organizational mandate boundaries.';
}

export function getRoleTools(role: string): string[] {
  const r = role.toLowerCase();
  if (r.includes('research') || r.includes('intelligence') || r.includes('supply_chain') || r.includes('clinical')) {
    return ['web_evidence_crawler', 'document_retriever', 'source_tier_evaluator', 'veritas_emitter'];
  }
  if (r.includes('product') || r.includes('strategist')) {
    return ['mvp_scope_optimizer', 'user_persona_builder', 'acceptance_criteria_validator', 'veritas_emitter'];
  }
  if (r.includes('ai') || r.includes('rag') || r.includes('model') || r.includes('neural')) {
    return ['model_benchmark_suite', 'vector_pgvector_indexer', 'rag_prompt_synthesizer', 'latency_profiler'];
  }
  if (r.includes('system') || r.includes('infra') || r.includes('dispatch') || r.includes('ledger')) {
    return ['openapi_generator', 'redis_stream_configurator', 'postgres_ddl_scaffolder', 'docker_composer'];
  }
  if (r.includes('privacy') || r.includes('risk') || r.includes('compliance') || r.includes('guard')) {
    return ['p02_privacy_scanner', 'pii_scrubber', 'retention_policy_enforcer', 'human_gate_emitter'];
  }
  if (r.includes('reviewer') || r.includes('auditor') || r.includes('consistency')) {
    return ['cross_artifact_auditor', 'contradiction_detector', 'governance_verifier', 'veritas_emitter'];
  }
  return ['master_blueprint_compiler', 'veritas_merkle_prover', 'code_scaffolder', 'zip_packager'];
}

export function getRoleTaskInfo(role: string): { phase: string; badge: string; description: string } {
  const r = role.toLowerCase();
  if (r.includes('research') || r.includes('intelligence') || r.includes('supply_chain') || r.includes('clinical')) {
    return {
      phase: 'Phase 1: Evidence Grounding',
      badge: 'P-01 Grounded',
      description: 'Produces verified EvidenceBrief envelope with empirical citation hashes and source validation.',
    };
  }
  if (r.includes('product') || r.includes('strategist')) {
    return {
      phase: 'Phase 2: MVP Scope Definition',
      badge: 'ProductSpec',
      description: 'Produces structured ProductSpec defining user journeys, release criteria, and feature boundaries.',
    };
  }
  if (r.includes('ai') || r.includes('rag') || r.includes('model') || r.includes('neural')) {
    return {
      phase: 'Phase 3: Deep Neural Architecture',
      badge: 'AIArchitectureSpec',
      description: 'Produces AIArchitectureSpec detailing embedding models, vector indexing, and RAG pipeline topology.',
    };
  }
  if (r.includes('system') || r.includes('infra') || r.includes('dispatch') || r.includes('ledger')) {
    return {
      phase: 'Phase 4: High-Throughput Infrastructure',
      badge: 'SystemArchitectureSpec',
      description: 'Produces SystemArchitectureSpec with microservices, OpenAPI endpoints, and PostgreSQL schemas.',
    };
  }
  if (r.includes('privacy') || r.includes('risk') || r.includes('compliance') || r.includes('guard')) {
    return {
      phase: 'Phase 5: Governance & Threat Audit',
      badge: 'Policy P-02 Shield',
      description: 'Evaluates privacy sensitivity, enforces data retention boundaries, and manages Human Approval Gate.',
    };
  }
  if (r.includes('reviewer') || r.includes('auditor') || r.includes('consistency')) {
    return {
      phase: 'Phase 6: Formal Cross-Verification',
      badge: 'ConsistencyAudit',
      description: 'Performs cross-artifact audit to ensure zero schema contradictions and strict policy alignment.',
    };
  }
  return {
    phase: 'Phase 7: Master Blueprint Synthesis',
    badge: 'FinalBlueprint',
    description: 'Compiles all specialist artifacts, code scaffolds, and sprint roadmaps into a cryptographic SHA-256 sealed blueprint.',
  };
}

export function NodeInspector({ agent, onClose, projectDomain, projectTitle }: NodeInspectorProps) {
  if (!agent) return null;

  const mandate = getRoleMandate(agent.role, projectDomain, projectTitle);
  const tools = getRoleTools(agent.role);
  const taskInfo = getRoleTaskInfo(agent.role);
  const budgetPct = Math.min((agent.tokensUsed / (agent.tokenBudget || 1)) * 100, 100);

  const displayRoleTitle = agent.role
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return (
    <div className="w-80 lg:w-96 flex flex-col h-full bg-[#080d1a]/85 backdrop-blur-2xl border-l border-white/10 p-5 overflow-y-auto shadow-2xl z-30 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-mono">
              {displayRoleTitle}
            </h3>
            <span className="text-[11px] text-purple-400 font-mono block">
              {agent.role}
            </span>
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
        <p className="text-xs text-slate-300 leading-relaxed p-3 rounded-xl bg-white/[0.02] border border-white/5 font-sans">
          {mandate}
        </p>
      </div>

      {/* Permitted Tools */}
      <div className="mb-6 space-y-2">
        <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Wrench className="w-3.5 h-3.5 text-indigo-400" /> Permitted Tool Catalog
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {tools.map((tool) => (
            <span
              key={tool}
              className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-[10px] font-mono text-cyan-300"
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
            <span className="font-semibold text-slate-200">{taskInfo.phase}</span>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">{taskInfo.badge}</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            {taskInfo.description}
          </p>
        </div>
      </div>
    </div>
  );
}
