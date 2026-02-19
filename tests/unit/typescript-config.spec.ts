import { describe, it, expect } from 'vitest';
import tsconfig from '../../tsconfig.json';

describe('TypeScript Configuration', () => {
  it('should have strict mode enabled', () => {
    expect(tsconfig.compilerOptions.strict).toBe(true);
  });

  it('should have noImplicitAny enabled', () => {
    expect(tsconfig.compilerOptions.noImplicitAny).toBe(true);
  });

  it('should have strictNullChecks enabled', () => {
    expect(tsconfig.compilerOptions.strictNullChecks).toBe(true);
  });

  it('should have strictFunctionTypes enabled', () => {
    expect(tsconfig.compilerOptions.strictFunctionTypes).toBe(true);
  });

  it('should have noUnusedLocals enabled', () => {
    expect(tsconfig.compilerOptions.noUnusedLocals).toBe(true);
  });

  it('should have noUnusedParameters enabled', () => {
    expect(tsconfig.compilerOptions.noUnusedParameters).toBe(true);
  });

  it('should target ES2022 or higher', () => {
    const target = tsconfig.compilerOptions.target.toLowerCase();
    expect(['es2022', 'es2023', 'esnext']).toContain(target);
  });

  it('should use ESNext modules', () => {
    expect(tsconfig.compilerOptions.module).toBe('ESNext');
  });

  it('should generate declarations', () => {
    expect(tsconfig.compilerOptions.declaration).toBe(true);
    expect(tsconfig.compilerOptions.declarationMap).toBe(true);
  });

  it('should have path aliases configured', () => {
    expect(tsconfig.compilerOptions.paths).toBeDefined();
    expect(tsconfig.compilerOptions.paths['@/*']).toEqual(['./src/*']);
  });
});
