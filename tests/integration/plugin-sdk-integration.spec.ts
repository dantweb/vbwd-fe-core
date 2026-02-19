import { describe, it, expect, beforeEach } from 'vitest';
import { PluginRegistry } from '@/plugins/PluginRegistry';
import { PlatformSDK } from '@/plugins/PlatformSDK';
import type { IPlugin, IPlatformSDK } from '@/plugins/types';

describe('Plugin + PlatformSDK Integration', () => {
  let registry: PluginRegistry;
  let sdk: PlatformSDK;

  beforeEach(() => {
    registry = new PluginRegistry();
    sdk = new PlatformSDK();
  });

  it('should provide API client to plugins', async () => {
    let receivedApi: unknown = null;

    const plugin: IPlugin = {
      name: 'api-test',
      version: '1.0.0',
      install(sdk: IPlatformSDK) {
        receivedApi = sdk.api;
      }
    };

    registry.register(plugin);
    await registry.install('api-test', sdk);

    expect(receivedApi).toBeDefined();
    expect(receivedApi).toBe(sdk.api);
  });

  it('should allow plugins to register routes', async () => {
    const plugin: IPlugin = {
      name: 'route-test',
      version: '1.0.0',
      install(sdk: IPlatformSDK) {
        sdk.addRoute({
          path: '/plugin-page',
          name: 'PluginPage',
          component: () => Promise.resolve({ default: {} })
        });
      }
    };

    registry.register(plugin);
    await registry.install('route-test', sdk);

    const routes = sdk.getRoutes();
    expect(routes).toHaveLength(1);
    expect(routes[0].path).toBe('/plugin-page');
    expect(routes[0].name).toBe('PluginPage');
  });

  it('should allow plugins to register components', async () => {
    const plugin: IPlugin = {
      name: 'component-test',
      version: '1.0.0',
      install(sdk: IPlatformSDK) {
        sdk.addComponent('MyComponent', () => Promise.resolve({ default: {} }));
      }
    };

    registry.register(plugin);
    await registry.install('component-test', sdk);

    const components = sdk.getComponents();
    expect(components).toHaveProperty('MyComponent');
    expect(typeof components.MyComponent).toBe('function');
  });

  it('should provide event bus to plugins', async () => {
    let receivedEvents: unknown = null;

    const plugin: IPlugin = {
      name: 'event-test',
      version: '1.0.0',
      install(sdk: IPlatformSDK) {
        receivedEvents = sdk.events;
      }
    };

    registry.register(plugin);
    await registry.install('event-test', sdk);

    expect(receivedEvents).toBeDefined();
    expect(receivedEvents).toBe(sdk.events);
  });

  it('should allow plugins to create stores', async () => {
    const plugin: IPlugin = {
      name: 'store-test',
      version: '1.0.0',
      install(sdk: IPlatformSDK) {
        sdk.createStore('pluginStore', {
          state: () => ({ count: 0 }),
          actions: {
            increment() {
              this.count++;
            }
          }
        });
      }
    };

    registry.register(plugin);
    await registry.install('store-test', sdk);

    const stores = sdk.getStores();
    expect(stores).toHaveProperty('pluginStore');
  });

  it('should isolate plugin stores', async () => {
    const plugin1: IPlugin = {
      name: 'plugin-1',
      version: '1.0.0',
      install(sdk: IPlatformSDK) {
        sdk.createStore('store1', {
          state: () => ({ value: 'plugin1' })
        });
      }
    };

    const plugin2: IPlugin = {
      name: 'plugin-2',
      version: '1.0.0',
      install(sdk: IPlatformSDK) {
        sdk.createStore('store2', {
          state: () => ({ value: 'plugin2' })
        });
      }
    };

    registry.register(plugin1);
    registry.register(plugin2);

    await registry.install('plugin-1', sdk);
    await registry.install('plugin-2', sdk);

    const stores = sdk.getStores();
    expect(stores.store1).not.toBe(stores.store2);
  });
});
