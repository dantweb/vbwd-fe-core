/**
 * Plugin Manager CLI
 * Command-line interface for managing plugins in VBWD applications
 */

import * as fs from 'fs';
import * as path from 'path';
import type { IPluginRegistry, IPluginMetadata } from '../plugins/types';
import { PluginStatus } from '../plugins/types';
import type { PluginManagerOptions, PluginListItem } from './types';
import {
  loadPluginConfig,
  savePluginConfig,
  setPluginConfig,
  removePluginConfig,
  ensurePluginsDir
} from './config';

const VERSION = '1.0.0';

export class PluginManagerCLI {
  private options: Required<PluginManagerOptions>;

  constructor(
    private registry: IPluginRegistry,
    options: PluginManagerOptions
  ) {
    this.options = {
      pluginsDir: options.pluginsDir || './src/plugins',
      configFile: options.configFile || './plugins.json',
      registry: options.registry || ''
    };
  }

  /**
   * Run CLI with arguments
   */
  async run(args: string[]): Promise<void> {
    const [command, ...params] = args;

    switch (command) {
      case 'list':
        return this.list();
      case 'install':
        return this.install(params[0]);
      case 'uninstall':
        return this.uninstall(params[0]);
      case 'activate':
        return this.activate(params[0]);
      case 'deactivate':
        return this.deactivate(params[0]);
      case 'help':
      case '--help':
      case '-h':
        return this.help();
      case 'version':
      case '--version':
      case '-v':
        return this.version();
      default:
        if (command) {
          console.error(`Unknown command: ${command}\n`);
        }
        return this.help();
    }
  }

  /**
   * List all plugins with their status
   */
  async list(): Promise<void> {
    console.log(`\nVBWD Plugin Manager v${VERSION}\n`);

    const config = loadPluginConfig(this.options.configFile);
    const registeredPlugins = this.registry.getAll();

    // Combine config and registry info
    const allPlugins = new Map<string, PluginListItem>();

    // Add from config
    for (const [name, pluginConfig] of Object.entries(config.plugins)) {
      allPlugins.set(name, {
        name,
        version: pluginConfig.version,
        status: pluginConfig.enabled ? 'active' : 'inactive',
        description: undefined
      });
    }

    // Add/update from registry
    for (const plugin of registeredPlugins) {
      const configPlugin = config.plugins[plugin.name];

      allPlugins.set(plugin.name, {
        name: plugin.name,
        version: plugin.version,
        status: this.getPluginStatus(plugin, configPlugin?.enabled),
        description: plugin.description
      });
    }

    if (allPlugins.size === 0) {
      console.log('No plugins installed.\n');
      console.log('Use "plugin install <name>" to install a plugin.');
      return;
    }

    // Print header
    console.log(
      this.padEnd('NAME', 20) +
      this.padEnd('VERSION', 12) +
      this.padEnd('STATUS', 14) +
      'DESCRIPTION'
    );
    console.log('─'.repeat(70));

    // Print plugins
    let activeCount = 0;
    let inactiveCount = 0;

    for (const plugin of allPlugins.values()) {
      if (plugin.status === 'active') activeCount++;
      else inactiveCount++;

      console.log(
        this.padEnd(plugin.name, 20) +
        this.padEnd(plugin.version, 12) +
        this.padEnd(plugin.status, 14) +
        (plugin.description || '')
      );
    }

    console.log('─'.repeat(70));
    console.log(`Total: ${allPlugins.size} plugins (${activeCount} active, ${inactiveCount} inactive)\n`);
  }

