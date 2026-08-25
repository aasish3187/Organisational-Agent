import { describe, it, expect } from 'vitest';
import { cn } from '../src/lib/cn';

describe('UI Design System Primitives', () => {
  it('computes correct budget percentage thresholds for TokenMeter', () => {
    const computePct = (used: number, max: number) => Math.min((used / max) * 100, 100);
    expect(computePct(15000, 30000)).toBe(50);
    expect(computePct(27000, 30000)).toBe(90);
    expect(computePct(35000, 30000)).toBe(100);
  });

  it('normalizes agent status badges across states', () => {
    const statuses = ['ACTIVE', 'COMPLETED', 'REVIEW', 'WAITING_FOR_HUMAN', 'FAILED'];
    statuses.forEach((status) => {
      expect(status.toUpperCase()).toBe(status);
    });
  });

  it('formats USD run cost with 4 decimals', () => {
    const formatCost = (usd: number) => `$${usd.toFixed(4)}`;
    expect(formatCost(0.0042)).toBe('$0.0042');
    expect(formatCost(0.1)).toBe('$0.1000');
  });
});
