import { describe, it, expect, beforeEach } from 'vitest';
import { PluginRegistry } from '@/plugins/PluginRegistry';
import { PlatformSDK } from '@/plugins/PlatformSDK';
import type { IPlugin } from '@/plugins/types';

describe('Plugin Dependencies', () => {
  let registry: PluginRegistry;
  let sdk: PlatformSDK;

  beforeEach(() => {
    registry = new PluginRegistry();
    sdk = new PlatformSDK();
  });

  it('should load plugins in dependency order', async () => {
    const installed: string[] = [];

    const pluginA: IPlugin = {
      name: 'plugin-a',
      version: '1.0.0',
      dependencies: ['plugin-b', 'plugin-c'],
      install() {
        installed.push('a');
      }
    };

    const pluginB: IPlugin = {
      name: 'plugin-b',
      version: '1.0.0',
      dependencies: ['plugin-c'],
      install() {
        installed.push('b');
      }
    };

    const pluginC: IPlugin = {
      name: 'plugin-c',
      version: '1.0.0',
      install() {
        installed.push('c');
      }
    };

    registry.register(pluginA);
    registry.register(pluginB);
    registry.register(pluginC);

    await registry.installAll(sdk);

    // C first (no deps), then B (depends on C), then A (depends on B and C)
    expect(installed).toEqual(['c', 'b', 'a']);
  });

  it('should detect circular dependencies', async () => {
    const pluginA: IPlugin = {
      name: 'plugin-a',
      version: '1.0.0',
      dependencies: ['plugin-b']
    };

    const pluginB: IPlugin = {
      name: 'plugin-b',
      version: '1.0.0',
      dependencies: ['plugin-c']
    };

    const pluginC: IPlugin = {
      name: 'plugin-c',
      version: '1.0.0',
      dependencies: ['plugin-a'] // Circular!
    };

    registry.register(pluginA);
    registry.register(pluginB);
    registry.register(pluginC);

    await expect(registry.installAll(sdk)).rejects.toThrow('Circular dependency detected');
  });

  it('should fail if dependency is missing', async () => {
    const plugin: IPlugin = {
      name: 'plugin-a',
      version: '1.0.0',
      dependencies: ['missing-plugin']
    };

    registry.register(plugin);

    await expect(registry.installAll(sdk)).rejects.toThrow(
      'Dependency "missing-plugin" not found'
    );
  });

  it('should support version constraints', async () => {
    const pluginA: IPlugin = {
      name: 'plugin-a',
      version: '1.0.0',
      dependencies: { 'plugin-b': '^2.0.0' }
    };

    const pluginB: IPlugin = {
      name: 'plugin-b',
      version: '2.5.0'
    };

    registry.register(pluginA);
    registry.register(pluginB);

    await expect(registry.installAll(sdk)).resolves.not.toThrow();
  });

  it('should fail if version constraint not met', async () => {
    const pluginA: IPlugin = {
      name: 'plugin-a',
      version: '1.0.0',
      dependencies: { 'plugin-b': '^2.0.0' }
    };

    const pluginB: IPlugin = {
      name: 'plugin-b',
      version: '1.5.0' // Does not satisfy ^2.0.0
    };

    registry.register(pluginA);
    registry.register(pluginB);

    await expect(registry.installAll(sdk)).rejects.toThrow(
      'Plugin "plugin-b" version 1.5.0 does not satisfy ^2.0.0'
    );
  });
});