  /**
   * Install a plugin
   */
  async install(name: string): Promise<void> {
    if (!name) {
      console.error('Error: Plugin name is required');
      console.log('Usage: plugin install <name>');
      return;
    }

    console.log(`\nInstalling ${name}...`);

    // Check if already installed
    const config = loadPluginConfig(this.options.configFile);
    if (config.plugins[name]) {
      console.log(`Plugin "${name}" is already installed.`);
      return;
    }

    // Ensure plugins directory exists
    ensurePluginsDir(this.options.pluginsDir);

    // Check if plugin directory exists (for local plugins)
    const pluginPath = path.resolve(this.options.pluginsDir, name);

    if (name.startsWith('@') || name.startsWith('npm:')) {
      // NPM package installation (placeholder for future)
      console.log('  Downloading package...');
      console.log('  NPM installation not yet implemented.');
      console.log('  Please copy the plugin to src/plugins/ manually.');
      return;
    }

    // Check if local plugin exists
    if (!fs.existsSync(pluginPath)) {
      console.error(`Error: Plugin directory not found at ${pluginPath}`);
      console.log('Please ensure the plugin is copied to the plugins directory.');
      return;
    }

    // Try to load plugin metadata
    let version = '0.0.0';
    const packageJsonPath = path.join(pluginPath, 'package.json');

    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
        version = packageJson.version || version;
        console.log(`  Found plugin version: ${version}`);
      } catch {
        console.log('  Could not read package.json, using default version');
      }
    }

    // Update config
    const newConfig = setPluginConfig(config, name, {
      enabled: false,
      version,
      installedAt: new Date().toISOString(),
      source: 'local'
    });

    savePluginConfig(this.options.configFile, newConfig);

    console.log(`  Installed to ${pluginPath}`);
    console.log(`  Updated ${this.options.configFile}`);
    console.log(`\nPlugin installed successfully.`);
    console.log(`Run 'npm run plugin activate ${name}' to enable.\n`);
  }

  /**
   * Uninstall a plugin
   */
  async uninstall(name: string): Promise<void> {
    if (!name) {
      console.error('Error: Plugin name is required');
      console.log('Usage: plugin uninstall <name>');
      return;
    }

    console.log(`\nUninstalling ${name}...`);

    const config = loadPluginConfig(this.options.configFile);

    if (!config.plugins[name]) {
      console.error(`Error: Plugin "${name}" is not installed.`);
      return;
    }

    // Check if plugin is active
    if (config.plugins[name].enabled) {
      console.log(`  Deactivating plugin first...`);
      await this.deactivate(name);
    }

    // Remove from config
    const newConfig = removePluginConfig(config, name);
    savePluginConfig(this.options.configFile, newConfig);

    console.log(`  Removed from ${this.options.configFile}`);
    console.log(`\nPlugin uninstalled successfully.`);
    console.log(`Note: Plugin files in ${this.options.pluginsDir}/${name} were not deleted.`);
    console.log(`Delete manually if needed.\n`);
  }

  /**
   * Activate a plugin
   */
  async activate(name: string): Promise<void> {
    if (!name) {
      console.error('Error: Plugin name is required');
      console.log('Usage: plugin activate <name>');
      return;
    }

    console.log(`\nActivating ${name}...`);

    const config = loadPluginConfig(this.options.configFile);

    if (!config.plugins[name]) {
      console.error(`Error: Plugin "${name}" is not installed.`);
      console.log(`Run 'npm run plugin install ${name}' first.`);
      return;
    }

    if (config.plugins[name].enabled) {
      console.log(`Plugin "${name}" is already active.`);
      return;
    }

    // Update config
    const newConfig = setPluginConfig(config, name, {
      ...config.plugins[name],
      enabled: true
    });

    savePluginConfig(this.options.configFile, newConfig);

    console.log(`  Updated ${this.options.configFile}`);
    console.log(`\nPlugin activated successfully.`);
    console.log(`Restart the application to apply changes.\n`);
  }

  /**
   * Deactivate a plugin
   */
  async deactivate(name: string): Promise<void> {
    if (!name) {
      console.error('Error: Plugin name is required');
      console.log('Usage: plugin deactivate <name>');
      return;
    }

    console.log(`\nDeactivating ${name}...`);

    const config = loadPluginConfig(this.options.configFile);

    if (!config.plugins[name]) {
      console.error(`Error: Plugin "${name}" is not installed.`);
      return;
    }

    if (!config.plugins[name].enabled) {
      console.log(`Plugin "${name}" is already inactive.`);
      return;
    }

    // Update config
    const newConfig = setPluginConfig(config, name, {
      ...config.plugins[name],
      enabled: false
    });

    savePluginConfig(this.options.configFile, newConfig);

    console.log(`  Updated ${this.options.configFile}`);
    console.log(`\nPlugin deactivated successfully.`);
    console.log(`Restart the application to apply changes.\n`);
  }

  /**
   * Show help
   */
  help(): void {
    console.log(`
VBWD Plugin Manager v${VERSION}

Usage: npm run plugin <command> [options]

Commands:
  list                    List all plugins with their status
  install <name>          Install a plugin from local path or npm
  uninstall <name>        Remove a plugin from the application
  activate <name>         Enable an installed plugin
  deactivate <name>       Disable a plugin without removing it
  help                    Show this help message
  version                 Show version number

Examples:
  npm run plugin list
  npm run plugin install stripe-payment
  npm run plugin activate stripe-payment
  npm run plugin deactivate stripe-payment
  npm run plugin uninstall stripe-payment

Configuration:
  Plugins are configured in plugins.json
  Plugin files are stored in src/plugins/

For more information, see the documentation.
`);
  }

  /**
   * Show version
   */
  version(): void {
    console.log(`VBWD Plugin Manager v${VERSION}`);
  }

  /**
   * Helper: Pad string to fixed length
   */
  private padEnd(str: string, length: number): string {
    return str.padEnd(length);
  }

  /**
   * Helper: Get plugin status string
   */
  private getPluginStatus(
    plugin: IPluginMetadata,
    enabled?: boolean
  ): 'active' | 'inactive' | 'not-installed' {
    if (enabled === true || plugin.status === PluginStatus.ACTIVE) {
      return 'active';
    }
    if (enabled === false || plugin.status === PluginStatus.INACTIVE) {
      return 'inactive';
    }
    if (plugin.status === PluginStatus.INSTALLED) {
      return 'inactive';
    }
    return 'not-installed';
  }
}
