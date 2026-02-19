import { describe, it, expect, beforeEach } from 'vitest';
import { PluginRegistry } from '@/plugins/PluginRegistry';
import type { IPlugin } from '@/plugins/types';

describe('PluginRegistry', () => {
  let registry: PluginRegistry;

  beforeEach(() => {
    registry = new PluginRegistry();
  });

  it('should register a simple plugin', () => {
    const plugin: IPlugin = {
      name: 'test-plugin',
      version: '1.0.0',
      description: 'A test plugin'
    };

    registry.register(plugin);
    const retrieved = registry.get('test-plugin');

    expect(retrieved).toBeDefined();
    expect(retrieved?.name).toBe('test-plugin');
    expect(retrieved?.version).toBe('1.0.0');
    expect(retrieved?.status).toBe('REGISTERED');
  });

  it('should prevent duplicate plugin names', () => {
    const plugin1: IPlugin = { name: 'duplicate', version: '1.0.0' };
    const plugin2: IPlugin = { name: 'duplicate', version: '2.0.0' };

    registry.register(plugin1);

    expect(() => registry.register(plugin2)).toThrow(
      'Plugin "duplicate" is already registered'
    );
  });

  it('should validate required plugin fields', () => {
    expect(() => registry.register({} as IPlugin)).toThrow('Plugin name is required');

    expect(() => registry.register({ name: 'test' } as IPlugin)).toThrow(
      'Plugin version is required'
    );
  });

  it('should validate semver version format', () => {
    const invalidPlugin: IPlugin = { name: 'test', version: 'invalid' };

    expect(() => registry.register(invalidPlugin)).toThrow('Invalid version format');
  });

  it('should store plugin metadata', () => {
    const plugin: IPlugin = {
      name: 'rich-plugin',
      version: '1.0.0',
      description: 'A plugin with metadata',
      author: 'VBWD Team',
      homepage: 'https://example.com',
      keywords: ['test', 'example']
    };

    registry.register(plugin);
    const retrieved = registry.get('rich-plugin');

    expect(retrieved?.description).toBe('A plugin with metadata');
    expect(retrieved?.author).toBe('VBWD Team');
    expect(retrieved?.keywords).toEqual(['test', 'example']);
  });

  it('should return all registered plugins', () => {
    registry.register({ name: 'plugin-a', version: '1.0.0' });
    registry.register({ name: 'plugin-b', version: '2.0.0' });

    const all = registry.getAll();

    expect(all).toHaveLength(2);
    expect(all.map(p => p.name)).toContain('plugin-a');
    expect(all.map(p => p.name)).toContain('plugin-b');
  });

  it('should return undefined for non-existent plugin', () => {
    const result = registry.get('non-existent');
    expect(result).toBeUndefined();
  });
});
