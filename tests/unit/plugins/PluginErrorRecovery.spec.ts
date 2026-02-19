import { describe, it, expect, beforeEach } from 'vitest';
import { PluginRegistry } from '@/plugins/PluginRegistry';
import { PlatformSDK } from '@/plugins/PlatformSDK';
import { PluginStatus } from '@/plugins/types';
import type { IPlugin, IPlatformSDK } from '@/plugins/types';

describe('Plugin Error Recovery', () => {
  let registry: PluginRegistry;
  let sdk: PlatformSDK;

  beforeEach(() => {
    registry = new PluginRegistry();
    sdk = new PlatformSDK();
  });

  // --- Install Failures ---

  it('should keep REGISTERED status when install throws', async () => {
    const plugin: IPlugin = {
      name: 'fail-install',
      version: '1.0.0',
      install() {
        throw new Error('install failed');
      }
    };

    registry.register(plugin);
    await expect(registry.install('fail-install', sdk)).rejects.toThrow('install failed');
    expect(registry.get('fail-install')!.status).toBe(PluginStatus.REGISTERED);
  });

  it('should not affect other plugins when one install fails', async () => {
    const pluginA: IPlugin = {
      name: 'plugin-a',
      version: '1.0.0',
      install(sdk: IPlatformSDK) {
        sdk.addComponent('WidgetA', () => Promise.resolve({ default: {} }));
      }
    };

    const pluginB: IPlugin = {
      name: 'plugin-b',
      version: '1.0.0',
      install() {
        throw new Error('plugin-b install failed');
      }
    };

    registry.register(pluginA);
    registry.register(pluginB);

    await registry.install('plugin-a', sdk);
    await expect(registry.install('plugin-b', sdk)).rejects.toThrow('plugin-b install failed');

    expect(registry.get('plugin-a')!.status).toBe(PluginStatus.INSTALLED);
    expect(registry.get('plugin-b')!.status).toBe(PluginStatus.REGISTERED);
    expect(sdk.getComponents()).toHaveProperty('WidgetA');
  });

  it('should stop installAll on first failure', async () => {
    const installed: string[] = [];

    const pluginA: IPlugin = {
      name: 'plugin-a',
      version: '1.0.0',
      install() { installed.push('a'); }
    };

    const pluginB: IPlugin = {
      name: 'plugin-b',
      version: '1.0.0',
      install() { throw new Error('b failed'); }
    };

    const pluginC: IPlugin = {
      name: 'plugin-c',
      version: '1.0.0',
      install() { installed.push('c'); }
    };

    registry.register(pluginA);
    registry.register(pluginB);
    registry.register(pluginC);

    await expect(registry.installAll(sdk)).rejects.toThrow('b failed');

    // A was processed before B (topological order: a, b, c for no-dep plugins)
    expect(registry.get('plugin-a')!.status).toBe(PluginStatus.INSTALLED);
    expect(registry.get('plugin-b')!.status).toBe(PluginStatus.REGISTERED);
  });

  // --- Activate Failures ---

  it('should keep INSTALLED status when activate throws', async () => {
    const plugin: IPlugin = {
      name: 'fail-activate',
      version: '1.0.0',
      install() {},
      activate() {
        throw new Error('activate failed');
      }
    };

    registry.register(plugin);
    await registry.install('fail-activate', sdk);
    await expect(registry.activate('fail-activate')).rejects.toThrow('activate failed');
    expect(registry.get('fail-activate')!.status).toBe(PluginStatus.INSTALLED);
  });

  it('should allow retry after activate failure', async () => {
    let callCount = 0;

    const plugin: IPlugin = {
      name: 'retry-activate',
      version: '1.0.0',
      install() {},
      activate() {
        callCount++;
        if (callCount === 1) {
          throw new Error('first attempt failed');
        }
      }
    };

    registry.register(plugin);
    await registry.install('retry-activate', sdk);

    await expect(registry.activate('retry-activate')).rejects.toThrow('first attempt failed');
    expect(registry.get('retry-activate')!.status).toBe(PluginStatus.INSTALLED);

    await registry.activate('retry-activate');
    expect(registry.get('retry-activate')!.status).toBe(PluginStatus.ACTIVE);
  });

  // --- Deactivate Failures ---

  it('should keep ACTIVE status when deactivate throws', async () => {
    const plugin: IPlugin = {
      name: 'fail-deactivate',
      version: '1.0.0',
      install() {},
      activate() {},
      deactivate() {
        throw new Error('deactivate failed');
      }
    };

    registry.register(plugin);
    await registry.install('fail-deactivate', sdk);
    await registry.activate('fail-deactivate');
    await expect(registry.deactivate('fail-deactivate')).rejects.toThrow('deactivate failed');
    expect(registry.get('fail-deactivate')!.status).toBe(PluginStatus.ACTIVE);
  });

  // --- Uninstall Failures ---

  it('should keep INACTIVE status when uninstall throws', async () => {
    const plugin: IPlugin = {
      name: 'fail-uninstall',
      version: '1.0.0',
      install() {},
      activate() {},
      deactivate() {},
      uninstall() {
        throw new Error('uninstall failed');
      }
    };

    registry.register(plugin);
    await registry.install('fail-uninstall', sdk);
    await registry.activate('fail-uninstall');
    await registry.deactivate('fail-uninstall');
    await expect(registry.uninstall('fail-uninstall')).rejects.toThrow('uninstall failed');
    expect(registry.get('fail-uninstall')!.status).toBe(PluginStatus.INACTIVE);
  });

  // --- Async Errors ---

  it('should handle async install rejection', async () => {
    const plugin: IPlugin = {
      name: 'async-fail-install',
      version: '1.0.0',
      async install() {
        await Promise.reject(new Error('async install failed'));
      }
    };

    registry.register(plugin);
    await expect(registry.install('async-fail-install', sdk)).rejects.toThrow('async install failed');
    expect(registry.get('async-fail-install')!.status).toBe(PluginStatus.REGISTERED);
  });

  it('should handle async activate rejection', async () => {
    const plugin: IPlugin = {
      name: 'async-fail-activate',
      version: '1.0.0',
      install() {},
      async activate() {
        await Promise.reject(new Error('async activate failed'));
      }
    };

    registry.register(plugin);
    await registry.install('async-fail-activate', sdk);
    await expect(registry.activate('async-fail-activate')).rejects.toThrow('async activate failed');
    expect(registry.get('async-fail-activate')!.status).toBe(PluginStatus.INSTALLED);
  });
});
