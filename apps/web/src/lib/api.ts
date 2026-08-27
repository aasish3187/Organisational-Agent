import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000,
});

export interface HealthStatus {
  status: string;
  app: string;
  version: string;
  environment: string;
  demo_mode: boolean;
}

export interface Project {
  id: string;
  title: string;
  objective: string;
  classification: string;
  owner_session: string;
  created_at: string;
}

export interface IdeaContract {
  title: string;
  domain: string;
  target_audience: string;
  problem_statement: string;
  success_criteria: string[];
  constraints: string[];
  assumptions: string[];
  data_sensitivity: string;
  confidence: number;
  open_questions: string[];
  suggested_specialists: string[];
}

export interface SelectionRationale {
  role: string;
  reason: string;
  source?: string | null;
}

export interface TaskSpec {
  task_id: string;
  role: string;
  depends_on: string[];
  allowed_tools: string[];
  input_artifacts: string[];
  output_schema: string;
  review_required: boolean;
  token_budget: number;
  risk_level: string;
}

export interface OrganizationPlan {
  run_id: string;
  project_id: string;
  mode: string;
  goal: string;
  selection_rationale: SelectionRationale[];
  budget: {
    max_tokens: number;
    max_cost_usd: number;
    max_minutes: number;
  };
  tasks: TaskSpec[];
  human_gates: string[];
  retrieved_atoms: Array<{
    id?: string;
    atom_id?: string;
    name: string;
    applicability: Record<string, any>;
    action: string;
    purpose: string;
    tags: string[];
  }>;
}

export interface ApiContractEndpoint {
  method: string;
  path: string;
  description: string;
  request_type: string;
  response_type: string;
}

export interface SprintMilestone {
  week_range: string;
  phase_name: string;
  deliverables: string[];
  accountable_role: string;
  kpi_metric: string;
}

export interface GovernanceCertificate {
  policy_code: string;
  policy_name: string;
  severity: string;
  status: string;
  audit_proof: string;
}

export interface LearnedMemoryAtomSummary {
  atom_id: string;
  name: string;
  action_rule: string;
  applicability_domain: string;
  privacy_scrubbed: boolean;
}

export interface CodeScaffold {
  title: string;
  language: string;
  filename: string;
  code_content: string;
}

export interface FinalBlueprint {
  project_title: string;
  executive_summary: string;
  problem_statement?: string;
  target_users?: string;
  domain?: string;
  architecture: {
    frontend: string;
    backend: string;
    database: string;
    ai_models: string[];
    infrastructure?: string;
    security_controls?: string[];
  };
  core_features: string[];
  data_flows?: string[];
  api_contracts?: ApiContractEndpoint[];
  roadmap_schedule?: SprintMilestone[];
  recommended_roadmap_weeks: number;
  governance_certificates?: GovernanceCertificate[];
  governance_and_privacy: string[];
  veritas_chain_hash?: string;
  veritas_verified_events: number;
  verification_score_pct?: number;
  learned_atoms?: LearnedMemoryAtomSummary[];
  code_scaffolds?: CodeScaffold[];
  estimated_token_cost_usd: number;
  total_tokens_consumed?: number;
  time_to_synthesize_sec?: number;
}

export interface PolicyItem {
  code: string;
  name: string;
  description: string;
  severity: string;
  default_enabled: boolean;
  parameters: Record<string, any>;
}

export interface SimulationResult {
  scenario: {
    domain: string;
    data_sensitivity: string;
    model_policy: string;
    active_policies_count: number;
  };
  evaluation: {
    compliant: boolean;
    violations: string[];
    policy_results: Array<{
      code: string;
      name: string;
      status: string;
      reason: string;
    }>;
  };
  projected_metrics: {
    team_size: number;
    roles: string[];
    human_gates_required: string[];
    risk_score_pct: number;
    estimated_token_cost_usd: number;
  };
  diff_summary: {
    p02_privacy_shield: boolean;
    governance_status: string;
  };
}

