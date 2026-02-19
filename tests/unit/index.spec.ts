import { describe, it, expect } from 'vitest';
import { version, name } from '../../src/index';

describe('Core SDK Entry Point', () => {
  it('should export version', () => {
    expect(version).toBeDefined();
    expect(typeof version).toBe('string');
    expect(version).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('should export name', () => {
    expect(name).toBeDefined();
    expect(name).toBe('@vbwd/view-component');
  });
});
