import { describe, it, expect, beforeEach } from 'vitest';
import { PluginRegistry } from '@/plugins/PluginRegistry';
import { PlatformSDK } from '@/plugins/PlatformSDK';
import type { IPlugin } from '@/plugins/types';

describe('Plugin Lifecycle', () => {
  let registry: PluginRegistry;
  let sdk: PlatformSDK;

  beforeEach(() => {
    registry = new PluginRegistry();
    sdk = new PlatformSDK();
  });

  it('should execute lifecycle hooks in correct order', async () => {
    const calls: string[] = [];

    const plugin: IPlugin = {
      name: 'lifecycle-test',
      version: '1.0.0',
      install() {
        calls.push('install');
      },
      activate() {
        calls.push('activate');
      },
      deactivate() {
        calls.push('deactivate');
      },
      uninstall() {
        calls.push('uninstall');
      }
    };

    registry.register(plugin);
    await registry.install('lifecycle-test', sdk);
    await registry.activate('lifecycle-test');
    await registry.deactivate('lifecycle-test');
    await registry.uninstall('lifecycle-test');

    expect(calls).toEqual(['install', 'activate', 'deactivate', 'uninstall']);
  });

  it('should track plugin status through lifecycle', async () => {
    const plugin: IPlugin = {
      name: 'status-test',
      version: '1.0.0',
      install() {},
      activate() {},
      deactivate() {}
    };

    registry.register(plugin);
    expect(registry.get('status-test')?.status).toBe('REGISTERED');

    await registry.install('status-test', sdk);
    expect(registry.get('status-test')?.status).toBe('INSTALLED');

    await registry.activate('status-test');
    expect(registry.get('status-test')?.status).toBe('ACTIVE');

    await registry.deactivate('status-test');
    expect(registry.get('status-test')?.status).toBe('INACTIVE');
  });

  it('should handle async lifecycle hooks', async () => {
    let asyncCompleted = false;

    const plugin: IPlugin = {
      name: 'async-test',
      version: '1.0.0',
      install() {},
      async activate() {
        await new Promise(resolve => setTimeout(resolve, 10));
        asyncCompleted = true;
      }
    };

    registry.register(plugin);
    await registry.install('async-test', sdk);
    await registry.activate('async-test');

    expect(asyncCompleted).toBe(true);
  });

  it('should propagate errors from lifecycle hooks', async () => {
    const plugin: IPlugin = {
      name: 'error-test',
      version: '1.0.0',
      install() {},
      activate() {
        throw new Error('Activation failed');
      }
    };

    registry.register(plugin);
    await registry.install('error-test', sdk);

    await expect(registry.activate('error-test')).rejects.toThrow('Activation failed');
  });

  it('should not activate plugin without installing first', async () => {
    const plugin: IPlugin = {
      name: 'test',
      version: '1.0.0',
      activate() {}
    };

    registry.register(plugin);

    await expect(registry.activate('test')).rejects.toThrow(
      'Plugin must be installed before activation'
    );
  });

  it('should allow multiple activate/deactivate cycles', async () => {
    const calls: string[] = [];

    const plugin: IPlugin = {
      name: 'cycle-test',
      version: '1.0.0',
      install() {},
      activate() {
        calls.push('activate');
      },
      deactivate() {
        calls.push('deactivate');
      }
    };

    registry.register(plugin);
    await registry.install('cycle-test', sdk);

    await registry.activate('cycle-test');
    await registry.deactivate('cycle-test');
    await registry.activate('cycle-test');
    await registry.deactivate('cycle-test');

    expect(calls).toEqual(['activate', 'deactivate', 'activate', 'deactivate']);
  });
});
