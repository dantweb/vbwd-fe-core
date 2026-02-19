/**
 * Plugin System Types
 * Defines interfaces and types for the VBWD Core SDK plugin architecture
 */

export enum PluginStatus {
  REGISTERED = 'REGISTERED',
  INSTALLED = 'INSTALLED',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ERROR = 'ERROR'
}

/**
 * Core plugin interface
 * All plugins must implement at minimum name and version
 */
export interface IPlugin {
  /** Unique plugin identifier */
  name: string;

  /** Semantic version (e.g., "1.0.0") */
  version: string;

  /** Human-readable description */
  description?: string;

  /** Author name or organization */
  author?: string;

  /** Homepage or documentation URL */
  homepage?: string;

  /** Keywords for discoverability */
  keywords?: string[];

  /**
   * Plugin dependencies
   * Can be array of plugin names or object with version constraints
   * Examples:
   *   ['plugin-a', 'plugin-b']
   *   { 'plugin-a': '^1.0.0', 'plugin-b': '>=2.0.0' }
   */
  dependencies?: string[] | Record<string, string>;

  /**
   * Plugin-bundled translations
   * Key = locale code (e.g. 'en', 'de'), Value = translation messages object
   */
  translations?: Record<string, Record<string, unknown>>;

  /**
   * Install hook - called when plugin is installed
   * Receives PlatformSDK instance for registering routes, components, stores, etc.
   */
  install?(sdk: IPlatformSDK): void | Promise<void>;

  /**
   * Activate hook - called when plugin is activated
   * Use for starting background tasks, event listeners, etc.
   */
  activate?(): void | Promise<void>;

  /**
   * Deactivate hook - called when plugin is deactivated
   * Use for cleanup, stopping background tasks, etc.
   */
  deactivate?(): void | Promise<void>;

  /**
   * Uninstall hook - called when plugin is uninstalled
   * Use for removing registered routes, components, stores, etc.
   */
  uninstall?(): void | Promise<void>;

  /** Internal active state for plugin lifecycle tracking */
  _active?: boolean;
}

/**
 * Plugin metadata with runtime status
 */
export interface IPluginMetadata extends IPlugin {
  /** Current plugin status */
  status: PluginStatus;

  /** Timestamp when plugin was installed */
  installedAt?: Date;

  /** Timestamp when plugin was activated */
  activatedAt?: Date;

  /** Error message if status is ERROR */
  error?: string;
}

/**
 * Plugin Registry interface
 * Manages plugin registration, lifecycle, and dependencies
 */
export interface IPluginRegistry {
  /**
   * Register a plugin
   * @throws Error if plugin name already registered or validation fails
   */
  register(plugin: IPlugin): void;

  /**
   * Get plugin metadata by name
   * @returns Plugin metadata or undefined if not found
   */
  get(name: string): IPluginMetadata | undefined;

  /**
   * Get all registered plugins
   */
  getAll(): IPluginMetadata[];

  /**
   * Install a specific plugin
   * @throws Error if plugin not found or installation fails
   */
  install(name: string, sdk: IPlatformSDK): Promise<void>;

  /**
   * Install all registered plugins in dependency order
   * @throws Error if circular dependencies or missing dependencies
   */
  installAll(sdk: IPlatformSDK): Promise<void>;

  /**
   * Activate a plugin
   * @throws Error if plugin not installed or activation fails
   */
  activate(name: string): Promise<void>;

  /**
   * Deactivate a plugin
   * @throws Error if plugin not found or deactivation fails
   */
  deactivate(name: string): Promise<void>;

  /**
   * Uninstall a plugin
   * @throws Error if plugin not found or uninstall fails
   */
  uninstall(name: string): Promise<void>;
}

// Placeholder types for Sprint 2+ features
// These will be properly typed in their respective sprints

/** API client interface (Sprint 2) */
export interface IApiClient {
  [key: string]: unknown;
}

/** Event bus interface (Sprint 4) */
export interface IEventBus {
  [key: string]: unknown;
}

/** Vue Router route configuration (Sprint 5) */
export interface IRouteConfig {
  path: string;
  name: string;
  component: () => Promise<{ default: unknown }>;
  meta?: Record<string, unknown>;
  [key: string]: unknown;
}

/** Vue component definition (Sprint 5) */
export type ComponentDefinition = () => Promise<{ default: unknown }>;

/** Pinia store options (Sprint 6) */
export interface IStoreOptions {
  state?: () => Record<string, unknown>;
  getters?: Record<string, unknown>;
  actions?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * Platform SDK interface
 * Provides core APIs to plugins during installation
 */
export interface IPlatformSDK {
  /** API client instance */
  api: IApiClient;

  /** Event bus instance */
  events: IEventBus;

  /**
   * Register a route
   * @param route Vue Router route configuration
   */
  addRoute(route: IRouteConfig): void;

  /**
   * Get all registered routes
   */
  getRoutes(): IRouteConfig[];

  /**
   * Register a global component
   * @param name Component name
   * @param component Component definition or async loader
   */
  addComponent(name: string, component: ComponentDefinition): void;

  /**
   * Remove a registered component
   * @param name Component name
   */
  removeComponent(name: string): void;

  /**
   * Get all registered components
   */
  getComponents(): Record<string, ComponentDefinition>;

  /**
   * Create a Pinia store
   * @param id Store identifier
   * @param options Store options (state, getters, actions)
   * @returns Store ID
   */
  createStore(id: string, options: IStoreOptions): string;

  /**
   * Get all registered stores
   */
  getStores(): Record<string, IStoreOptions>;

  /**
   * Merge translations into the app's i18n instance
   * @param locale Locale code (e.g. 'en', 'de')
   * @param messages Translation messages object
   */
  addTranslations(locale: string, messages: Record<string, unknown>): void;

  /**
   * Get all collected translations
   */
  getTranslations(): Record<string, Record<string, unknown>>;
}
