import { describe, it, expect } from 'vitest';
import pkg from '../../package.json';

describe('Package Configuration', () => {
  it('should be named @vbwd/view-component', () => {
    expect(pkg.name).toBe('@vbwd/view-component');
  });

  it('should be an ES module', () => {
    expect(pkg.type).toBe('module');
  });

  it('should have main entry points', () => {
    expect(pkg.main).toBe('./dist/index.cjs');
    expect(pkg.module).toBe('./dist/index.mjs');
    expect(pkg.types).toBe('./dist/index.d.ts');
  });

  it('should have exports field configured', () => {
    expect(pkg.exports).toBeDefined();
    expect(pkg.exports['.']).toBeDefined();
    expect(pkg.exports['.'].import).toBe('./dist/index.mjs');
    expect(pkg.exports['.'].require).toBe('./dist/index.cjs');
    expect(pkg.exports['.'].types).toBe('./dist/index.d.ts');
  });

  it('should have required scripts', () => {
    const requiredScripts = [
      'dev',
      'build',
      'test',
      'test:unit',
      'test:integration',
      'test:coverage',
      'type-check',
      'lint',
      'format'
    ];

    for (const script of requiredScripts) {
      expect(pkg.scripts[script]).toBeDefined();
    }
  });

  it('should have Vue 3 as peer dependency', () => {
    expect(pkg.peerDependencies.vue).toBeDefined();
    expect(pkg.peerDependencies.vue).toMatch(/^\^3\./);
  });

  it('should have required dependencies', () => {
    expect(pkg.dependencies.axios).toBeDefined();
    expect(pkg.dependencies.zod).toBeDefined();
  });

  it('should have required devDependencies', () => {
    const required = [
      'typescript',
      'vite',
      'vitest',
      '@vitejs/plugin-vue',
      'eslint',
      'prettier'
    ];

    for (const dep of required) {
      expect(pkg.devDependencies[dep]).toBeDefined();
    }
  });

  it('version should follow semver', () => {
    expect(pkg.version).toMatch(/^\d+\.\d+\.\d+(-[a-z0-9.]+)?$/);
  });
});
