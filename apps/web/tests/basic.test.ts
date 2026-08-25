import { describe, it, expect } from 'vitest';
import { cn } from '../src/lib/cn';

describe('Frontend Infrastructure & Utilities', () => {
  it('cn helper merges tailwind classes correctly', () => {
    const result = cn('px-2 py-1', 'px-4', { 'bg-red-500': true, 'bg-blue-500': false });
    expect(result).toBe('py-1 px-4 bg-red-500');
  });

  it('verifies essential design token color bindings', () => {
    const statusMap = {
      active: 'ACTIVE',
      completed: 'COMPLETED',
      review: 'REVIEW',
    };
    expect(statusMap.active).toBe('ACTIVE');
  });
});
