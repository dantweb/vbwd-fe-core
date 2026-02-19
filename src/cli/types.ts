/**
 * CLI Plugin Manager Types
 */

export interface PluginConfig {
  enabled: boolean;
  version: string;
  installedAt: string;
  source?: string;
}

export interface PluginsJson {
  $schema?: string;
  plugins: Record<string, PluginConfig>;
}

export interface PluginManagerOptions {
  pluginsDir: string;
  configFile: string;
  registry?: string;
}

export interface PluginListItem {
  name: string;
  version: string;
  status: 'active' | 'inactive' | 'not-installed';
  description?: string;
}
