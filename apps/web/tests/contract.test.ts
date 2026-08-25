import { describe, it, expect } from 'vitest';
import type { IdeaContract, OrganizationPlan } from '../src/lib/api';

describe('Phase 2 Contracts and Types', () => {
  it('validates IdeaContract data structure properties', () => {
    const mockContract: IdeaContract = {
      title: 'EdTech Platform',
      domain: 'edtech',
      target_audience: 'B.Tech Students',
      problem_statement: 'Multilingual prep',
      success_criteria: ['NLP accuracy', 'Student privacy'],
      constraints: ['Latency < 200ms'],
      assumptions: ['Standard engineering syllabus'],
      data_sensitivity: 'student-data',
      confidence: 0.88,
      open_questions: ['Language prioritization?'],
      suggested_specialists: ['research_analyst', 'privacy_risk'],
    };

    expect(mockContract.domain).toBe('edtech');
    expect(mockContract.confidence).toBeGreaterThan(0.8);
    expect(mockContract.suggested_specialists).toContain('privacy_risk');
  });

  it('validates OrganizationPlan tasks and budget structure', () => {
    const mockPlan: OrganizationPlan = {
      run_id: 'run_123',
      project_id: 'prj_123',
      mode: 'BALANCED',
      goal: 'Compile platform',
      selection_rationale: [
        { role: 'research_analyst', reason: 'Evidence retrieval' },
        { role: 'privacy_risk', reason: 'Policy P-02', source: 'mnemos_atom:atom_1' },
      ],
      budget: { max_tokens: 30000, max_cost_usd: 2.0, max_minutes: 10 },
      tasks: [
        {
          task_id: 'tsk_research',
          role: 'research_analyst',
          depends_on: [],
          allowed_tools: ['web_search'],
          input_artifacts: ['IdeaContract'],
          output_schema: 'EvidenceBrief',
          review_required: true,
          token_budget: 5000,
          risk_level: 'low',
        },
      ],
      human_gates: ['sensitive-data-retention'],
      retrieved_atoms: [],
    };

    expect(mockPlan.tasks.length).toBe(1);
    expect(mockPlan.human_gates).toContain('sensitive-data-retention');
  });
});
