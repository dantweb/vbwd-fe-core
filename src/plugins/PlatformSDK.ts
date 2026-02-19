import type {
  IPlatformSDK,
  IApiClient,
  IEventBus,
  IRouteConfig,
  ComponentDefinition,
  IStoreOptions
} from './types';
import { deepMerge } from '../utils/deep-merge';

interface I18nInstance {
  global: {
    mergeLocaleMessage(locale: string, messages: Record<string, unknown>): void;
  };
}

/**
 * Platform SDK Implementation
 * Provides core APIs to plugins during installation
 */
export class PlatformSDK implements IPlatformSDK {
  // Core API instances
  public api: IApiClient = {};
  public events: IEventBus = {};

  // Registered routes
  private routes: IRouteConfig[] = [];

  // Registered components
  private components: Record<string, ComponentDefinition> = {};

  // Registered stores
  private stores: Record<string, IStoreOptions> = {};

  // Collected translations
  private translations: Record<string, Record<string, unknown>> = {};

  // vue-i18n instance (optional — injected at bootstrap)
  private i18n: I18nInstance | null = null;

  constructor(i18n?: I18nInstance) {
    this.i18n = i18n || null;
  }

  /**
   * Register a Vue Router route
   */
  addRoute(route: IRouteConfig): void {
    this.routes.push(route);
  }

  /**
   * Get all registered routes
   */
  getRoutes(): IRouteConfig[] {
    return this.routes;
  }

  /**
   * Register a global Vue component
   */
  addComponent(name: string, component: ComponentDefinition): void {
    this.components[name] = component;
  }

  /**
   * Remove a registered component
   */
  removeComponent(name: string): void {
    delete this.components[name];
  }

  /**
   * Get all registered components
   */
  getComponents(): Record<string, ComponentDefinition> {
    return this.components;
  }

  /**
   * Create a Pinia store
   */
  createStore(id: string, options: IStoreOptions): string {
    this.stores[id] = options;
    return id;
  }

  /**
   * Get all registered stores
   */
  getStores(): Record<string, IStoreOptions> {
    return this.stores;
  }

  /**
   * Merge translations for a locale
   */
  addTranslations(locale: string, messages: Record<string, unknown>): void {
    if (!this.translations[locale]) {
      this.translations[locale] = {};
    }
    this.translations[locale] = deepMerge(this.translations[locale], messages);

    if (this.i18n) {
      this.i18n.global.mergeLocaleMessage(locale, messages);
    }
  }

  /**
   * Get all collected translations
   */
  getTranslations(): Record<string, Record<string, unknown>> {
    return { ...this.translations };
  }
}
