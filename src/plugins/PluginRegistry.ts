import type {
  IPlugin,
  IPluginMetadata,
  IPluginRegistry,
  IPlatformSDK
} from './types';
import { PluginStatus } from './types';
import { isValidSemver, satisfiesVersion } from './utils/semver';

/**
 * Plugin Registry Implementation
 * Manages plugin registration, lifecycle, and dependency resolution
 */
export class PluginRegistry implements IPluginRegistry {
  private plugins: Map<string, IPluginMetadata> = new Map();

  /**
   * Register a plugin
   * @throws Error if validation fails or plugin already registered
   */
  register(plugin: IPlugin): void {
    // Validate required fields
    if (!plugin.name) {
      throw new Error('Plugin name is required');
    }

    if (!plugin.version) {
      throw new Error('Plugin version is required');
    }

    // Validate semver format
    if (!isValidSemver(plugin.version)) {
      throw new Error('Invalid version format');
    }

    // Check for duplicates
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin "${plugin.name}" is already registered`);
    }

    // Store plugin with metadata
    const metadata: IPluginMetadata = {
      ...plugin,
      status: PluginStatus.REGISTERED
    };

    this.plugins.set(plugin.name, metadata);
  }

  /**
   * Get plugin by name
   */
  get(name: string): IPluginMetadata | undefined {
    return this.plugins.get(name);
  }

  /**
   * Get all registered plugins
   */
  getAll(): IPluginMetadata[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Install a specific plugin
   */
  async install(name: string, sdk: IPlatformSDK): Promise<void> {
    const plugin = this.plugins.get(name);

    if (!plugin) {
      throw new Error(`Plugin "${name}" not found`);
    }

    // Call install hook if present
    if (plugin.install) {
      await plugin.install(sdk);
    }

    // Update status
    plugin.status = PluginStatus.INSTALLED;
    plugin.installedAt = new Date();
  }

  /**
   * Install all plugins in dependency order
   */
  async installAll(sdk: IPlatformSDK): Promise<void> {
    const order = this.resolveDependencyOrder();

    for (const name of order) {
      await this.install(name, sdk);
    }
  }

  /**
   * Activate a plugin
   */
  async activate(name: string): Promise<void> {
    const plugin = this.plugins.get(name);

    if (!plugin) {
      throw new Error(`Plugin "${name}" not found`);
    }

    if (plugin.status !== PluginStatus.INSTALLED && plugin.status !== PluginStatus.INACTIVE) {
      throw new Error('Plugin must be installed before activation');
    }

    // Call activate hook if present
    if (plugin.activate) {
      await plugin.activate();
    }

    // Update status
    plugin.status = PluginStatus.ACTIVE;
    plugin.activatedAt = new Date();
  }

  /**
   * Deactivate a plugin
   * @throws Error if active dependents exist
   */
  async deactivate(name: string): Promise<void> {
    const plugin = this.plugins.get(name);

    if (!plugin) {
      throw new Error(`Plugin "${name}" not found`);
    }

    // Check for active dependents (matches backend PluginManager.disable_plugin pattern)
    const activeDependents = this.getActiveDependents(name);
    if (activeDependents.length > 0) {
      throw new Error(
        `Cannot deactivate "${name}": active dependents: ${activeDependents.join(', ')}`
      );
    }

    // Call deactivate hook if present
    if (plugin.deactivate) {
      await plugin.deactivate();
    }

    // Update status
    plugin.status = PluginStatus.INACTIVE;
  }

  /**
   * Uninstall a plugin
   */
  async uninstall(name: string): Promise<void> {
    const plugin = this.plugins.get(name);

    if (!plugin) {
      throw new Error(`Plugin "${name}" not found`);
    }

    // Call uninstall hook if present
    if (plugin.uninstall) {
      await plugin.uninstall();
    }

    // Update status
    plugin.status = PluginStatus.REGISTERED;
    plugin.installedAt = undefined;
    plugin.activatedAt = undefined;
  }

  /**
   * Find active plugins that depend on the given plugin
   */
  private getActiveDependents(name: string): string[] {
    const dependents: string[] = [];

    for (const [pluginName, metadata] of this.plugins) {
      if (pluginName === name || metadata.status !== PluginStatus.ACTIVE) {
        continue;
      }

      if (metadata.dependencies) {
        const deps = this.normalizeDependencies(metadata.dependencies);
        if (name in deps) {
          dependents.push(pluginName);
        }
      }
    }

    return dependents;
  }

  /**
   * Resolve dependency order using topological sort
   * @returns Array of plugin names in installation order
   * @throws Error if circular dependencies or missing dependencies
   */
  private resolveDependencyOrder(): string[] {
    const sorted: string[] = [];
    const visiting = new Set<string>();
    const visited = new Set<string>();

    const visit = (name: string): void => {
      // Check for circular dependency
      if (visiting.has(name)) {
        throw new Error('Circular dependency detected');
      }

      // Skip if already processed
      if (visited.has(name)) {
        return;
      }

      const plugin = this.plugins.get(name);
      if (!plugin) {
        throw new Error(`Dependency "${name}" not found`);
      }

      // Mark as visiting
      visiting.add(name);

      // Process dependencies
      if (plugin.dependencies) {
        const deps = this.normalizeDependencies(plugin.dependencies);

        for (const [depName, versionConstraint] of Object.entries(deps)) {
          // Check if dependency exists
          const depPlugin = this.plugins.get(depName);
          if (!depPlugin) {
            throw new Error(`Dependency "${depName}" not found`);
          }

          // Check version constraint if specified
          if (versionConstraint && !satisfiesVersion(depPlugin.version, versionConstraint)) {
            throw new Error(
              `Plugin "${depName}" version ${depPlugin.version} does not satisfy ${versionConstraint}`
            );
          }

          // Recursively visit dependency
          visit(depName);
        }
      }

      // Mark as visited and add to sorted list
      visiting.delete(name);
      visited.add(name);
      sorted.push(name);
    };

    // Visit all plugins
    for (const name of this.plugins.keys()) {
      if (!visited.has(name)) {
        visit(name);
      }
    }

    return sorted;
  }

  /**
   * Normalize dependencies to Record<string, string> format
   */
  private normalizeDependencies(
    deps: string[] | Record<string, string>
  ): Record<string, string> {
    if (Array.isArray(deps)) {
      // Convert array to object with empty version constraints
      return deps.reduce(
        (acc, name) => {
          acc[name] = '';
          return acc;
        },
        {} as Record<string, string>
      );
    }
    return deps;
  }
}
