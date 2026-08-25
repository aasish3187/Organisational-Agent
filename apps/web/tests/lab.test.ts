import { describe, it, expect } from 'vitest';
import type { PolicyItem, SimulationResult } from '../src/lib/api';

describe('Phase 5a Counterfactual Lab & Policy Matrix', () => {
  it('validates PolicyItem structure', () => {
    const p: PolicyItem = {
      code: 'P-02',
      name: 'Privacy Protection & Retention Rule',
      description: 'Personal data requires Privacy role and approval gate.',
      severity: 'CRITICAL',
      default_enabled: true,
      parameters: { max_retention_days: 90 },
    };

    expect(p.code).toBe('P-02');
    expect(p.severity).toBe('CRITICAL');
  });

  it('validates SimulationResult diff metrics', () => {
    const sim: SimulationResult = {
      scenario: {
        domain: 'edtech',
        data_sensitivity: 'student-data',
        model_policy: 'AUTO',
        active_policies_count: 9,
      },
      evaluation: {
        compliant: true,
        violations: [],
        policy_results: [],
      },
      projected_metrics: {
        team_size: 5,
        roles: ['research_analyst', 'product_strategist', 'privacy_risk'],
        human_gates_required: ['sensitive-data-retention'],
        risk_score_pct: 15,
        estimated_token_cost_usd: 0.045,
      },
      diff_summary: {
        p02_privacy_shield: true,
        governance_status: 'GOVERNED',
      },
    };

    expect(sim.evaluation.compliant).toBe(true);
    expect(sim.diff_summary.p02_privacy_shield).toBe(true);
    expect(sim.projected_metrics.risk_score_pct).toBe(15);
  });
});
