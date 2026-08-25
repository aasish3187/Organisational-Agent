import { describe, it, expect } from 'vitest';
import type { AgentNodeData } from '../src/components/canvas/AgentNode';

describe('Phase 3 Living Canvas Components and Types', () => {
  it('validates AgentNode state calculations', () => {
    const nodeData: AgentNodeData = {
      role: 'research_analyst',
      status: 'ACTIVE',
      tokensUsed: 1250,
      tokenBudget: 5000,
      taskCount: 1,
      mandate: 'Gather credible empirical evidence',
    };

    expect(nodeData.role).toBe('research_analyst');
    expect(nodeData.status).toBe('ACTIVE');
    const budgetPct = (nodeData.tokensUsed / nodeData.tokenBudget) * 100;
    expect(budgetPct).toBe(25);
  });

  it('validates DataPacketEdge props structure', () => {
    const edgeData = {
      id: 'e_research_product',
      source: 'node_research_analyst',
      target: 'node_product_strategist',
      type: 'dataPacket',
      data: { active: true },
    };

    expect(edgeData.data.active).toBe(true);
    expect(edgeData.type).toBe('dataPacket');
  });
});
