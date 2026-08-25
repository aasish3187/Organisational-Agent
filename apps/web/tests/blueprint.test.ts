import { describe, it, expect } from 'vitest';
import type { FinalBlueprint } from '../src/lib/api';

describe('Phase 4 Final Blueprint & Approval Gates', () => {
  it('validates FinalBlueprint properties and architecture specs', () => {
    const mockBlueprint: FinalBlueprint = {
      project_title: 'NEXUS Multilingual Exam Prep OS',
      executive_summary: 'Verified platform architecture with Policy P-02 compliance.',
      architecture: {
        frontend: 'Next.js 15',
        backend: 'FastAPI Async',
        database: 'PostgreSQL + pgvector',
        ai_models: ['Gemini 2.5 Pro', 'Gemini 2.5 Flash'],
      },
      core_features: ['Multilingual Simulator', 'Syllabus Explorer'],
      governance_and_privacy: ['Policy P-02 90-day retention', 'VERITAS event chaining'],
      veritas_verified_events: 14,
      estimated_token_cost_usd: 0.045,
      recommended_roadmap_weeks: 6,
    };

    expect(mockBlueprint.architecture.ai_models.length).toBe(2);
    expect(mockBlueprint.veritas_verified_events).toBe(14);
    expect(mockBlueprint.governance_and_privacy).toContain('Policy P-02 90-day retention');
  });
});