export async function fetchHealth(): Promise<HealthStatus> {
  const { data } = await apiClient.get<HealthStatus>('/health');
  return data;
}

export async function createProject(title: string, objective: string): Promise<Project> {
  const { data } = await apiClient.post<Project>('/api/projects', {
    title,
    objective,
    classification: 'internal',
    owner_session: 'session_demo',
  });
  return data;
}

export async function getProject(projectId: string): Promise<Project> {
  const { data } = await apiClient.get<Project>(`/api/projects/${projectId}`);
  return data;
}

export interface AttachedFile {
  name: string;
  type: string; // 'image' | 'document' | 'code' | 'schema'
  content: string; // text or base64
  size?: number;
  dataUrl?: string; // for thumbnail preview
}

export async function submitIntake(
  projectId: string,
  rawIdea: string,
  domain?: string,
  attachments: AttachedFile[] = []
): Promise<IdeaContract> {
  const { data } = await apiClient.post<IdeaContract>(`/api/projects/${projectId}/intake`, {
    raw_idea: rawIdea,
    domain,
    attachments,
  });
  return data;
}

export async function getProjectContract(projectId: string): Promise<IdeaContract> {
  const { data } = await apiClient.get<IdeaContract>(`/api/projects/${projectId}/contract`);
  return data;
}

export async function compileOrganization(
  projectId: string,
  mode: string = 'BALANCED',
  modelPolicy: string = 'AUTO'
): Promise<OrganizationPlan> {
  const { data } = await apiClient.post<OrganizationPlan>(`/api/projects/${projectId}/compile-organization`, {
    mode,
    model_policy: modelPolicy,
  });
  return data;
}

export async function submitGateDecision(
  runId: string,
  decision: 'APPROVE' | 'REJECT',
  reason: string = 'Authorized by human operator'
) {
  const { data } = await apiClient.post(`/api/runs/${runId}/gate-decision`, {
    decision,
    reason,
  });
  return data;
}

export async function fetchRunBlueprint(runId: string): Promise<{
  artifact_id: string;
  type: string;
  content: FinalBlueprint;
  confidence: number;
  content_hash: string;
  created_at: string;
}> {
  const { data } = await apiClient.get(`/api/runs/${runId}/blueprint`);
  return data;
}

export async function verifyRun(runId: string): Promise<{
  valid: boolean;
  event_count: number;
  broken_at_index: number | null;
  message: string;
}> {
  const { data } = await apiClient.get(`/api/runs/${runId}/verify`);
  return data;
}

export async function fetchPolicies(): Promise<PolicyItem[]> {
  const { data } = await apiClient.get<PolicyItem[]>('/api/lab/policies');
  return data;
}

export async function simulateCounterfactual(scenario: {
  domain: string;
  data_sensitivity: string;
  model_policy: string;
  active_policies: string[];
}): Promise<SimulationResult> {
  const { data } = await apiClient.post<SimulationResult>('/api/lab/simulate', scenario);
  return data;
}

export async function tamperRunEvent(
  runId: string,
  targetSequence: number = 1,
  corruptHash: string = 'bad0000000000000000000000000000000000000000000000000000000000000'
) {
  const { data } = await apiClient.post('/api/lab/tamper', {
    run_id: runId,
    target_sequence: targetSequence,
    corrupt_hash: corruptHash,
  });
  return data;
}

export interface DirectQueryResponse {
  query: string;
  answer: string;
  model_used: string;
  latency_ms: number;
  tokens_used: number;
  cost_usd: number;
  timestamp: string;
  veritas_checksum: string;
  suggested_action: string;
}

export async function submitDirectQuery(
  query: string,
  modelPolicy: string = 'AUTO',
  context?: string
): Promise<DirectQueryResponse> {
  const { data } = await apiClient.post<DirectQueryResponse>('/api/query/direct', {
    query,
    model_policy: modelPolicy,
    context,
  });
  return data;
}
