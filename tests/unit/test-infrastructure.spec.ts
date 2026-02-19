import { describe, it, expect } from 'vitest';

describe('Test Infrastructure', () => {
  it('should be running in test environment', () => {
    expect(process.env.NODE_ENV).toBe('test');
  });

  it('should have access to globals', () => {
    expect(describe).toBeDefined();
    expect(it).toBeDefined();
    expect(expect).toBeDefined();
  });

  it('should support async tests', async () => {
    const promise = new Promise(resolve => setTimeout(() => resolve('done'), 10));
    const result = await promise;
    expect(result).toBe('done');
  });
});
