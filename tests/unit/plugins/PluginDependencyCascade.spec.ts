import { describe, it, expect, beforeEach } from 'vitest';
import { PluginRegistry } from '@/plugins/PluginRegistry';
import { PlatformSDK } from '@/plugins/PlatformSDK';
import { PluginStatus } from '@/plugins/types';
import type { IPlugin } from '@/plugins/types';

describe('Plugin Dependency Cascade', () => {
  let registry: PluginRegistry;
  let sdk: PlatformSDK;

  beforeEach(() => {
    registry = new PluginRegistry();
    sdk = new PlatformSDK();
  });

  // --- Activate with Inactive Dependencies ---

  it('should allow activate when dependency is installed but not active', async () => {
    const pluginB: IPlugin = {
      name: 'plugin-b',
      version: '1.0.0',
      install() {}
    };

    const pluginA: IPlugin = {
      name: 'plugin-a',
      version: '1.0.0',
      dependencies: ['plugin-b'],
      install() {}
    };

    registry.register(pluginA);
    registry.register(pluginB);
    await registry.installAll(sdk);

    // B is INSTALLED but not ACTIVE — current behavior: activate doesn't check dep activation
    await registry.activate('plugin-a');
    expect(registry.get('plugin-a')!.status).toBe(PluginStatus.ACTIVE);
  });

  it('should activate successfully when dependency is active', async () => {
    const pluginB: IPlugin = {
      name: 'plugin-b',
      version: '1.0.0',
      install() {},
      activate() {}
    };

    const pluginA: IPlugin = {
      name: 'plugin-a',
      version: '1.0.0',
      dependencies: ['plugin-b'],
      install() {},
      activate() {}
    };

    registry.register(pluginA);
    registry.register(pluginB);
    await registry.installAll(sdk);

    await registry.activate('plugin-b');
    await registry.activate('plugin-a');

    expect(registry.get('plugin-b')!.status).toBe(PluginStatus.ACTIVE);
    expect(registry.get('plugin-a')!.status).toBe(PluginStatus.ACTIVE);
  });

  it('should install in dependency order via installAll', async () => {
    const installed: string[] = [];

    const pluginC: IPlugin = {
      name: 'plugin-c',
      version: '1.0.0',
      install() { installed.push('c'); }
    };

    const pluginB: IPlugin = {
      name: 'plugin-b',
      version: '1.0.0',
      dependencies: ['plugin-c'],
      install() { installed.push('b'); }
    };

    const pluginA: IPlugin = {
      name: 'plugin-a',
      version: '1.0.0',
      dependencies: ['plugin-b'],
      install() { installed.push('a'); }
    };

    // Register in reverse order
    registry.register(pluginA);
    registry.register(pluginB);
    registry.register(pluginC);

    await registry.installAll(sdk);

    expect(installed).toEqual(['c', 'b', 'a']);
  });

  // --- Deactivate with Active Dependents ---

  it('should block deactivate when an active dependent exists', async () => {
    const pluginB: IPlugin = {
      name: 'plugin-b',
      version: '1.0.0',
      install() {},
      activate() {},
      deactivate() {}
    };

    const pluginA: IPlugin = {
      name: 'plugin-a',
      version: '1.0.0',
      dependencies: ['plugin-b'],
      install() {},
      activate() {},
      deactivate() {}
    };

    registry.register(pluginA);
    registry.register(pluginB);
    await registry.installAll(sdk);
    await registry.activate('plugin-b');
    await registry.activate('plugin-a');

    // Deactivating B while A (which depends on B) is ACTIVE should fail
    await expect(registry.deactivate('plugin-b')).rejects.toThrow(
      'Cannot deactivate "plugin-b": active dependents: plugin-a'
    );
    expect(registry.get('plugin-b')!.status).toBe(PluginStatus.ACTIVE);
  });

  it('should allow deactivate when no dependents are active', async () => {
    const pluginA: IPlugin = {
      name: 'plugin-a',
      version: '1.0.0',
      install() {},
      activate() {},
      deactivate() {}
    };

    const pluginB: IPlugin = {
      name: 'plugin-b',
      version: '1.0.0',
      install() {},
      activate() {},
      deactivate() {}
    };

    registry.register(pluginA);
    registry.register(pluginB);
    await registry.installAll(sdk);
    await registry.activate('plugin-a');
    await registry.activate('plugin-b');

    // No dependencies between A and B — deactivate should work
    await registry.deactivate('plugin-a');
    expect(registry.get('plugin-a')!.status).toBe(PluginStatus.INACTIVE);
    expect(registry.get('plugin-b')!.status).toBe(PluginStatus.ACTIVE);
  });

  // --- Uninstall with Dependencies ---

  it('should allow uninstall when dependent is inactive', async () => {
    const pluginB: IPlugin = {
      name: 'plugin-b',
      version: '1.0.0',
      install() {},
      activate() {},
      deactivate() {},
      uninstall() {}
    };

    const pluginA: IPlugin = {
      name: 'plugin-a',
      version: '1.0.0',
      dependencies: ['plugin-b'],
      install() {},
      activate() {},
      deactivate() {},
      uninstall() {}
    };

    registry.register(pluginA);
    registry.register(pluginB);
    await registry.installAll(sdk);
    // Both inactive (just installed, never activated) — uninstall B should work
    await registry.uninstall('plugin-b');
    expect(registry.get('plugin-b')!.status).toBe(PluginStatus.REGISTERED);
  });

  // --- Complex Dependency Trees ---

  it('should handle diamond dependency in install order', async () => {
    const installed: string[] = [];

    const pluginD: IPlugin = {
      name: 'plugin-d',
      version: '1.0.0',
      install() { installed.push('d'); }
    };

    const pluginB: IPlugin = {
      name: 'plugin-b',
      version: '1.0.0',
      dependencies: ['plugin-d'],
      install() { installed.push('b'); }
    };

    const pluginC: IPlugin = {
      name: 'plugin-c',
      version: '1.0.0',
      dependencies: ['plugin-d'],
      install() { installed.push('c'); }
    };

    const pluginA: IPlugin = {
      name: 'plugin-a',
      version: '1.0.0',
      dependencies: ['plugin-b', 'plugin-c'],
      install() { installed.push('a'); }
    };

    registry.register(pluginA);
    registry.register(pluginB);
    registry.register(pluginC);
    registry.register(pluginD);

    await registry.installAll(sdk);

    // D must be first, A must be last
    expect(installed[0]).toBe('d');
    expect(installed[installed.length - 1]).toBe('a');
    // D appears exactly once (not duplicated for B and C)
    expect(installed.filter(x => x === 'd')).toHaveLength(1);
  });

  it('should activate chain bottom-up and deactivate top-down', async () => {
    const pluginC: IPlugin = {
      name: 'plugin-c',
      version: '1.0.0',
      install() {},
      activate() {},
      deactivate() {}
    };

    const pluginB: IPlugin = {
      name: 'plugin-b',
      version: '1.0.0',
      dependencies: ['plugin-c'],
      install() {},
      activate() {},
      deactivate() {}
    };

    const pluginA: IPlugin = {
      name: 'plugin-a',
      version: '1.0.0',
      dependencies: ['plugin-b'],
      install() {},
      activate() {},
      deactivate() {}
    };

    registry.register(pluginA);
    registry.register(pluginB);
    registry.register(pluginC);
    await registry.installAll(sdk);

    // Activate bottom-up: C → B → A
    await registry.activate('plugin-c');
    await registry.activate('plugin-b');
    await registry.activate('plugin-a');

    expect(registry.get('plugin-a')!.status).toBe(PluginStatus.ACTIVE);
    expect(registry.get('plugin-b')!.status).toBe(PluginStatus.ACTIVE);
    expect(registry.get('plugin-c')!.status).toBe(PluginStatus.ACTIVE);

    // Deactivate top-down: A → B → C
    await registry.deactivate('plugin-a');
    await registry.deactivate('plugin-b');
    await registry.deactivate('plugin-c');

    expect(registry.get('plugin-a')!.status).toBe(PluginStatus.INACTIVE);
    expect(registry.get('plugin-b')!.status).toBe(PluginStatus.INACTIVE);
    expect(registry.get('plugin-c')!.status).toBe(PluginStatus.INACTIVE);
  });

  it('should detect self-dependency as circular', async () => {
    const plugin: IPlugin = {
      name: 'self-dep',
      version: '1.0.0',
      dependencies: ['self-dep']
    };

    registry.register(plugin);
    await expect(registry.installAll(sdk)).rejects.toThrow('Circular dependency detected');
  });
});
