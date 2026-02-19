/**
 * Plugin Configuration File Utilities
 * Handles reading/writing plugins.json
 */

import * as fs from 'fs';
import * as path from 'path';
import type { PluginsJson, PluginConfig } from './types';

const DEFAULT_CONFIG: PluginsJson = {
  plugins: {}
};

/**
 * Load plugin configuration from file
 */
export function loadPluginConfig(configPath: string): PluginsJson {
  const absolutePath = path.resolve(configPath);

  if (!fs.existsSync(absolutePath)) {
    return { ...DEFAULT_CONFIG };
  }

  try {
    const content = fs.readFileSync(absolutePath, 'utf-8');
    const config = JSON.parse(content) as PluginsJson;

    // Validate structure
    if (!config.plugins || typeof config.plugins !== 'object') {
      console.warn('Invalid plugins.json structure, using default');
      return { ...DEFAULT_CONFIG };
    }

    return config;
  } catch (error) {
    console.warn('Failed to parse plugins.json, using default:', error);
    return { ...DEFAULT_CONFIG };
  }
}

/**
 * Save plugin configuration to file
 */
export function savePluginConfig(configPath: string, config: PluginsJson): void {
  const absolutePath = path.resolve(configPath);
  const content = JSON.stringify(config, null, 2);
  fs.writeFileSync(absolutePath, content, 'utf-8');
}

/**
 * Get a specific plugin config
 */
export function getPluginConfig(
  config: PluginsJson,
  name: string
): PluginConfig | undefined {
  return config.plugins[name];
}

/**
 * Set a plugin config
 */
export function setPluginConfig(
  config: PluginsJson,
  name: string,
  pluginConfig: PluginConfig
): PluginsJson {
  return {
    ...config,
    plugins: {
      ...config.plugins,
      [name]: pluginConfig
    }
  };
}

/**
 * Remove a plugin config
 */
export function removePluginConfig(
  config: PluginsJson,
  name: string
): PluginsJson {
  const { [name]: _, ...remainingPlugins } = config.plugins;
  return {
    ...config,
    plugins: remainingPlugins
  };
}

/**
 * Check if plugin directory exists
 */
export function pluginDirExists(pluginsDir: string, name: string): boolean {
  const pluginPath = path.resolve(pluginsDir, name);
  return fs.existsSync(pluginPath);
}

/**
 * Create plugins directory if it doesn't exist
 */
export function ensurePluginsDir(pluginsDir: string): void {
  const absolutePath = path.resolve(pluginsDir);
  if (!fs.existsSync(absolutePath)) {
    fs.mkdirSync(absolutePath, { recursive: true });
  }
}
