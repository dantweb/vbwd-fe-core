import { describe, it, expect, beforeEach } from 'vitest';
import { PluginRegistry } from '@/plugins/PluginRegistry';
import { PlatformSDK } from '@/plugins/PlatformSDK';
import type { IPlugin, IPlatformSDK } from '@/plugins/types';

describe('Plugin Resource Collision', () => {
  let registry: PluginRegistry;
  let sdk: PlatformSDK;

  beforeEach(() => {
    registry = new PluginRegistry();
    sdk = new PlatformSDK();
  });

  // --- Component Name Collision ---

  it('should overwrite component on name collision (last-write-wins)', async () => {
    const loaderA = () => Promise.resolve({ default: { template: '<div>A</div>' } });
    const loaderB = () => Promise.resolve({ default: { template: '<div>B</div>' } });

    const pluginA: IPlugin = {
      name: 'plugin-a',
      version: '1.0.0',
      install(sdk: IPlatformSDK) {
        sdk.addComponent('SharedWidget', loaderA);
      }
    };

    const pluginB: IPlugin = {
      name: 'plugin-b',
      version: '1.0.0',
      install(sdk: IPlatformSDK) {
        sdk.addComponent('SharedWidget', loaderB);
      }
    };

    registry.register(pluginA);
    registry.register(pluginB);
    await registry.install('plugin-a', sdk);
    await registry.install('plugin-b', sdk);

    expect(sdk.getComponents()['SharedWidget']).toBe(loaderB);
  });

  it('should preserve unique components after collision', async () => {
    const pluginA: IPlugin = {
      name: 'plugin-a',
      version: '1.0.0',
      install(sdk: IPlatformSDK) {
        sdk.addComponent('WidgetA', () => Promise.resolve({ default: {} }));
        sdk.addComponent('SharedWidget', () => Promise.resolve({ default: {} }));
      }
    };

    const pluginB: IPlugin = {
      name: 'plugin-b',
      version: '1.0.0',
      install(sdk: IPlatformSDK) {
        sdk.addComponent('WidgetB', () => Promise.resolve({ default: {} }));
        sdk.addComponent('SharedWidget', () => Promise.resolve({ default: {} }));
      }
    };

    registry.register(pluginA);
    registry.register(pluginB);
    await registry.install('plugin-a', sdk);
    await registry.install('plugin-b', sdk);

    const components = sdk.getComponents();
    expect(Object.keys(components)).toHaveLength(3);
    expect(components).toHaveProperty('WidgetA');
    expect(components).toHaveProperty('WidgetB');
    expect(components).toHaveProperty('SharedWidget');
  });

  // --- Route Path Collision ---

  it('should append both routes on path collision', async () => {
    const pluginA: IPlugin = {
      name: 'plugin-a',
      version: '1.0.0',
      install(sdk: IPlatformSDK) {
        sdk.addRoute({
          path: '/dashboard',
          name: 'DashA',
          component: () => Promise.resolve({ default: {} })
        });
      }
    };

    const pluginB: IPlugin = {
      name: 'plugin-b',
      version: '1.0.0',
      install(sdk: IPlatformSDK) {
        sdk.addRoute({
          path: '/dashboard',
          name: 'DashB',
          component: () => Promise.resolve({ default: {} })
        });
      }
    };

    registry.register(pluginA);
    registry.register(pluginB);
    await registry.install('plugin-a', sdk);
    await registry.install('plugin-b', sdk);

    const routes = sdk.getRoutes();
    expect(routes).toHaveLength(2);
    expect(routes[0].name).toBe('DashA');
    expect(routes[1].name).toBe('DashB');
  });

  it('should append both routes on name collision', async () => {
    const pluginA: IPlugin = {
      name: 'plugin-a',
      version: '1.0.0',
      install(sdk: IPlatformSDK) {
        sdk.addRoute({
          path: '/page-a',
          name: 'SharedPage',
          component: () => Promise.resolve({ default: {} })
        });
      }
    };

    const pluginB: IPlugin = {
      name: 'plugin-b',
      version: '1.0.0',
      install(sdk: IPlatformSDK) {
        sdk.addRoute({
          path: '/page-b',
          name: 'SharedPage',
          component: () => Promise.resolve({ default: {} })
        });
      }
    };

    registry.register(pluginA);
    registry.register(pluginB);
    await registry.install('plugin-a', sdk);
    await registry.install('plugin-b', sdk);

    const routes = sdk.getRoutes();
    expect(routes).toHaveLength(2);
    expect(routes[0].path).toBe('/page-a');
    expect(routes[1].path).toBe('/page-b');
  });

  // --- Store ID Collision ---

  it('should overwrite store on ID collision (last-write-wins)', async () => {
    const pluginA: IPlugin = {
      name: 'plugin-a',
      version: '1.0.0',
      install(sdk: IPlatformSDK) {
        sdk.createStore('sharedStore', {
          state: () => ({ value: 'A' })
        });
      }
    };

    const pluginB: IPlugin = {
      name: 'plugin-b',
      version: '1.0.0',
      install(sdk: IPlatformSDK) {
        sdk.createStore('sharedStore', {
          state: () => ({ value: 'B' })
        });
      }
    };

    registry.register(pluginA);
    registry.register(pluginB);
    await registry.install('plugin-a', sdk);
    await registry.install('plugin-b', sdk);

    const stores = sdk.getStores();
    expect(stores['sharedStore'].state!().value).toBe('B');
  });

  it('should preserve unique stores after collision', async () => {
    const pluginA: IPlugin = {
      name: 'plugin-a',
      version: '1.0.0',
      install(sdk: IPlatformSDK) {
        sdk.createStore('storeA', { state: () => ({ v: 1 }) });
        sdk.createStore('sharedStore', { state: () => ({ v: 'a' }) });
      }
    };

    const pluginB: IPlugin = {
      name: 'plugin-b',
      version: '1.0.0',
      install(sdk: IPlatformSDK) {
        sdk.createStore('storeB', { state: () => ({ v: 2 }) });
        sdk.createStore('sharedStore', { state: () => ({ v: 'b' }) });
      }
    };

    registry.register(pluginA);
    registry.register(pluginB);
    await registry.install('plugin-a', sdk);
    await registry.install('plugin-b', sdk);

    const stores = sdk.getStores();
    expect(Object.keys(stores)).toHaveLength(3);
    expect(stores).toHaveProperty('storeA');
    expect(stores).toHaveProperty('storeB');
    expect(stores).toHaveProperty('sharedStore');
  });

  // --- No Collision (Baseline) ---

  it('should preserve all resources when names are unique', async () => {
    const pluginA: IPlugin = {
      name: 'plugin-a',
      version: '1.0.0',
      install(sdk: IPlatformSDK) {
        sdk.addComponent('WidgetA', () => Promise.resolve({ default: {} }));
        sdk.addRoute({ path: '/page-a', name: 'PageA', component: () => Promise.resolve({ default: {} }) });
        sdk.createStore('storeA', { state: () => ({ v: 'a' }) });
      }
    };

    const pluginB: IPlugin = {
      name: 'plugin-b',
      version: '1.0.0',
      install(sdk: IPlatformSDK) {
        sdk.addComponent('WidgetB', () => Promise.resolve({ default: {} }));
        sdk.addRoute({ path: '/page-b', name: 'PageB', component: () => Promise.resolve({ default: {} }) });
        sdk.createStore('storeB', { state: () => ({ v: 'b' }) });
      }
    };

    registry.register(pluginA);
    registry.register(pluginB);
    await registry.install('plugin-a', sdk);
    await registry.install('plugin-b', sdk);

    expect(Object.keys(sdk.getComponents())).toHaveLength(2);
    expect(sdk.getRoutes()).toHaveLength(2);
    expect(Object.keys(sdk.getStores())).toHaveLength(2);
  });

  // --- Cross-Plugin Visibility ---

  it('should share SDK state across plugins during install', async () => {
    let storesVisibleToB: Record<string, unknown> = {};

    const pluginA: IPlugin = {
      name: 'plugin-a',
      version: '1.0.0',
      install(sdk: IPlatformSDK) {
        sdk.createStore('storeA', { state: () => ({ v: 'a' }) });
      }
    };

    const pluginB: IPlugin = {
      name: 'plugin-b',
      version: '1.0.0',
      install(sdk: IPlatformSDK) {
        storesVisibleToB = sdk.getStores();
      }
    };

    registry.register(pluginA);
    registry.register(pluginB);
    await registry.install('plugin-a', sdk);
    await registry.install('plugin-b', sdk);

    // SDK is a shared namespace — B can see A's store
    expect(storesVisibleToB).toHaveProperty('storeA');
  });
});
