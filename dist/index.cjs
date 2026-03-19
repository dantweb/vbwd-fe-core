"use strict";
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var _a;
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const axios = require("axios");
const vue = require("vue");
const pinia = require("pinia");
const fs = require("fs");
const path = require("path");
function _interopNamespaceDefault(e) {
  const n = Object.create(null, { [Symbol.toStringTag]: { value: "Module" } });
  if (e) {
    for (const k in e) {
      if (k !== "default") {
        const d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: () => e[k]
        });
      }
    }
  }
  n.default = e;
  return Object.freeze(n);
}
const fs__namespace = /* @__PURE__ */ _interopNamespaceDefault(fs);
const path__namespace = /* @__PURE__ */ _interopNamespaceDefault(path);
var PluginStatus = /* @__PURE__ */ ((PluginStatus2) => {
  PluginStatus2["REGISTERED"] = "REGISTERED";
  PluginStatus2["INSTALLED"] = "INSTALLED";
  PluginStatus2["ACTIVE"] = "ACTIVE";
  PluginStatus2["INACTIVE"] = "INACTIVE";
  PluginStatus2["ERROR"] = "ERROR";
  return PluginStatus2;
})(PluginStatus || {});
function isValidSemver(version2) {
  const semverRegex = /^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$/;
  return semverRegex.test(version2);
}
function parseSemver(version2) {
  const match = version2.match(/^(\d+)\.(\d+)\.(\d+)(-([a-zA-Z0-9.-]+))?/);
  if (!match) {
    throw new Error(`Invalid semver: ${version2}`);
  }
  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
    prerelease: match[5]
  };
}
function compareSemver(a, b) {
  const vA = parseSemver(a);
  const vB = parseSemver(b);
  if (vA.major !== vB.major) {
    return vA.major > vB.major ? 1 : -1;
  }
  if (vA.minor !== vB.minor) {
    return vA.minor > vB.minor ? 1 : -1;
  }
  if (vA.patch !== vB.patch) {
    return vA.patch > vB.patch ? 1 : -1;
  }
  if (vA.prerelease && !vB.prerelease) {
    return -1;
  }
  if (!vA.prerelease && vB.prerelease) {
    return 1;
  }
  if (vA.prerelease && vB.prerelease) {
    return vA.prerelease.localeCompare(vB.prerelease);
  }
  return 0;
}
function satisfiesVersion(version2, constraint) {
  if (!constraint) {
    return true;
  }
  if (!constraint.match(/^[~^<>=]/)) {
    return version2 === constraint;
  }
  if (constraint.startsWith("^")) {
    const targetVersion = constraint.slice(1);
    const target = parseSemver(targetVersion);
    const current = parseSemver(version2);
    return current.major === target.major && (current.minor > target.minor || current.minor === target.minor && current.patch >= target.patch);
  }
  if (constraint.startsWith("~")) {
    const targetVersion = constraint.slice(1);
    const target = parseSemver(targetVersion);
    const current = parseSemver(version2);
    return current.major === target.major && current.minor === target.minor && current.patch >= target.patch;
  }
  if (constraint.startsWith(">=")) {
    const targetVersion = constraint.slice(2);
    return compareSemver(version2, targetVersion) >= 0;
  }
  if (constraint.startsWith(">")) {
    const targetVersion = constraint.slice(1);
    return compareSemver(version2, targetVersion) > 0;
  }
  if (constraint.startsWith("<=")) {
    const targetVersion = constraint.slice(2);
    return compareSemver(version2, targetVersion) <= 0;
  }
  if (constraint.startsWith("<")) {
    const targetVersion = constraint.slice(1);
    return compareSemver(version2, targetVersion) < 0;
  }
  return false;
}
class PluginRegistry {
  constructor() {
    __publicField(this, "plugins", /* @__PURE__ */ new Map());
  }
  /**
   * Register a plugin
   * @throws Error if validation fails or plugin already registered
   */
  register(plugin) {
    if (!plugin.name) {
      throw new Error("Plugin name is required");
    }
    if (!plugin.version) {
      throw new Error("Plugin version is required");
    }
    if (!isValidSemver(plugin.version)) {
      throw new Error("Invalid version format");
    }
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin "${plugin.name}" is already registered`);
    }
    const metadata = {
      ...plugin,
      status: PluginStatus.REGISTERED
    };
    this.plugins.set(plugin.name, metadata);
  }
  /**
   * Get plugin by name
   */
  get(name2) {
    return this.plugins.get(name2);
  }
  /**
   * Get all registered plugins
   */
  getAll() {
    return Array.from(this.plugins.values());
  }
  /**
   * Install a specific plugin
   */
  async install(name2, sdk) {
    const plugin = this.plugins.get(name2);
    if (!plugin) {
      throw new Error(`Plugin "${name2}" not found`);
    }
    if (plugin.install) {
      await plugin.install(sdk);
    }
    plugin.status = PluginStatus.INSTALLED;
    plugin.installedAt = /* @__PURE__ */ new Date();
  }
  /**
   * Install all plugins in dependency order
   */
  async installAll(sdk) {
    const order = this.resolveDependencyOrder();
    for (const name2 of order) {
      await this.install(name2, sdk);
    }
  }
  /**
   * Activate a plugin
   */
  async activate(name2) {
    const plugin = this.plugins.get(name2);
    if (!plugin) {
      throw new Error(`Plugin "${name2}" not found`);
    }
    if (plugin.status !== PluginStatus.INSTALLED && plugin.status !== PluginStatus.INACTIVE) {
      throw new Error("Plugin must be installed before activation");
    }
    if (plugin.activate) {
      await plugin.activate();
    }
    plugin.status = PluginStatus.ACTIVE;
    plugin.activatedAt = /* @__PURE__ */ new Date();
  }
  /**
   * Deactivate a plugin
   * @throws Error if active dependents exist
   */
  async deactivate(name2) {
    const plugin = this.plugins.get(name2);
    if (!plugin) {
      throw new Error(`Plugin "${name2}" not found`);
    }
    const activeDependents = this.getActiveDependents(name2);
    if (activeDependents.length > 0) {
      throw new Error(
        `Cannot deactivate "${name2}": active dependents: ${activeDependents.join(", ")}`
      );
    }
    if (plugin.deactivate) {
      await plugin.deactivate();
    }
    plugin.status = PluginStatus.INACTIVE;
  }
  /**
   * Uninstall a plugin
   */
  async uninstall(name2) {
    const plugin = this.plugins.get(name2);
    if (!plugin) {
      throw new Error(`Plugin "${name2}" not found`);
    }
    if (plugin.uninstall) {
      await plugin.uninstall();
    }
    plugin.status = PluginStatus.REGISTERED;
    plugin.installedAt = void 0;
    plugin.activatedAt = void 0;
  }
  /**
   * Find active plugins that depend on the given plugin
   */
  getActiveDependents(name2) {
    const dependents = [];
    for (const [pluginName, metadata] of this.plugins) {
      if (pluginName === name2 || metadata.status !== PluginStatus.ACTIVE) {
        continue;
      }
      if (metadata.dependencies) {
        const deps = this.normalizeDependencies(metadata.dependencies);
        if (name2 in deps) {
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
  resolveDependencyOrder() {
    const sorted = [];
    const visiting = /* @__PURE__ */ new Set();
    const visited = /* @__PURE__ */ new Set();
    const visit = (name2) => {
      if (visiting.has(name2)) {
        throw new Error("Circular dependency detected");
      }
      if (visited.has(name2)) {
        return;
      }
      const plugin = this.plugins.get(name2);
      if (!plugin) {
        throw new Error(`Dependency "${name2}" not found`);
      }
      visiting.add(name2);
      if (plugin.dependencies) {
        const deps = this.normalizeDependencies(plugin.dependencies);
        for (const [depName, versionConstraint] of Object.entries(deps)) {
          const depPlugin = this.plugins.get(depName);
          if (!depPlugin) {
            throw new Error(`Dependency "${depName}" not found`);
          }
          if (versionConstraint && !satisfiesVersion(depPlugin.version, versionConstraint)) {
            throw new Error(
              `Plugin "${depName}" version ${depPlugin.version} does not satisfy ${versionConstraint}`
            );
          }
          visit(depName);
        }
      }
      visiting.delete(name2);
      visited.add(name2);
      sorted.push(name2);
    };
    for (const name2 of this.plugins.keys()) {
      if (!visited.has(name2)) {
        visit(name2);
      }
    }
    return sorted;
  }
  /**
   * Normalize dependencies to Record<string, string> format
   */
  normalizeDependencies(deps) {
    if (Array.isArray(deps)) {
      return deps.reduce(
        (acc, name2) => {
          acc[name2] = "";
          return acc;
        },
        {}
      );
    }
    return deps;
  }
}
function isPlainObject(val) {
  return typeof val === "object" && val !== null && !Array.isArray(val);
}
function deepMerge(target, source) {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    const targetVal = target[key];
    const sourceVal = source[key];
    if (isPlainObject(targetVal) && isPlainObject(sourceVal)) {
      result[key] = deepMerge(
        targetVal,
        sourceVal
      );
    } else {
      result[key] = sourceVal;
    }
  }
  return result;
}
class PlatformSDK {
  constructor(i18n) {
    // Core API instances
    __publicField(this, "api", {});
    __publicField(this, "events", {});
    // Registered routes
    __publicField(this, "routes", []);
    // Registered components
    __publicField(this, "components", {});
    // Registered stores
    __publicField(this, "stores", {});
    // Collected translations
    __publicField(this, "translations", {});
    // vue-i18n instance (optional — injected at bootstrap)
    __publicField(this, "i18n", null);
    this.i18n = i18n || null;
  }
  /**
   * Register a Vue Router route
   */
  addRoute(route) {
    this.routes.push(route);
  }
  /**
   * Get all registered routes
   */
  getRoutes() {
    return this.routes;
  }
  /**
   * Register a global Vue component
   */
  addComponent(name2, component) {
    this.components[name2] = component;
  }
  /**
   * Remove a registered component
   */
  removeComponent(name2) {
    delete this.components[name2];
  }
  /**
   * Get all registered components
   */
  getComponents() {
    return this.components;
  }
  /**
   * Create a Pinia store
   */
  createStore(id, options) {
    this.stores[id] = options;
    return id;
  }
  /**
   * Get all registered stores
   */
  getStores() {
    return this.stores;
  }
  /**
   * Merge translations for a locale
   */
  addTranslations(locale, messages) {
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
  getTranslations() {
    return { ...this.translations };
  }
}
class ApiError extends Error {
  constructor(message, status = 500) {
    super(message);
    __publicField(this, "status");
    this.name = "ApiError";
    this.status = status;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
  /**
   * Check if error is retryable
   * 5xx errors and network errors are retryable
   */
  isRetryable() {
    return this.status >= 500 && this.status < 600;
  }
  /**
   * Create ApiError from Axios error
   */
  static fromAxiosError(error) {
    if (error.request && !error.response) {
      return new NetworkError(error.message || "Network request failed");
    }
    if (error.response) {
      const { status, data, statusText } = error.response;
      if (status === 422 && (data == null ? void 0 : data.errors)) {
        return new ValidationError(
          data.error || data.message || "Validation failed",
          data.errors
        );
      }
      const message = (data == null ? void 0 : data.error) || (data == null ? void 0 : data.message) || statusText || "Request failed";
      return new ApiError(message, status);
    }
    return new ApiError(error.message || "Unknown error occurred");
  }
}
class NetworkError extends ApiError {
  constructor(message) {
    super(message, 0);
    __publicField(this, "isNetworkError", true);
    this.name = "NetworkError";
  }
  /**
   * Network errors are always retryable
   */
  isRetryable() {
    return true;
  }
}
class ValidationError extends ApiError {
  constructor(message, errors) {
    super(message, 422);
    __publicField(this, "errors");
    this.name = "ValidationError";
    this.errors = errors;
  }
  /**
   * Validation errors are not retryable
   */
  isRetryable() {
    return false;
  }
}
class ApiClient {
  constructor(config) {
    __publicField(this, "axiosInstance");
    __publicField(this, "token");
    __publicField(this, "refreshTokenHandler");
    __publicField(this, "eventListeners", /* @__PURE__ */ new Map());
    __publicField(this, "baseURL");
    __publicField(this, "timeout");
    __publicField(this, "headers");
    this.baseURL = config.baseURL;
    this.timeout = config.timeout || 3e4;
    this.headers = {
      "Content-Type": "application/json",
      ...config.headers
    };
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: this.headers
    });
    this.setupInterceptors();
  }
  /**
   * Setup request and response interceptors
   */
  setupInterceptors() {
    this.axiosInstance.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        if (typeof FormData !== "undefined" && config.data instanceof FormData) {
          config.headers.delete("Content-Type");
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        var _a2;
        if (((_a2 = error.response) == null ? void 0 : _a2.status) === 401) {
          this.emit("token-expired");
          if (this.refreshTokenHandler && error.config) {
            try {
              const newToken = await this.refreshTokenHandler();
              this.setToken(newToken);
              error.config.headers.Authorization = `Bearer ${newToken}`;
              return this.axiosInstance.request(error.config);
            } catch (refreshError) {
              return Promise.reject(error);
            }
          }
        }
        return Promise.reject(error);
      }
    );
  }
  /**
   * GET request
   */
  async get(url, config) {
    try {
      const response = await this.axiosInstance.get(url, {
        params: config == null ? void 0 : config.params,
        headers: config == null ? void 0 : config.headers,
        timeout: config == null ? void 0 : config.timeout
      });
      return response.data;
    } catch (error) {
      throw ApiError.fromAxiosError(error);
    }
  }
  /**
   * POST request
   */
  async post(url, data, config) {
    try {
      const response = await this.axiosInstance.post(url, data, {
        params: config == null ? void 0 : config.params,
        headers: config == null ? void 0 : config.headers,
        timeout: config == null ? void 0 : config.timeout
      });
      return response.data;
    } catch (error) {
      throw ApiError.fromAxiosError(error);
    }
  }
  /**
   * PUT request
   */
  async put(url, data, config) {
    try {
      const response = await this.axiosInstance.put(url, data, {
        params: config == null ? void 0 : config.params,
        headers: config == null ? void 0 : config.headers,
        timeout: config == null ? void 0 : config.timeout
      });
      return response.data;
    } catch (error) {
      throw ApiError.fromAxiosError(error);
    }
  }
  /**
   * PATCH request
   */
  async patch(url, data, config) {
    try {
      const response = await this.axiosInstance.patch(url, data, {
        params: config == null ? void 0 : config.params,
        headers: config == null ? void 0 : config.headers,
        timeout: config == null ? void 0 : config.timeout
      });
      return response.data;
    } catch (error) {
      throw ApiError.fromAxiosError(error);
    }
  }
  /**
   * DELETE request
   */
  async delete(url, config) {
    try {
      const response = await this.axiosInstance.delete(url, {
        params: config == null ? void 0 : config.params,
        headers: config == null ? void 0 : config.headers,
        timeout: config == null ? void 0 : config.timeout
      });
      return response.data;
    } catch (error) {
      throw ApiError.fromAxiosError(error);
    }
  }
  /**
   * Set authentication token
   */
  setToken(token) {
    this.token = token;
  }
  /**
   * Get authentication token
   */
  getToken() {
    return this.token;
  }
  /**
   * Clear authentication token
   */
  clearToken() {
    this.token = void 0;
  }
  /**
   * Set refresh token handler
   */
  setRefreshTokenHandler(handler) {
    this.refreshTokenHandler = handler;
  }
  /**
   * Get refresh token handler
   */
  getRefreshTokenHandler() {
    return this.refreshTokenHandler;
  }
  /**
   * Add event listener
   */
  on(event, listener) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(listener);
  }
  /**
   * Remove event listener
   */
  off(event, listener) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }
  /**
   * Emit event
   */
  emit(event, ...args) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((listener) => listener(...args));
    }
  }
  /**
   * Get request configuration (for testing)
   */
  getRequestConfig(url, config) {
    const fullUrl = url.startsWith("http") ? url : `${this.baseURL}${url}`;
    const requestConfig = {
      url: fullUrl,
      method: (config == null ? void 0 : config.method) || "GET",
      headers: {
        ...this.headers,
        ...config == null ? void 0 : config.headers
      },
      timeout: (config == null ? void 0 : config.timeout) || this.timeout
    };
    if (this.token && requestConfig.headers) {
      requestConfig.headers.Authorization = `Bearer ${this.token}`;
    }
    if (config == null ? void 0 : config.params) {
      requestConfig.params = config.params;
    }
    if (config == null ? void 0 : config.data) {
      requestConfig.data = config.data;
    }
    return requestConfig;
  }
  /**
   * Handle response (for testing)
   */
  handleResponse(response) {
    if (response.status >= 400) {
      if (response.status === 401) {
        this.emit("token-expired");
      }
      const errorData = response.data;
      const message = (errorData == null ? void 0 : errorData.error) || (errorData == null ? void 0 : errorData.message) || response.statusText;
      throw new ApiError(message, response.status);
    }
    return response.data;
  }
}
class EventBus {
  constructor(options = {}) {
    __publicField(this, "listeners", /* @__PURE__ */ new Map());
    __publicField(this, "history", []);
    __publicField(this, "options");
    __publicField(this, "pendingEvents", []);
    __publicField(this, "isSending", false);
    this.options = {
      debug: options.debug ?? false,
      maxHistory: options.maxHistory ?? 100,
      apiClient: options.apiClient,
      eventsEndpoint: options.eventsEndpoint ?? "/events",
      autoSendToBackend: options.autoSendToBackend ?? !!options.apiClient,
      localOnlyEvents: options.localOnlyEvents ?? [
        "notification:show",
        "notification:hide",
        "modal:open",
        "modal:close",
        "loading:start",
        "loading:end"
      ]
    };
  }
  /**
   * Configure the EventBus after construction.
   * Useful for setting ApiClient after app initialization.
   */
  configure(options) {
    if (options.apiClient !== void 0) {
      this.options.apiClient = options.apiClient;
    }
    if (options.eventsEndpoint !== void 0) {
      this.options.eventsEndpoint = options.eventsEndpoint;
    }
    if (options.autoSendToBackend !== void 0) {
      this.options.autoSendToBackend = options.autoSendToBackend;
    }
    if (options.localOnlyEvents !== void 0) {
      this.options.localOnlyEvents = options.localOnlyEvents;
    }
    if (options.debug !== void 0) {
      this.options.debug = options.debug;
    }
  }
  /**
   * Emit an event with optional payload.
   * Automatically sends to backend if configured.
   * @param event - Event name
   * @param payload - Optional event data
   */
  emit(event, payload) {
    if (this.options.debug) {
      console.log(`[EventBus] ${event}`, payload);
    }
    const historyEntry = {
      event,
      payload,
      timestamp: /* @__PURE__ */ new Date(),
      sentToBackend: false
    };
    this.history.push(historyEntry);
    if (this.history.length > this.options.maxHistory) {
      this.history.shift();
    }
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((cb) => {
        try {
          cb(payload);
        } catch (error) {
          console.error(`[EventBus] Error in handler for ${event}:`, error);
        }
      });
    }
    if (this.shouldSendToBackend(event)) {
      this.queueBackendEvent(event, payload, historyEntry);
    }
  }
  /**
   * Check if event should be sent to backend
   */
  shouldSendToBackend(event) {
    if (!this.options.autoSendToBackend || !this.options.apiClient) {
      return false;
    }
    return !this.options.localOnlyEvents.includes(event);
  }
  /**
   * Queue an event for backend delivery
   */
  queueBackendEvent(event, payload, historyEntry) {
    const backendPayload = {
      type: event,
      data: payload,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.pendingEvents.push(backendPayload);
    this.flushPendingEvents().then((success) => {
      historyEntry.sentToBackend = success;
    });
  }
  /**
   * Flush pending events to backend
   */
  async flushPendingEvents() {
    if (this.isSending || this.pendingEvents.length === 0 || !this.options.apiClient) {
      return false;
    }
    this.isSending = true;
    const eventsToSend = [...this.pendingEvents];
    this.pendingEvents = [];
    try {
      await this.options.apiClient.post(this.options.eventsEndpoint, {
        events: eventsToSend
      });
      if (this.options.debug) {
        console.log(`[EventBus] Sent ${eventsToSend.length} events to backend`);
      }
      return true;
    } catch (error) {
      this.pendingEvents = [...eventsToSend, ...this.pendingEvents];
      if (this.options.debug) {
        console.error("[EventBus] Failed to send events to backend:", error);
      }
      return false;
    } finally {
      this.isSending = false;
    }
  }
  /**
   * Manually send events to backend (for local-only events that need explicit sending)
   */
  async sendToBackend(event, payload) {
    if (!this.options.apiClient) {
      console.warn("[EventBus] No API client configured for backend sending");
      return false;
    }
    try {
      await this.options.apiClient.post(this.options.eventsEndpoint, {
        events: [{
          type: event,
          data: payload,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        }]
      });
      return true;
    } catch (error) {
      if (this.options.debug) {
        console.error("[EventBus] Failed to send event to backend:", error);
      }
      return false;
    }
  }
  /**
   * Subscribe to an event
   * @param event - Event name
   * @param callback - Handler function
   * @returns Unsubscribe function
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, /* @__PURE__ */ new Set());
    }
    this.listeners.get(event).add(callback);
    return () => this.off(event, callback);
  }
  /**
   * Unsubscribe from an event
   * @param event - Event name
   * @param callback - Handler function to remove
   */
  off(event, callback) {
    var _a2;
    (_a2 = this.listeners.get(event)) == null ? void 0 : _a2.delete(callback);
  }
  /**
   * Subscribe to an event once (auto-unsubscribes after first emit)
   * @param event - Event name
   * @param callback - Handler function
   */
  once(event, callback) {
    const wrapper = (payload) => {
      callback(payload);
      this.off(event, wrapper);
    };
    this.on(event, wrapper);
  }
  /**
   * Check if an event has any listeners
   * @param event - Event name
   */
  hasListeners(event) {
    var _a2;
    return (((_a2 = this.listeners.get(event)) == null ? void 0 : _a2.size) ?? 0) > 0;
  }
  /**
   * Get count of listeners for an event
   * @param event - Event name
   */
  listenerCount(event) {
    var _a2;
    return ((_a2 = this.listeners.get(event)) == null ? void 0 : _a2.size) ?? 0;
  }
  /**
   * Get event history for debugging
   * @param event - Optional filter by event name
   */
  getHistory(event) {
    if (event) {
      return this.history.filter((entry) => entry.event === event);
    }
    return [...this.history];
  }
  /**
   * Clear all listeners and history
   */
  clear() {
    this.listeners.clear();
    this.history = [];
    this.pendingEvents = [];
  }
  /**
   * Clear only history (keep listeners)
   */
  clearHistory() {
    this.history = [];
  }
  /**
   * Remove all listeners for a specific event
   * @param event - Event name
   */
  clearEvent(event) {
    this.listeners.delete(event);
  }
  /**
   * Get pending event count (events not yet sent to backend)
   */
  getPendingCount() {
    return this.pendingEvents.length;
  }
}
const eventBus = new EventBus({
  debug: typeof process !== "undefined" && ((_a = process.env) == null ? void 0 : _a.NODE_ENV) === "development"
});
function configureEventBus(options) {
  eventBus.configure(options);
}
const AppEvents = {
  // Authentication events
  AUTH_LOGIN: "auth:login",
  AUTH_LOGOUT: "auth:logout",
  AUTH_TOKEN_REFRESHED: "auth:token-refreshed",
  AUTH_SESSION_EXPIRED: "auth:session-expired",
  // User events
  USER_REGISTERED: "user:registered",
  USER_UPDATED: "user:updated",
  USER_DELETED: "user:deleted",
  // Subscription events
  SUBSCRIPTION_CREATED: "subscription:created",
  SUBSCRIPTION_ACTIVATED: "subscription:activated",
  SUBSCRIPTION_UPGRADED: "subscription:upgraded",
  SUBSCRIPTION_DOWNGRADED: "subscription:downgraded",
  SUBSCRIPTION_CANCELLED: "subscription:cancelled",
  SUBSCRIPTION_EXPIRED: "subscription:expired",
  // Payment events
  PAYMENT_INITIATED: "payment:initiated",
  PAYMENT_SUCCEEDED: "payment:succeeded",
  PAYMENT_FAILED: "payment:failed",
  PAYMENT_REFUNDED: "payment:refunded",
  // UI events
  NOTIFICATION_SHOW: "notification:show",
  NOTIFICATION_HIDE: "notification:hide",
  MODAL_OPEN: "modal:open",
  MODAL_CLOSE: "modal:close",
  LOADING_START: "loading:start",
  LOADING_END: "loading:end",
  // WebSocket events
  WS_CONNECTED: "ws:connected",
  WS_DISCONNECTED: "ws:disconnected",
  WS_MESSAGE: "ws:message",
  WS_ERROR: "ws:error",
  // Plugin events
  PLUGIN_REGISTERED: "plugin:registered",
  PLUGIN_INITIALIZED: "plugin:initialized",
  PLUGIN_ERROR: "plugin:error",
  PLUGIN_STOPPED: "plugin:stopped"
};
const _hoisted_1$h = { class: "vbwd-alert-icon" };
const _hoisted_2$g = { class: "vbwd-alert-content" };
const _hoisted_3$b = {
  key: 0,
  class: "vbwd-alert-title"
};
const _hoisted_4$a = { class: "vbwd-alert-message" };
const _sfc_main$n = /* @__PURE__ */ vue.defineComponent({
  __name: "Alert",
  props: {
    variant: { default: "info" },
    title: {},
    message: {},
    dismissible: { type: Boolean, default: false }
  },
  emits: ["dismiss"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const visible = vue.ref(true);
    const dismiss = () => {
      visible.value = false;
      emit("dismiss");
    };
    const icons = {
      success: () => vue.h("svg", { width: 20, height: 20, viewBox: "0 0 20 20", fill: "currentColor" }, [
        vue.h("path", { "fill-rule": "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z", "clip-rule": "evenodd" })
      ]),
      error: () => vue.h("svg", { width: 20, height: 20, viewBox: "0 0 20 20", fill: "currentColor" }, [
        vue.h("path", { "fill-rule": "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z", "clip-rule": "evenodd" })
      ]),
      warning: () => vue.h("svg", { width: 20, height: 20, viewBox: "0 0 20 20", fill: "currentColor" }, [
        vue.h("path", { "fill-rule": "evenodd", d: "M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z", "clip-rule": "evenodd" })
      ]),
      info: () => vue.h("svg", { width: 20, height: 20, viewBox: "0 0 20 20", fill: "currentColor" }, [
        vue.h("path", { "fill-rule": "evenodd", d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z", "clip-rule": "evenodd" })
      ])
    };
    const iconComponent = vue.computed(() => icons[props.variant]);
    return (_ctx, _cache) => {
      return visible.value ? (vue.openBlock(), vue.createElementBlock("div", {
        key: 0,
        class: vue.normalizeClass(["vbwd-alert", `vbwd-alert-${__props.variant}`]),
        role: "alert"
      }, [
        vue.createElementVNode("div", _hoisted_1$h, [
          vue.renderSlot(_ctx.$slots, "icon", {}, () => [
            (vue.openBlock(), vue.createBlock(vue.resolveDynamicComponent(iconComponent.value)))
          ], true)
        ]),
        vue.createElementVNode("div", _hoisted_2$g, [
          __props.title ? (vue.openBlock(), vue.createElementBlock("h4", _hoisted_3$b, vue.toDisplayString(__props.title), 1)) : vue.createCommentVNode("", true),
          vue.createElementVNode("p", _hoisted_4$a, [
            vue.renderSlot(_ctx.$slots, "default", {}, () => [
              vue.createTextVNode(vue.toDisplayString(__props.message), 1)
            ], true)
          ])
        ]),
        __props.dismissible ? (vue.openBlock(), vue.createElementBlock("button", {
          key: 0,
          class: "vbwd-alert-close",
          onClick: dismiss,
          "aria-label": "Dismiss"
        }, [..._cache[0] || (_cache[0] = [
          vue.createElementVNode("svg", {
            width: "16",
            height: "16",
            viewBox: "0 0 20 20",
            fill: "currentColor"
          }, [
            vue.createElementVNode("path", {
              "fill-rule": "evenodd",
              d: "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z",
              "clip-rule": "evenodd"
            })
          ], -1)
        ])])) : vue.createCommentVNode("", true)
      ], 2)) : vue.createCommentVNode("", true);
    };
  }
});
const _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};
const Alert = /* @__PURE__ */ _export_sfc(_sfc_main$n, [["__scopeId", "data-v-64c3ffe7"]]);
const _sfc_main$m = /* @__PURE__ */ vue.defineComponent({
  __name: "Badge",
  props: {
    label: {},
    variant: { default: "primary" },
    size: { default: "md" }
  },
  setup(__props) {
    return (_ctx, _cache) => {
      return vue.openBlock(), vue.createElementBlock("span", {
        class: vue.normalizeClass(["vbwd-badge", `vbwd-badge-${__props.variant}`, `vbwd-badge-${__props.size}`])
      }, [
        vue.renderSlot(_ctx.$slots, "default", {}, () => [
          vue.createTextVNode(vue.toDisplayString(__props.label), 1)
        ], true)
      ], 2);
    };
  }
});
const Badge = /* @__PURE__ */ _export_sfc(_sfc_main$m, [["__scopeId", "data-v-4df2bf4f"]]);
const _sfc_main$l = /* @__PURE__ */ vue.defineComponent({
  __name: "Spinner",
  props: {
    size: { default: "md" }
  },
  setup(__props) {
    return (_ctx, _cache) => {
      return vue.openBlock(), vue.createElementBlock("svg", {
        class: vue.normalizeClass(["vbwd-spinner", `vbwd-spinner-${__props.size}`]),
        xmlns: "http://www.w3.org/2000/svg",
        fill: "none",
        viewBox: "0 0 24 24"
      }, [..._cache[0] || (_cache[0] = [
        vue.createElementVNode("circle", {
          class: "vbwd-spinner-track",
          cx: "12",
          cy: "12",
          r: "10",
          stroke: "currentColor",
          "stroke-width": "4"
        }, null, -1),
        vue.createElementVNode("path", {
          class: "vbwd-spinner-head",
          fill: "currentColor",
          d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        }, null, -1)
      ])], 2);
    };
  }
});
const Spinner = /* @__PURE__ */ _export_sfc(_sfc_main$l, [["__scopeId", "data-v-3dad9f75"]]);
const _hoisted_1$g = ["type", "disabled"];
const _sfc_main$k = /* @__PURE__ */ vue.defineComponent({
  __name: "Button",
  props: {
    type: { default: "button" },
    variant: { default: "primary" },
    size: { default: "md" },
    disabled: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    block: { type: Boolean, default: false }
  },
  emits: ["click"],
  setup(__props) {
    const props = __props;
    const buttonClasses = vue.computed(() => [
      "vbwd-btn",
      `vbwd-btn-${props.variant}`,
      `vbwd-btn-${props.size}`,
      {
        "vbwd-btn-block": props.block,
        "vbwd-btn-loading": props.loading
      }
    ]);
    return (_ctx, _cache) => {
      return vue.openBlock(), vue.createElementBlock("button", {
        type: __props.type,
        class: vue.normalizeClass(buttonClasses.value),
        disabled: __props.disabled || __props.loading,
        onClick: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("click", $event))
      }, [
        __props.loading ? (vue.openBlock(), vue.createBlock(Spinner, {
          key: 0,
          size: "sm",
          class: "vbwd-btn-spinner"
        })) : vue.createCommentVNode("", true),
        vue.renderSlot(_ctx.$slots, "default", {}, void 0, true)
      ], 10, _hoisted_1$g);
    };
  }
});
const Button = /* @__PURE__ */ _export_sfc(_sfc_main$k, [["__scopeId", "data-v-496cc81d"]]);
const _hoisted_1$f = {
  key: 0,
  class: "vbwd-card-header"
};
const _hoisted_2$f = { class: "vbwd-card-title" };
const _hoisted_3$a = {
  key: 0,
  class: "vbwd-card-subtitle"
};
const _hoisted_4$9 = {
  key: 0,
  class: "vbwd-card-actions"
};
const _hoisted_5$6 = { class: "vbwd-card-body" };
const _hoisted_6$5 = {
  key: 1,
  class: "vbwd-card-footer"
};
const _sfc_main$j = /* @__PURE__ */ vue.defineComponent({
  __name: "Card",
  props: {
    title: {},
    subtitle: {},
    hoverable: { type: Boolean, default: false }
  },
  setup(__props) {
    return (_ctx, _cache) => {
      return vue.openBlock(), vue.createElementBlock("div", {
        class: vue.normalizeClass(["vbwd-card", { "vbwd-card-hoverable": __props.hoverable }])
      }, [
        __props.title || _ctx.$slots.header ? (vue.openBlock(), vue.createElementBlock("header", _hoisted_1$f, [
          vue.renderSlot(_ctx.$slots, "header", {}, () => [
            vue.createElementVNode("h3", _hoisted_2$f, vue.toDisplayString(__props.title), 1),
            __props.subtitle ? (vue.openBlock(), vue.createElementBlock("p", _hoisted_3$a, vue.toDisplayString(__props.subtitle), 1)) : vue.createCommentVNode("", true)
          ], true),
          _ctx.$slots.actions ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_4$9, [
            vue.renderSlot(_ctx.$slots, "actions", {}, void 0, true)
          ])) : vue.createCommentVNode("", true)
        ])) : vue.createCommentVNode("", true),
        vue.createElementVNode("div", _hoisted_5$6, [
          vue.renderSlot(_ctx.$slots, "default", {}, void 0, true)
        ]),
        _ctx.$slots.footer ? (vue.openBlock(), vue.createElementBlock("footer", _hoisted_6$5, [
          vue.renderSlot(_ctx.$slots, "footer", {}, void 0, true)
        ])) : vue.createCommentVNode("", true)
      ], 2);
    };
  }
});
const Card = /* @__PURE__ */ _export_sfc(_sfc_main$j, [["__scopeId", "data-v-3c45206a"]]);
const _hoisted_1$e = { class: "vbwd-detail-field" };
const _hoisted_2$e = { class: "vbwd-detail-field-label" };
const _hoisted_3$9 = {
  key: 1,
  class: "vbwd-detail-field-value"
};
const _sfc_main$i = /* @__PURE__ */ vue.defineComponent({
  __name: "DetailField",
  props: {
    label: {},
    value: { default: null },
    badge: { type: Boolean, default: false },
    badgeVariant: { default: "info" }
  },
  setup(__props) {
    const props = __props;
    const displayValue = vue.computed(() => {
      if (props.value === null || props.value === void 0 || props.value === "") {
        return "-";
      }
      return String(props.value);
    });
    return (_ctx, _cache) => {
      return vue.openBlock(), vue.createElementBlock("div", _hoisted_1$e, [
        vue.createElementVNode("span", _hoisted_2$e, vue.toDisplayString(__props.label), 1),
        __props.badge ? (vue.openBlock(), vue.createBlock(Badge, {
          key: 0,
          variant: __props.badgeVariant,
          class: "vbwd-detail-field-badge"
        }, {
          default: vue.withCtx(() => [
            vue.createTextVNode(vue.toDisplayString(displayValue.value), 1)
          ]),
          _: 1
        }, 8, ["variant"])) : (vue.openBlock(), vue.createElementBlock("span", _hoisted_3$9, vue.toDisplayString(displayValue.value), 1))
      ]);
    };
  }
});
const DetailField = /* @__PURE__ */ _export_sfc(_sfc_main$i, [["__scopeId", "data-v-aae1356f"]]);
const _sfc_main$h = /* @__PURE__ */ vue.defineComponent({
  __name: "DetailGrid",
  props: {
    columns: { default: 2 }
  },
  setup(__props) {
    const props = __props;
    const gridStyle = vue.computed(() => ({
      gridTemplateColumns: `repeat(${props.columns}, 1fr)`
    }));
    return (_ctx, _cache) => {
      return vue.openBlock(), vue.createElementBlock("div", {
        class: "vbwd-detail-grid",
        style: vue.normalizeStyle(gridStyle.value)
      }, [
        vue.renderSlot(_ctx.$slots, "default", {}, void 0, true)
      ], 4);
    };
  }
});
const DetailGrid = /* @__PURE__ */ _export_sfc(_sfc_main$h, [["__scopeId", "data-v-d3e81837"]]);
const _hoisted_1$d = {
  type: "button",
  class: "vbwd-dropdown-btn"
};
const _hoisted_2$d = ["onClick"];
const _sfc_main$g = /* @__PURE__ */ vue.defineComponent({
  __name: "Dropdown",
  props: {
    label: { default: "Select" },
    items: { default: () => [] },
    placement: { default: "bottom-start" }
  },
  emits: ["select"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    const isOpen = vue.ref(false);
    const dropdownRef = vue.ref(null);
    const toggle = () => {
      isOpen.value = !isOpen.value;
    };
    const close = () => {
      isOpen.value = false;
    };
    const selectItem = (item) => {
      emit("select", item);
      close();
    };
    const handleClickOutside = (event) => {
      if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
        close();
      }
    };
    const handleEscape = (event) => {
      if (event.key === "Escape" && isOpen.value) {
        close();
      }
    };
    vue.onMounted(() => {
      document.addEventListener("click", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    });
    vue.onUnmounted(() => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    });
    return (_ctx, _cache) => {
      return vue.openBlock(), vue.createElementBlock("div", {
        class: "vbwd-dropdown",
        ref_key: "dropdownRef",
        ref: dropdownRef
      }, [
        vue.createElementVNode("div", {
          class: "vbwd-dropdown-trigger",
          onClick: toggle
        }, [
          vue.renderSlot(_ctx.$slots, "trigger", {}, () => [
            vue.createElementVNode("button", _hoisted_1$d, [
              vue.createTextVNode(vue.toDisplayString(__props.label) + " ", 1),
              (vue.openBlock(), vue.createElementBlock("svg", {
                class: vue.normalizeClass(["vbwd-dropdown-arrow", { "vbwd-dropdown-arrow-open": isOpen.value }]),
                width: "16",
                height: "16",
                viewBox: "0 0 20 20",
                fill: "currentColor"
              }, [..._cache[0] || (_cache[0] = [
                vue.createElementVNode("path", {
                  "fill-rule": "evenodd",
                  d: "M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z",
                  "clip-rule": "evenodd"
                }, null, -1)
              ])], 2))
            ])
          ], true)
        ]),
        vue.createVNode(vue.Transition, { name: "vbwd-dropdown" }, {
          default: vue.withCtx(() => [
            isOpen.value ? (vue.openBlock(), vue.createElementBlock("div", {
              key: 0,
              class: vue.normalizeClass(["vbwd-dropdown-menu", `vbwd-dropdown-${__props.placement}`])
            }, [
              vue.renderSlot(_ctx.$slots, "default", {}, () => [
                (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(__props.items, (item, index) => {
                  return vue.openBlock(), vue.createElementBlock("div", {
                    key: index,
                    class: vue.normalizeClass([
                      "vbwd-dropdown-item",
                      { "vbwd-dropdown-item-disabled": item.disabled }
                    ]),
                    onClick: ($event) => !item.disabled && selectItem(item)
                  }, vue.toDisplayString(item.label), 11, _hoisted_2$d);
                }), 128))
              ], true)
            ], 2)) : vue.createCommentVNode("", true)
          ]),
          _: 3
        })
      ], 512);
    };
  }
});
const Dropdown = /* @__PURE__ */ _export_sfc(_sfc_main$g, [["__scopeId", "data-v-ab6a622e"]]);
const _hoisted_1$c = {
  key: 0,
  class: "vbwd-input-required"
};
const _hoisted_2$c = { class: "vbwd-input-container" };
const _hoisted_3$8 = {
  key: 0,
  class: "vbwd-input-prefix"
};
const _hoisted_4$8 = ["value", "type", "placeholder", "disabled", "readonly"];
const _hoisted_5$5 = {
  key: 1,
  class: "vbwd-input-suffix"
};
const _hoisted_6$4 = {
  key: 1,
  class: "vbwd-input-error-text"
};
const _hoisted_7$3 = {
  key: 2,
  class: "vbwd-input-hint"
};
const _sfc_main$f = /* @__PURE__ */ vue.defineComponent({
  __name: "Input",
  props: {
    modelValue: { default: "" },
    type: { default: "text" },
    label: {},
    placeholder: {},
    hint: {},
    error: {},
    disabled: { type: Boolean, default: false },
    readonly: { type: Boolean, default: false },
    required: { type: Boolean, default: false },
    size: { default: "md" }
  },
  emits: ["update:modelValue", "blur", "focus"],
  setup(__props) {
    let idCounter = 0;
    const props = __props;
    const inputId = `vbwd-input-${++idCounter}`;
    const inputClasses = vue.computed(() => [
      "vbwd-input",
      `vbwd-input-${props.size}`,
      {
        "vbwd-input-invalid": props.error,
        "vbwd-input-disabled": props.disabled
      }
    ]);
    return (_ctx, _cache) => {
      return vue.openBlock(), vue.createElementBlock("div", {
        class: vue.normalizeClass(["vbwd-input-wrapper", { "vbwd-input-has-error": __props.error }])
      }, [
        __props.label ? (vue.openBlock(), vue.createElementBlock("label", {
          key: 0,
          for: inputId,
          class: "vbwd-input-label"
        }, [
          vue.createTextVNode(vue.toDisplayString(__props.label) + " ", 1),
          __props.required ? (vue.openBlock(), vue.createElementBlock("span", _hoisted_1$c, "*")) : vue.createCommentVNode("", true)
        ])) : vue.createCommentVNode("", true),
        vue.createElementVNode("div", _hoisted_2$c, [
          _ctx.$slots.prefix ? (vue.openBlock(), vue.createElementBlock("span", _hoisted_3$8, [
            vue.renderSlot(_ctx.$slots, "prefix", {}, void 0, true)
          ])) : vue.createCommentVNode("", true),
          vue.createElementVNode("input", {
            id: inputId,
            value: __props.modelValue,
            type: __props.type,
            placeholder: __props.placeholder,
            disabled: __props.disabled,
            readonly: __props.readonly,
            class: vue.normalizeClass(inputClasses.value),
            onInput: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("update:modelValue", $event.target.value)),
            onBlur: _cache[1] || (_cache[1] = ($event) => _ctx.$emit("blur", $event)),
            onFocus: _cache[2] || (_cache[2] = ($event) => _ctx.$emit("focus", $event))
          }, null, 42, _hoisted_4$8),
          _ctx.$slots.suffix ? (vue.openBlock(), vue.createElementBlock("span", _hoisted_5$5, [
            vue.renderSlot(_ctx.$slots, "suffix", {}, void 0, true)
          ])) : vue.createCommentVNode("", true)
        ]),
        __props.error ? (vue.openBlock(), vue.createElementBlock("p", _hoisted_6$4, vue.toDisplayString(__props.error), 1)) : __props.hint ? (vue.openBlock(), vue.createElementBlock("p", _hoisted_7$3, vue.toDisplayString(__props.hint), 1)) : vue.createCommentVNode("", true)
      ], 2);
    };
  }
});
const Input = /* @__PURE__ */ _export_sfc(_sfc_main$f, [["__scopeId", "data-v-bf22b843"]]);
const _hoisted_1$b = ["aria-labelledby"];
const _hoisted_2$b = {
  key: 0,
  class: "vbwd-modal-header"
};
const _hoisted_3$7 = { class: "vbwd-modal-body" };
const _hoisted_4$7 = {
  key: 1,
  class: "vbwd-modal-footer"
};
const _sfc_main$e = /* @__PURE__ */ vue.defineComponent({
  __name: "Modal",
  props: {
    modelValue: { type: Boolean },
    title: {},
    size: { default: "md" },
    closable: { type: Boolean, default: true },
    closeOnOverlay: { type: Boolean, default: true },
    closeOnEsc: { type: Boolean, default: true }
  },
  emits: ["update:modelValue", "close"],
  setup(__props, { emit: __emit }) {
    let idCounter = 0;
    const props = __props;
    const emit = __emit;
    const modalTitleId = `vbwd-modal-title-${++idCounter}`;
    const close = () => {
      emit("update:modelValue", false);
      emit("close");
    };
    const handleKeydown = (e) => {
      if (e.key === "Escape" && props.closeOnEsc && props.modelValue) {
        close();
      }
    };
    vue.watch(() => props.modelValue, (isOpen) => {
      if (isOpen) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
    });
    vue.onMounted(() => {
      document.addEventListener("keydown", handleKeydown);
    });
    vue.onUnmounted(() => {
      document.removeEventListener("keydown", handleKeydown);
      document.body.style.overflow = "";
    });
    return (_ctx, _cache) => {
      return vue.openBlock(), vue.createBlock(vue.Teleport, { to: "body" }, [
        vue.createVNode(vue.Transition, { name: "vbwd-modal" }, {
          default: vue.withCtx(() => [
            __props.modelValue ? (vue.openBlock(), vue.createElementBlock("div", {
              key: 0,
              class: "vbwd-modal-overlay",
              onClick: _cache[0] || (_cache[0] = vue.withModifiers(($event) => __props.closeOnOverlay && close(), ["self"]))
            }, [
              vue.createElementVNode("div", {
                class: vue.normalizeClass(["vbwd-modal", `vbwd-modal-${__props.size}`]),
                role: "dialog",
                "aria-modal": "true",
                "aria-labelledby": __props.title ? modalTitleId : void 0
              }, [
                __props.title || _ctx.$slots.header ? (vue.openBlock(), vue.createElementBlock("header", _hoisted_2$b, [
                  vue.renderSlot(_ctx.$slots, "header", {}, () => [
                    vue.createElementVNode("h3", {
                      id: modalTitleId,
                      class: "vbwd-modal-title"
                    }, vue.toDisplayString(__props.title), 1)
                  ], true),
                  __props.closable ? (vue.openBlock(), vue.createElementBlock("button", {
                    key: 0,
                    class: "vbwd-modal-close",
                    onClick: close,
                    "aria-label": "Close"
                  }, [..._cache[1] || (_cache[1] = [
                    vue.createElementVNode("svg", {
                      width: "20",
                      height: "20",
                      viewBox: "0 0 20 20",
                      fill: "currentColor"
                    }, [
                      vue.createElementVNode("path", {
                        "fill-rule": "evenodd",
                        d: "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z",
                        "clip-rule": "evenodd"
                      })
                    ], -1)
                  ])])) : vue.createCommentVNode("", true)
                ])) : vue.createCommentVNode("", true),
                vue.createElementVNode("div", _hoisted_3$7, [
                  vue.renderSlot(_ctx.$slots, "default", {}, void 0, true)
                ]),
                _ctx.$slots.footer ? (vue.openBlock(), vue.createElementBlock("footer", _hoisted_4$7, [
                  vue.renderSlot(_ctx.$slots, "footer", {}, void 0, true)
                ])) : vue.createCommentVNode("", true)
              ], 10, _hoisted_1$b)
            ])) : vue.createCommentVNode("", true)
          ]),
          _: 3
        })
      ]);
    };
  }
});
const Modal = /* @__PURE__ */ _export_sfc(_sfc_main$e, [["__scopeId", "data-v-a9346ee5"]]);
const _hoisted_1$a = {
  class: "vbwd-pagination",
  role: "navigation",
  "aria-label": "Pagination"
};
const _hoisted_2$a = ["disabled"];
const _hoisted_3$6 = {
  key: 0,
  class: "vbwd-pagination-ellipsis"
};
const _hoisted_4$6 = ["aria-current", "onClick"];
const _hoisted_5$4 = ["disabled"];
const _sfc_main$d = /* @__PURE__ */ vue.defineComponent({
  __name: "Pagination",
  props: {
    currentPage: {},
    totalPages: {},
    siblingCount: { default: 1 }
  },
  emits: ["update:currentPage"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const visiblePages = vue.computed(() => {
      const pages = [];
      const { currentPage, totalPages, siblingCount } = props;
      if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
        return pages;
      }
      pages.push(1);
      const leftSibling = Math.max(currentPage - siblingCount, 2);
      const rightSibling = Math.min(currentPage + siblingCount, totalPages - 1);
      if (leftSibling > 2) {
        pages.push("...");
      }
      for (let i = leftSibling; i <= rightSibling; i++) {
        pages.push(i);
      }
      if (rightSibling < totalPages - 1) {
        pages.push("...");
      }
      pages.push(totalPages);
      return pages;
    });
    const goToPage = (page) => {
      if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
        emit("update:currentPage", page);
      }
    };
    return (_ctx, _cache) => {
      return vue.openBlock(), vue.createElementBlock("nav", _hoisted_1$a, [
        vue.createElementVNode("button", {
          class: "vbwd-pagination-btn vbwd-pagination-prev",
          disabled: __props.currentPage <= 1,
          onClick: _cache[0] || (_cache[0] = ($event) => goToPage(__props.currentPage - 1)),
          "aria-label": "Previous page"
        }, [..._cache[2] || (_cache[2] = [
          vue.createElementVNode("svg", {
            width: "16",
            height: "16",
            viewBox: "0 0 20 20",
            fill: "currentColor"
          }, [
            vue.createElementVNode("path", {
              "fill-rule": "evenodd",
              d: "M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z",
              "clip-rule": "evenodd"
            })
          ], -1)
        ])], 8, _hoisted_2$a),
        (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(visiblePages.value, (page) => {
          return vue.openBlock(), vue.createElementBlock(vue.Fragment, { key: page }, [
            page === "..." ? (vue.openBlock(), vue.createElementBlock("span", _hoisted_3$6, "...")) : (vue.openBlock(), vue.createElementBlock("button", {
              key: 1,
              class: vue.normalizeClass(["vbwd-pagination-btn", "vbwd-pagination-page", { "vbwd-pagination-active": page === __props.currentPage }]),
              "aria-current": page === __props.currentPage ? "page" : void 0,
              onClick: ($event) => goToPage(page)
            }, vue.toDisplayString(page), 11, _hoisted_4$6))
          ], 64);
        }), 128)),
        vue.createElementVNode("button", {
          class: "vbwd-pagination-btn vbwd-pagination-next",
          disabled: __props.currentPage >= __props.totalPages,
          onClick: _cache[1] || (_cache[1] = ($event) => goToPage(__props.currentPage + 1)),
          "aria-label": "Next page"
        }, [..._cache[3] || (_cache[3] = [
          vue.createElementVNode("svg", {
            width: "16",
            height: "16",
            viewBox: "0 0 20 20",
            fill: "currentColor"
          }, [
            vue.createElementVNode("path", {
              "fill-rule": "evenodd",
              d: "M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z",
              "clip-rule": "evenodd"
            })
          ], -1)
        ])], 8, _hoisted_5$4)
      ]);
    };
  }
});
const Pagination = /* @__PURE__ */ _export_sfc(_sfc_main$d, [["__scopeId", "data-v-939ce8f2"]]);
const _hoisted_1$9 = { class: "vbwd-table-wrapper" };
const _hoisted_2$9 = { key: 0 };
const _hoisted_3$5 = ["onClick"];
const _hoisted_4$5 = { class: "vbwd-table-th-content" };
const _hoisted_5$3 = {
  key: 0,
  class: "vbwd-table-sort-icon"
};
const _hoisted_6$3 = {
  key: 0,
  width: "12",
  height: "12",
  viewBox: "0 0 12 12",
  fill: "currentColor"
};
const _hoisted_7$2 = {
  key: 0,
  d: "M6 2L10 8H2L6 2Z"
};
const _hoisted_8$1 = {
  key: 1,
  d: "M6 10L2 4H10L6 10Z"
};
const _hoisted_9$1 = {
  key: 1,
  width: "12",
  height: "12",
  viewBox: "0 0 12 12",
  fill: "currentColor",
  opacity: "0.3"
};
const _hoisted_10 = { key: 0 };
const _hoisted_11 = ["colspan"];
const _hoisted_12 = { key: 1 };
const _hoisted_13 = ["colspan"];
const _sfc_main$c = /* @__PURE__ */ vue.defineComponent({
  __name: "Table",
  props: {
    columns: { default: () => [] },
    data: { default: () => [] },
    rowKey: {},
    striped: { type: Boolean, default: false },
    hoverable: { type: Boolean, default: true },
    loading: { type: Boolean, default: false }
  },
  emits: ["sort"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    const sortKey = vue.ref(null);
    const sortOrder = vue.ref("asc");
    const handleSort = (key) => {
      if (sortKey.value === key) {
        sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
      } else {
        sortKey.value = key;
        sortOrder.value = "asc";
      }
      emit("sort", key, sortOrder.value);
    };
    return (_ctx, _cache) => {
      return vue.openBlock(), vue.createElementBlock("div", _hoisted_1$9, [
        vue.createElementVNode("table", {
          class: vue.normalizeClass(["vbwd-table", { "vbwd-table-striped": __props.striped, "vbwd-table-hoverable": __props.hoverable }])
        }, [
          __props.columns.length ? (vue.openBlock(), vue.createElementBlock("thead", _hoisted_2$9, [
            vue.createElementVNode("tr", null, [
              (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(__props.columns, (col) => {
                return vue.openBlock(), vue.createElementBlock("th", {
                  key: col.key,
                  class: vue.normalizeClass([
                    "vbwd-table-th",
                    col.align ? `vbwd-table-align-${col.align}` : "",
                    { "vbwd-table-sortable": col.sortable }
                  ]),
                  style: vue.normalizeStyle(col.width ? { width: col.width } : {}),
                  onClick: ($event) => col.sortable && handleSort(col.key)
                }, [
                  vue.createElementVNode("span", _hoisted_4$5, [
                    vue.createTextVNode(vue.toDisplayString(col.label) + " ", 1),
                    col.sortable ? (vue.openBlock(), vue.createElementBlock("span", _hoisted_5$3, [
                      sortKey.value === col.key ? (vue.openBlock(), vue.createElementBlock("svg", _hoisted_6$3, [
                        sortOrder.value === "asc" ? (vue.openBlock(), vue.createElementBlock("path", _hoisted_7$2)) : (vue.openBlock(), vue.createElementBlock("path", _hoisted_8$1))
                      ])) : (vue.openBlock(), vue.createElementBlock("svg", _hoisted_9$1, [..._cache[0] || (_cache[0] = [
                        vue.createElementVNode("path", { d: "M6 2L10 6H2L6 2ZM6 10L2 6H10L6 10Z" }, null, -1)
                      ])]))
                    ])) : vue.createCommentVNode("", true)
                  ])
                ], 14, _hoisted_3$5);
              }), 128))
            ])
          ])) : vue.createCommentVNode("", true),
          vue.createElementVNode("tbody", null, [
            __props.loading ? (vue.openBlock(), vue.createElementBlock("tr", _hoisted_10, [
              vue.createElementVNode("td", {
                colspan: __props.columns.length,
                class: "vbwd-table-loading"
              }, [
                vue.renderSlot(_ctx.$slots, "loading", {}, () => [
                  _cache[1] || (_cache[1] = vue.createTextVNode("Loading...", -1))
                ], true)
              ], 8, _hoisted_11)
            ])) : !__props.data.length ? (vue.openBlock(), vue.createElementBlock("tr", _hoisted_12, [
              vue.createElementVNode("td", {
                colspan: __props.columns.length,
                class: "vbwd-table-empty"
              }, [
                vue.renderSlot(_ctx.$slots, "empty", {}, () => [
                  _cache[2] || (_cache[2] = vue.createTextVNode("No data available", -1))
                ], true)
              ], 8, _hoisted_13)
            ])) : (vue.openBlock(true), vue.createElementBlock(vue.Fragment, { key: 2 }, vue.renderList(__props.data, (row, index) => {
              return vue.openBlock(), vue.createElementBlock("tr", {
                key: __props.rowKey ? row[__props.rowKey] : index
              }, [
                (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(__props.columns, (col) => {
                  return vue.openBlock(), vue.createElementBlock("td", {
                    key: col.key,
                    class: vue.normalizeClass(["vbwd-table-td", col.align ? `vbwd-table-align-${col.align}` : ""])
                  }, [
                    vue.renderSlot(_ctx.$slots, `cell-${col.key}`, {
                      row,
                      value: row[col.key],
                      index
                    }, () => [
                      vue.createTextVNode(vue.toDisplayString(row[col.key]), 1)
                    ], true)
                  ], 2);
                }), 128))
              ]);
            }), 128))
          ])
        ], 2)
      ]);
    };
  }
});
const Table = /* @__PURE__ */ _export_sfc(_sfc_main$c, [["__scopeId", "data-v-aa02112d"]]);
const _hoisted_1$8 = {
  key: 0,
  class: "vbwd-form-field-asterisk"
};
const _hoisted_2$8 = { class: "vbwd-form-field-control" };
const _hoisted_3$4 = {
  key: 1,
  class: "vbwd-form-field-error-text"
};
const _hoisted_4$4 = {
  key: 2,
  class: "vbwd-form-field-hint"
};
const _sfc_main$b = /* @__PURE__ */ vue.defineComponent({
  __name: "FormField",
  props: {
    label: {},
    hint: {},
    error: {},
    required: { type: Boolean, default: false }
  },
  setup(__props) {
    let idCounter = 0;
    const fieldId = `vbwd-field-${++idCounter}`;
    return (_ctx, _cache) => {
      return vue.openBlock(), vue.createElementBlock("div", {
        class: vue.normalizeClass(["vbwd-form-field", { "vbwd-form-field-error": __props.error, "vbwd-form-field-required": __props.required }])
      }, [
        __props.label ? (vue.openBlock(), vue.createElementBlock("label", {
          key: 0,
          for: fieldId,
          class: "vbwd-form-field-label"
        }, [
          vue.createTextVNode(vue.toDisplayString(__props.label) + " ", 1),
          __props.required ? (vue.openBlock(), vue.createElementBlock("span", _hoisted_1$8, "*")) : vue.createCommentVNode("", true)
        ])) : vue.createCommentVNode("", true),
        vue.createElementVNode("div", _hoisted_2$8, [
          vue.renderSlot(_ctx.$slots, "default", {
            id: fieldId,
            error: __props.error
          }, void 0, true)
        ]),
        __props.error ? (vue.openBlock(), vue.createElementBlock("p", _hoisted_3$4, vue.toDisplayString(__props.error), 1)) : __props.hint ? (vue.openBlock(), vue.createElementBlock("p", _hoisted_4$4, vue.toDisplayString(__props.hint), 1)) : vue.createCommentVNode("", true)
      ], 2);
    };
  }
});
const FormField = /* @__PURE__ */ _export_sfc(_sfc_main$b, [["__scopeId", "data-v-65b44107"]]);
const _hoisted_1$7 = {
  key: 0,
  class: "vbwd-form-group-title"
};
const _hoisted_2$7 = {
  key: 1,
  class: "vbwd-form-group-description"
};
const _sfc_main$a = /* @__PURE__ */ vue.defineComponent({
  __name: "FormGroup",
  props: {
    title: {},
    description: {},
    layout: { default: "vertical" },
    bordered: { type: Boolean, default: false }
  },
  setup(__props) {
    return (_ctx, _cache) => {
      return vue.openBlock(), vue.createElementBlock("fieldset", {
        class: vue.normalizeClass(["vbwd-form-group", { "vbwd-form-group-bordered": __props.bordered }])
      }, [
        __props.title ? (vue.openBlock(), vue.createElementBlock("legend", _hoisted_1$7, vue.toDisplayString(__props.title), 1)) : vue.createCommentVNode("", true),
        __props.description ? (vue.openBlock(), vue.createElementBlock("p", _hoisted_2$7, vue.toDisplayString(__props.description), 1)) : vue.createCommentVNode("", true),
        vue.createElementVNode("div", {
          class: vue.normalizeClass(["vbwd-form-group-fields", `vbwd-form-group-${__props.layout}`])
        }, [
          vue.renderSlot(_ctx.$slots, "default", {}, void 0, true)
        ], 2)
      ], 2);
    };
  }
});
const FormGroup = /* @__PURE__ */ _export_sfc(_sfc_main$a, [["__scopeId", "data-v-b15a233a"]]);
const _hoisted_1$6 = {
  key: 0,
  class: "vbwd-form-error"
};
const _hoisted_2$6 = { class: "vbwd-form-error-content" };
const _hoisted_3$3 = {
  key: 0,
  class: "vbwd-form-error-title"
};
const _hoisted_4$3 = { class: "vbwd-form-error-list" };
const _sfc_main$9 = /* @__PURE__ */ vue.defineComponent({
  __name: "FormError",
  props: {
    errors: { default: () => [] },
    title: { default: "Please fix the following errors:" }
  },
  setup(__props) {
    return (_ctx, _cache) => {
      return __props.errors.length ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_1$6, [
        _cache[0] || (_cache[0] = vue.createElementVNode("div", { class: "vbwd-form-error-icon" }, [
          vue.createElementVNode("svg", {
            width: "20",
            height: "20",
            viewBox: "0 0 20 20",
            fill: "currentColor"
          }, [
            vue.createElementVNode("path", {
              "fill-rule": "evenodd",
              d: "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z",
              "clip-rule": "evenodd"
            })
          ])
        ], -1)),
        vue.createElementVNode("div", _hoisted_2$6, [
          __props.title ? (vue.openBlock(), vue.createElementBlock("h4", _hoisted_3$3, vue.toDisplayString(__props.title), 1)) : vue.createCommentVNode("", true),
          vue.createElementVNode("ul", _hoisted_4$3, [
            (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(__props.errors, (error, index) => {
              return vue.openBlock(), vue.createElementBlock("li", { key: index }, vue.toDisplayString(error), 1);
            }), 128))
          ])
        ])
      ])) : vue.createCommentVNode("", true);
    };
  }
});
const FormError = /* @__PURE__ */ _export_sfc(_sfc_main$9, [["__scopeId", "data-v-7e76f4e4"]]);
const _sfc_main$8 = /* @__PURE__ */ vue.defineComponent({
  __name: "Container",
  props: {
    fluid: { type: Boolean, default: false }
  },
  setup(__props) {
    return (_ctx, _cache) => {
      return vue.openBlock(), vue.createElementBlock("div", {
        class: vue.normalizeClass(["vbwd-container", { "vbwd-container-fluid": __props.fluid }])
      }, [
        vue.renderSlot(_ctx.$slots, "default", {}, void 0, true)
      ], 2);
    };
  }
});
const Container = /* @__PURE__ */ _export_sfc(_sfc_main$8, [["__scopeId", "data-v-282e6973"]]);
const _sfc_main$7 = /* @__PURE__ */ vue.defineComponent({
  __name: "Row",
  props: {
    gap: { default: "1rem" },
    align: { default: "stretch" },
    justify: { default: "start" },
    noWrap: { type: Boolean, default: false }
  },
  setup(__props) {
    const props = __props;
    const gapStyle = vue.computed(() => {
      const gap = typeof props.gap === "number" ? `${props.gap}px` : props.gap;
      return { gap };
    });
    return (_ctx, _cache) => {
      return vue.openBlock(), vue.createElementBlock("div", {
        class: vue.normalizeClass([
          "vbwd-row",
          `vbwd-row-align-${__props.align}`,
          `vbwd-row-justify-${__props.justify}`,
          { "vbwd-row-nowrap": __props.noWrap }
        ]),
        style: vue.normalizeStyle(gapStyle.value)
      }, [
        vue.renderSlot(_ctx.$slots, "default", {}, void 0, true)
      ], 6);
    };
  }
});
const Row = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["__scopeId", "data-v-f82a9ba1"]]);
const _sfc_main$6 = /* @__PURE__ */ vue.defineComponent({
  __name: "Col",
  props: {
    span: { default: "auto" },
    sm: {},
    md: {},
    lg: {},
    xl: {},
    offset: {},
    order: {}
  },
  setup(__props) {
    const props = __props;
    const colClasses = vue.computed(() => {
      const classes = ["vbwd-col"];
      if (props.span !== "auto") {
        classes.push(`vbwd-col-${props.span}`);
      } else {
        classes.push("vbwd-col-auto");
      }
      if (props.sm) classes.push(`vbwd-col-sm-${props.sm}`);
      if (props.md) classes.push(`vbwd-col-md-${props.md}`);
      if (props.lg) classes.push(`vbwd-col-lg-${props.lg}`);
      if (props.xl) classes.push(`vbwd-col-xl-${props.xl}`);
      return classes;
    });
    const colStyle = vue.computed(() => {
      const style = {};
      if (props.offset) {
        style.marginLeft = `${props.offset / 12 * 100}%`;
      }
      if (props.order !== void 0) {
        style.order = String(props.order);
      }
      return style;
    });
    return (_ctx, _cache) => {
      return vue.openBlock(), vue.createElementBlock("div", {
        class: vue.normalizeClass(colClasses.value),
        style: vue.normalizeStyle(colStyle.value)
      }, [
        vue.renderSlot(_ctx.$slots, "default", {}, void 0, true)
      ], 6);
    };
  }
});
const Col = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["__scopeId", "data-v-2bedd799"]]);
const planName = vue.ref(null);
const features = vue.ref([]);
const usage = vue.ref({});
const isActive = vue.ref(false);
function useSubscriptionStore() {
  const hasFeature = (featureName) => {
    return features.value.includes(featureName);
  };
  const getUsage = (featureName) => {
    return usage.value[featureName] || null;
  };
  const isWithinLimit = (featureName, amount = 1) => {
    const featureUsage = usage.value[featureName];
    if (!featureUsage) return true;
    return featureUsage.remaining >= amount;
  };
  const setSubscription = (data) => {
    if (data.planName !== void 0) planName.value = data.planName;
    if (data.features !== void 0) features.value = data.features;
    if (data.usage !== void 0) usage.value = data.usage;
    if (data.isActive !== void 0) isActive.value = data.isActive;
  };
  const updateUsage = (featureName, newUsage) => {
    usage.value = {
      ...usage.value,
      [featureName]: newUsage
    };
  };
  const clearSubscription = () => {
    planName.value = null;
    features.value = [];
    usage.value = {};
    isActive.value = false;
  };
  return {
    // State
    planName: vue.computed(() => planName.value),
    features: vue.computed(() => features.value),
    usage: vue.computed(() => usage.value),
    isActive: vue.computed(() => isActive.value),
    // Getters
    hasFeature,
    getUsage,
    isWithinLimit,
    // Actions
    setSubscription,
    updateUsage,
    clearSubscription
  };
}
function useFeatureAccess() {
  const subscription = useSubscriptionStore();
  const canAccess = (featureName) => {
    return subscription.hasFeature(featureName);
  };
  const getUsage = (featureName) => {
    return subscription.getUsage(featureName) || {
      limit: 0,
      used: 0,
      remaining: 0
    };
  };
  const isWithinLimit = (featureName, amount = 1) => {
    return subscription.isWithinLimit(featureName, amount);
  };
  const hasActiveSubscription = vue.computed(() => subscription.isActive.value);
  const planName2 = vue.computed(() => subscription.planName.value);
  return {
    // Methods
    canAccess,
    getUsage,
    isWithinLimit,
    // Computed
    features: vue.computed(() => subscription.features.value),
    usage: vue.computed(() => subscription.usage.value),
    hasActiveSubscription,
    planName: planName2
  };
}
const _hoisted_1$5 = { class: "vbwd-feature-locked" };
const _hoisted_2$5 = { class: "vbwd-feature-locked-text" };
const _sfc_main$5 = /* @__PURE__ */ vue.defineComponent({
  __name: "FeatureGate",
  props: {
    feature: {},
    requiredPlan: {},
    showUpgradeButton: { type: Boolean, default: true }
  },
  emits: ["upgrade"],
  setup(__props) {
    const props = __props;
    const { canAccess } = useFeatureAccess();
    const hasAccess = vue.computed(() => canAccess(props.feature));
    return (_ctx, _cache) => {
      return hasAccess.value ? vue.renderSlot(_ctx.$slots, "default", { key: 0 }, void 0, true) : vue.renderSlot(_ctx.$slots, "fallback", { key: 1 }, () => [
        vue.createElementVNode("div", _hoisted_1$5, [
          _cache[1] || (_cache[1] = vue.createElementVNode("div", { class: "vbwd-feature-locked-icon" }, [
            vue.createElementVNode("svg", {
              width: "24",
              height: "24",
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor",
              "stroke-width": "2"
            }, [
              vue.createElementVNode("rect", {
                x: "3",
                y: "11",
                width: "18",
                height: "11",
                rx: "2",
                ry: "2"
              }),
              vue.createElementVNode("path", { d: "M7 11V7a5 5 0 0 1 10 0v4" })
            ])
          ], -1)),
          vue.createElementVNode("p", _hoisted_2$5, " This feature requires " + vue.toDisplayString(__props.requiredPlan || "an upgraded") + " plan ", 1),
          __props.showUpgradeButton ? (vue.openBlock(), vue.createElementBlock("button", {
            key: 0,
            class: "vbwd-btn vbwd-btn-primary",
            onClick: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("upgrade"))
          }, " Upgrade Now ")) : vue.createCommentVNode("", true)
        ])
      ], true);
    };
  }
});
const FeatureGate = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["__scopeId", "data-v-9e1bc63d"]]);
const _hoisted_1$4 = { class: "vbwd-usage-header" };
const _hoisted_2$4 = { class: "vbwd-usage-label" };
const _hoisted_3$2 = { class: "vbwd-usage-count" };
const _hoisted_4$2 = {
  key: 0,
  class: "vbwd-usage-bar"
};
const _hoisted_5$2 = {
  key: 1,
  class: "vbwd-usage-exceeded-text"
};
const _hoisted_6$2 = {
  key: 2,
  class: "vbwd-usage-warning-text"
};
const _sfc_main$4 = /* @__PURE__ */ vue.defineComponent({
  __name: "UsageLimit",
  props: {
    feature: {},
    label: {},
    warningThreshold: { default: 0.8 },
    warningMessage: {},
    exceededMessage: {}
  },
  setup(__props) {
    const props = __props;
    const { getUsage } = useFeatureAccess();
    const usage2 = vue.computed(() => getUsage(props.feature));
    const used = vue.computed(() => usage2.value.used);
    const limit = vue.computed(() => usage2.value.limit);
    vue.computed(() => usage2.value.remaining);
    const percentage = vue.computed(() => {
      if (limit.value === 0) return 0;
      return Math.min(100, used.value / limit.value * 100);
    });
    const isNearLimit = vue.computed(() => {
      if (limit.value === 0) return false;
      return percentage.value >= props.warningThreshold * 100 && percentage.value < 100;
    });
    const isExceeded = vue.computed(() => {
      if (limit.value === 0) return false;
      return percentage.value >= 100;
    });
    return (_ctx, _cache) => {
      return vue.openBlock(), vue.createElementBlock("div", {
        class: vue.normalizeClass(["vbwd-usage-limit", { "vbwd-usage-warning": isNearLimit.value, "vbwd-usage-exceeded": isExceeded.value }])
      }, [
        vue.createElementVNode("div", _hoisted_1$4, [
          vue.createElementVNode("span", _hoisted_2$4, vue.toDisplayString(__props.label || __props.feature), 1),
          vue.createElementVNode("span", _hoisted_3$2, vue.toDisplayString(used.value) + " / " + vue.toDisplayString(limit.value === 0 ? "∞" : limit.value), 1)
        ]),
        limit.value > 0 ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_4$2, [
          vue.createElementVNode("div", {
            class: "vbwd-usage-progress",
            style: vue.normalizeStyle({ width: percentage.value + "%" })
          }, null, 4)
        ])) : vue.createCommentVNode("", true),
        isExceeded.value ? (vue.openBlock(), vue.createElementBlock("p", _hoisted_5$2, vue.toDisplayString(__props.exceededMessage || "Limit exceeded"), 1)) : isNearLimit.value ? (vue.openBlock(), vue.createElementBlock("p", _hoisted_6$2, vue.toDisplayString(__props.warningMessage || "Approaching limit"), 1)) : vue.createCommentVNode("", true)
      ], 2);
    };
  }
});
const UsageLimit = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["__scopeId", "data-v-29d8f39c"]]);
const _hoisted_1$3 = ["aria-label"];
const _hoisted_2$3 = {
  key: 0,
  class: "vbwd-cart-icon-badge",
  "data-testid": "cart-icon-badge"
};
const _sfc_main$3 = /* @__PURE__ */ vue.defineComponent({
  __name: "CartIcon",
  props: {
    count: {}
  },
  emits: ["click"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    return (_ctx, _cache) => {
      return vue.openBlock(), vue.createElementBlock("button", {
        type: "button",
        class: "vbwd-cart-icon",
        "data-testid": "cart-icon",
        onClick: _cache[0] || (_cache[0] = ($event) => emit("click")),
        "aria-label": `Shopping cart with ${__props.count} items`
      }, [
        vue.renderSlot(_ctx.$slots, "icon", {}, () => [
          _cache[1] || (_cache[1] = vue.createElementVNode("svg", {
            class: "vbwd-cart-icon-svg",
            width: "24",
            height: "24",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            "stroke-width": "2"
          }, [
            vue.createElementVNode("circle", {
              cx: "9",
              cy: "21",
              r: "1"
            }),
            vue.createElementVNode("circle", {
              cx: "20",
              cy: "21",
              r: "1"
            }),
            vue.createElementVNode("path", { d: "M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" })
          ], -1))
        ], true),
        __props.count > 0 ? (vue.openBlock(), vue.createElementBlock("span", _hoisted_2$3, vue.toDisplayString(__props.count > 99 ? "99+" : __props.count), 1)) : vue.createCommentVNode("", true)
      ], 8, _hoisted_1$3);
    };
  }
});
const CartIcon = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["__scopeId", "data-v-9bcdbe98"]]);
const _hoisted_1$2 = {
  class: "vbwd-cart-item",
  "data-testid": "cart-item"
};
const _hoisted_2$2 = { class: "vbwd-cart-item-info" };
const _hoisted_3$1 = {
  class: "vbwd-cart-item-name",
  "data-testid": "cart-item-name"
};
const _hoisted_4$1 = {
  class: "vbwd-cart-item-type",
  "data-testid": "cart-item-type"
};
const _hoisted_5$1 = { class: "vbwd-cart-item-details" };
const _hoisted_6$1 = { class: "vbwd-cart-item-quantity" };
const _hoisted_7$1 = ["disabled"];
const _hoisted_8 = {
  class: "vbwd-cart-item-qty-value",
  "data-testid": "cart-item-quantity"
};
const _hoisted_9 = {
  class: "vbwd-cart-item-price",
  "data-testid": "cart-item-price"
};
const _sfc_main$2 = /* @__PURE__ */ vue.defineComponent({
  __name: "CartItem",
  props: {
    item: {}
  },
  emits: ["increase", "decrease", "remove"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    function formatType(type) {
      const labels = {
        plan: "Plan",
        token_bundle: "Tokens",
        addon: "Add-on"
      };
      return labels[type] || type;
    }
    function formatPrice(price) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
      }).format(price);
    }
    return (_ctx, _cache) => {
      return vue.openBlock(), vue.createElementBlock("div", _hoisted_1$2, [
        vue.createElementVNode("div", _hoisted_2$2, [
          vue.createElementVNode("span", _hoisted_3$1, vue.toDisplayString(__props.item.name), 1),
          vue.createElementVNode("span", _hoisted_4$1, vue.toDisplayString(formatType(__props.item.type)), 1)
        ]),
        vue.createElementVNode("div", _hoisted_5$1, [
          vue.createElementVNode("div", _hoisted_6$1, [
            vue.createElementVNode("button", {
              type: "button",
              class: "vbwd-cart-item-qty-btn",
              "data-testid": "cart-item-decrease",
              disabled: __props.item.quantity <= 1,
              onClick: _cache[0] || (_cache[0] = ($event) => emit("decrease"))
            }, " - ", 8, _hoisted_7$1),
            vue.createElementVNode("span", _hoisted_8, vue.toDisplayString(__props.item.quantity), 1),
            vue.createElementVNode("button", {
              type: "button",
              class: "vbwd-cart-item-qty-btn",
              "data-testid": "cart-item-increase",
              onClick: _cache[1] || (_cache[1] = ($event) => emit("increase"))
            }, " + ")
          ]),
          vue.createElementVNode("span", _hoisted_9, vue.toDisplayString(formatPrice(__props.item.price * __props.item.quantity)), 1),
          vue.createElementVNode("button", {
            type: "button",
            class: "vbwd-cart-item-remove",
            "data-testid": "cart-item-remove",
            onClick: _cache[2] || (_cache[2] = ($event) => emit("remove")),
            "aria-label": "Remove item"
          }, [..._cache[3] || (_cache[3] = [
            vue.createElementVNode("svg", {
              width: "16",
              height: "16",
              viewBox: "0 0 20 20",
              fill: "currentColor"
            }, [
              vue.createElementVNode("path", {
                "fill-rule": "evenodd",
                d: "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z",
                "clip-rule": "evenodd"
              })
            ], -1)
          ])])
        ])
      ]);
    };
  }
});
const CartItem = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__scopeId", "data-v-8dc99341"]]);
const _hoisted_1$1 = {
  class: "vbwd-cart-empty",
  "data-testid": "cart-empty"
};
const _hoisted_2$1 = {
  class: "vbwd-cart-empty-text",
  "data-testid": "cart-empty-message"
};
const _sfc_main$1 = /* @__PURE__ */ vue.defineComponent({
  __name: "CartEmpty",
  props: {
    message: { default: "Your cart is empty" }
  },
  setup(__props) {
    return (_ctx, _cache) => {
      return vue.openBlock(), vue.createElementBlock("div", _hoisted_1$1, [
        vue.renderSlot(_ctx.$slots, "icon", {}, () => [
          _cache[0] || (_cache[0] = vue.createElementVNode("svg", {
            class: "vbwd-cart-empty-icon",
            width: "48",
            height: "48",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            "stroke-width": "1.5"
          }, [
            vue.createElementVNode("circle", {
              cx: "9",
              cy: "21",
              r: "1"
            }),
            vue.createElementVNode("circle", {
              cx: "20",
              cy: "21",
              r: "1"
            }),
            vue.createElementVNode("path", { d: "M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" })
          ], -1))
        ], true),
        vue.createElementVNode("p", _hoisted_2$1, [
          vue.renderSlot(_ctx.$slots, "default", {}, () => [
            vue.createTextVNode(vue.toDisplayString(__props.message), 1)
          ], true)
        ]),
        vue.renderSlot(_ctx.$slots, "action", {}, void 0, true)
      ]);
    };
  }
});
const CartEmpty = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-320b03d4"]]);
const STORAGE_KEY = "vbwd_cart";
function loadFromStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
  }
  return [];
}
function saveToStorage(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
  }
}
const useCartStore = pinia.defineStore("cart", () => {
  const items = vue.ref(loadFromStorage());
  const itemCount = vue.computed(
    () => items.value.reduce((sum, item) => sum + item.quantity, 0)
  );
  const total = vue.computed(
    () => items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  );
  const isEmpty = vue.computed(() => items.value.length === 0);
  function addItem(input) {
    const existingIndex = items.value.findIndex(
      (item) => item.id === input.id && item.type === input.type
    );
    if (existingIndex >= 0) {
      items.value[existingIndex].quantity += 1;
    } else {
      items.value.push({
        ...input,
        quantity: 1
      });
    }
  }
  function removeItem(id) {
    const index = items.value.findIndex((item) => item.id === id);
    if (index >= 0) {
      items.value.splice(index, 1);
    }
  }
  function updateQuantity(id, quantity) {
    const index = items.value.findIndex((item) => item.id === id);
    if (index >= 0) {
      if (quantity <= 0) {
        items.value.splice(index, 1);
      } else {
        items.value[index].quantity = quantity;
      }
    }
  }
  function clearCart() {
    items.value = [];
  }
  function getItemById(id) {
    return items.value.find((item) => item.id === id);
  }
  function getItemsByType(type) {
    return items.value.filter((item) => item.type === type);
  }
  vue.watch(
    items,
    (newItems) => {
      saveToStorage(newItems);
    },
    { deep: true }
  );
  return {
    // State
    items,
    // Getters
    itemCount,
    total,
    isEmpty,
    // Actions
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItemById,
    getItemsByType
  };
});
function createCartStore(storageKey = STORAGE_KEY) {
  return pinia.defineStore(`cart-${storageKey}`, () => {
    const items = vue.ref([]);
    const itemCount = vue.computed(
      () => items.value.reduce((sum, item) => sum + item.quantity, 0)
    );
    const total = vue.computed(
      () => items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
    );
    const isEmpty = vue.computed(() => items.value.length === 0);
    function addItem(input) {
      const existingIndex = items.value.findIndex(
        (item) => item.id === input.id && item.type === input.type
      );
      if (existingIndex >= 0) {
        items.value[existingIndex].quantity += 1;
      } else {
        items.value.push({ ...input, quantity: 1 });
      }
    }
    function removeItem(id) {
      const index = items.value.findIndex((item) => item.id === id);
      if (index >= 0) {
        items.value.splice(index, 1);
      }
    }
    function updateQuantity(id, quantity) {
      const index = items.value.findIndex((item) => item.id === id);
      if (index >= 0) {
        if (quantity <= 0) {
          items.value.splice(index, 1);
        } else {
          items.value[index].quantity = quantity;
        }
      }
    }
    function clearCart() {
      items.value = [];
    }
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        items.value = JSON.parse(saved);
      }
    } catch {
    }
    vue.watch(
      items,
      (newItems) => {
        try {
          localStorage.setItem(storageKey, JSON.stringify(newItems));
        } catch {
        }
      },
      { deep: true }
    );
    return {
      items,
      itemCount,
      total,
      isEmpty,
      addItem,
      removeItem,
      updateQuantity,
      clearCart
    };
  });
}
const _hoisted_1 = { class: "vbwd-cart-dropdown-header" };
const _hoisted_2 = {
  class: "vbwd-cart-dropdown-count",
  "data-testid": "cart-dropdown-count"
};
const _hoisted_3 = { class: "vbwd-cart-dropdown-content" };
const _hoisted_4 = {
  key: 1,
  class: "vbwd-cart-dropdown-items",
  "data-testid": "cart-dropdown-items"
};
const _hoisted_5 = {
  key: 0,
  class: "vbwd-cart-dropdown-footer"
};
const _hoisted_6 = { class: "vbwd-cart-dropdown-total" };
const _hoisted_7 = {
  class: "vbwd-cart-dropdown-total-value",
  "data-testid": "cart-dropdown-total"
};
const _sfc_main = /* @__PURE__ */ vue.defineComponent({
  __name: "CartDropdown",
  props: {
    placement: { default: "bottom-end" }
  },
  emits: ["checkout", "clear"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    const cartStore = useCartStore();
    const { items, itemCount, total, isEmpty } = pinia.storeToRefs(cartStore);
    const { removeItem, updateQuantity, clearCart } = cartStore;
    const isOpen = vue.ref(false);
    const dropdownRef = vue.ref(null);
    const toggle = () => {
      isOpen.value = !isOpen.value;
    };
    const close = () => {
      isOpen.value = false;
    };
    const handleCheckout = () => {
      emit("checkout");
      close();
    };
    const handleClear = () => {
      clearCart();
      emit("clear");
    };
    function formatPrice(price) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
      }).format(price);
    }
    const handleClickOutside = (event) => {
      if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
        close();
      }
    };
    const handleEscape = (event) => {
      if (event.key === "Escape" && isOpen.value) {
        close();
      }
    };
    vue.onMounted(() => {
      document.addEventListener("click", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    });
    vue.onUnmounted(() => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    });
    return (_ctx, _cache) => {
      return vue.openBlock(), vue.createElementBlock("div", {
        class: "vbwd-cart-dropdown",
        ref_key: "dropdownRef",
        ref: dropdownRef,
        "data-testid": "cart-dropdown"
      }, [
        vue.createElementVNode("div", {
          class: "vbwd-cart-dropdown-trigger",
          onClick: toggle
        }, [
          vue.renderSlot(_ctx.$slots, "trigger", {}, () => [
            vue.createVNode(CartIcon, {
              count: vue.unref(itemCount),
              onClick: vue.withModifiers(toggle, ["stop"])
            }, null, 8, ["count"])
          ], true)
        ]),
        vue.createVNode(vue.Transition, { name: "vbwd-cart-dropdown" }, {
          default: vue.withCtx(() => [
            isOpen.value ? (vue.openBlock(), vue.createElementBlock("div", {
              key: 0,
              class: vue.normalizeClass(["vbwd-cart-dropdown-menu", `vbwd-cart-dropdown-${__props.placement}`]),
              "data-testid": "cart-dropdown-menu"
            }, [
              vue.createElementVNode("div", _hoisted_1, [
                _cache[0] || (_cache[0] = vue.createElementVNode("h3", { class: "vbwd-cart-dropdown-title" }, "Shopping Cart", -1)),
                vue.createElementVNode("span", _hoisted_2, vue.toDisplayString(vue.unref(itemCount)) + " " + vue.toDisplayString(vue.unref(itemCount) === 1 ? "item" : "items"), 1)
              ]),
              vue.createElementVNode("div", _hoisted_3, [
                vue.unref(isEmpty) ? (vue.openBlock(), vue.createBlock(CartEmpty, { key: 0 }, {
                  action: vue.withCtx(() => [
                    vue.renderSlot(_ctx.$slots, "empty-action", {}, void 0, true)
                  ]),
                  _: 3
                })) : (vue.openBlock(), vue.createElementBlock("div", _hoisted_4, [
                  (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(vue.unref(items), (item) => {
                    return vue.openBlock(), vue.createBlock(CartItem, {
                      key: `${item.type}-${item.id}`,
                      item,
                      onIncrease: ($event) => vue.unref(updateQuantity)(item.id, item.quantity + 1),
                      onDecrease: ($event) => vue.unref(updateQuantity)(item.id, item.quantity - 1),
                      onRemove: ($event) => vue.unref(removeItem)(item.id)
                    }, null, 8, ["item", "onIncrease", "onDecrease", "onRemove"]);
                  }), 128))
                ]))
              ]),
              !vue.unref(isEmpty) ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_5, [
                vue.createElementVNode("div", _hoisted_6, [
                  _cache[1] || (_cache[1] = vue.createElementVNode("span", null, "Total:", -1)),
                  vue.createElementVNode("span", _hoisted_7, vue.toDisplayString(formatPrice(vue.unref(total))), 1)
                ]),
                vue.createElementVNode("div", { class: "vbwd-cart-dropdown-actions" }, [
                  vue.createElementVNode("button", {
                    type: "button",
                    class: "vbwd-cart-dropdown-btn vbwd-cart-dropdown-btn-secondary",
                    "data-testid": "cart-clear",
                    onClick: handleClear
                  }, " Clear "),
                  vue.createElementVNode("button", {
                    type: "button",
                    class: "vbwd-cart-dropdown-btn vbwd-cart-dropdown-btn-primary",
                    "data-testid": "cart-checkout",
                    onClick: handleCheckout
                  }, " Checkout ")
                ])
              ])) : vue.createCommentVNode("", true)
            ], 2)) : vue.createCommentVNode("", true)
          ]),
          _: 3
        })
      ], 512);
    };
  }
});
const CartDropdown = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-5b63da9d"]]);
let storeConfig = null;
function configureAuthStore(config) {
  storeConfig = {
    loginEndpoint: "/auth/login",
    logoutEndpoint: "/auth/logout",
    refreshEndpoint: "/auth/refresh",
    profileEndpoint: "/auth/me",
    ...config,
    refreshStorageKey: config.refreshStorageKey || `${config.storageKey}_refresh`
  };
}
function getConfig() {
  if (!storeConfig) {
    throw new Error(
      "Auth store not configured. Call configureAuthStore() in main.ts before using useAuthStore()."
    );
  }
  return storeConfig;
}
const useAuthStore = pinia.defineStore("auth", {
  state: () => ({
    user: null,
    token: null,
    refreshToken: null,
    error: null,
    loading: false
  }),
  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
    isAdmin: (state) => {
      var _a2, _b;
      return ((_b = (_a2 = state.user) == null ? void 0 : _a2.roles) == null ? void 0 : _b.includes("ADMIN")) ?? false;
    },
    hasRole: (state) => {
      return (role) => {
        var _a2, _b;
        return ((_b = (_a2 = state.user) == null ? void 0 : _a2.roles) == null ? void 0 : _b.includes(role)) ?? false;
      };
    },
    hasAnyRole: (state) => {
      return (roles) => {
        var _a2;
        if (!((_a2 = state.user) == null ? void 0 : _a2.roles)) return false;
        return roles.some((role) => state.user.roles.includes(role));
      };
    },
    hasPermission: (state) => {
      return (permission) => {
        var _a2, _b;
        return ((_b = (_a2 = state.user) == null ? void 0 : _a2.permissions) == null ? void 0 : _b.includes(permission)) ?? false;
      };
    }
  },
  actions: {
    /**
     * Initialize auth state from localStorage.
     * Call this on app startup.
     */
    initAuth() {
      const config = getConfig();
      const token = localStorage.getItem(config.storageKey);
      const refreshToken = localStorage.getItem(config.refreshStorageKey);
      if (token) {
        this.token = token;
        this.refreshToken = refreshToken;
        config.apiClient.setToken(token);
      }
    },
    /**
     * Login with credentials.
     */
    async login(credentials) {
      var _a2;
      const config = getConfig();
      this.error = null;
      this.loading = true;
      try {
        const rawResponse = await config.apiClient.post(
          config.loginEndpoint,
          credentials
        );
        const response = rawResponse;
        this.token = response.token;
        this.refreshToken = response.refresh_token || null;
        this.user = response.user;
        if (typeof window !== "undefined") {
          window.__AUTH_DEBUG__ = {
            responseUser: response.user,
            stateUser: this.user,
            stateUserRoles: (_a2 = this.user) == null ? void 0 : _a2.roles,
            timestamp: (/* @__PURE__ */ new Date()).toISOString()
          };
        }
        if (this.token) {
          config.apiClient.setToken(this.token);
          localStorage.setItem(config.storageKey, this.token);
        }
        if (this.refreshToken) {
          localStorage.setItem(config.refreshStorageKey, this.refreshToken);
        }
        return response;
      } catch (error) {
        this.error = error.message || "Login failed";
        if (typeof window !== "undefined") {
          window.__AUTH_ERROR__ = {
            message: this.error,
            error: String(error),
            timestamp: (/* @__PURE__ */ new Date()).toISOString()
          };
          console.error("[AUTH STORE ERROR]", this.error, error);
        }
        throw error;
      } finally {
        this.loading = false;
      }
    },
    /**
     * Logout and clear all auth state.
     */
    async logout() {
      const config = getConfig();
      try {
        if (this.token) {
          await config.apiClient.post(config.logoutEndpoint).catch(() => {
          });
        }
      } finally {
        this.token = null;
        this.refreshToken = null;
        this.user = null;
        this.error = null;
        config.apiClient.clearToken();
        localStorage.removeItem(config.storageKey);
        localStorage.removeItem(config.refreshStorageKey);
      }
    },
    /**
     * Refresh the access token.
     */
    async refreshAccessToken() {
      const config = getConfig();
      if (!this.refreshToken) {
        throw new Error("No refresh token available");
      }
      try {
        const response = await config.apiClient.post(
          config.refreshEndpoint,
          { refresh_token: this.refreshToken }
        );
        this.token = response.token;
        config.apiClient.setToken(this.token);
        localStorage.setItem(config.storageKey, this.token);
        return this.token;
      } catch (error) {
        await this.logout();
        throw error;
      }
    },
    /**
     * Fetch current user profile.
     */
    async fetchProfile() {
      const config = getConfig();
      this.loading = true;
      try {
        const user = await config.apiClient.get(config.profileEndpoint);
        this.user = user;
        return user;
      } catch (error) {
        this.error = error.message || "Failed to fetch profile";
        throw error;
      } finally {
        this.loading = false;
      }
    },
    /**
     * Set user manually (for cases where login response includes user).
     */
    setUser(user) {
      this.user = user;
    },
    /**
     * Set token manually.
     */
    setToken(token) {
      const config = getConfig();
      this.token = token;
      if (token) {
        config.apiClient.setToken(token);
        localStorage.setItem(config.storageKey, token);
      } else {
        config.apiClient.clearToken();
        localStorage.removeItem(config.storageKey);
      }
    },
    /**
     * Clear error state.
     */
    clearError() {
      this.error = null;
    }
  }
});
const defaultOptions$1 = {
  loginRoute: "login",
  dashboardRoute: "dashboard"
};
function createAuthGuard(options = {}) {
  const opts = { ...defaultOptions$1, ...options };
  return function authGuard2(to, _from, next) {
    const auth = useAuthStore();
    if (to.meta.requiresAuth && !auth.isAuthenticated) {
      next({
        name: opts.loginRoute,
        query: { redirect: to.fullPath }
      });
      return;
    }
    if (to.meta.requiresGuest && auth.isAuthenticated) {
      next({ name: opts.dashboardRoute });
      return;
    }
    next();
  };
}
const authGuard = createAuthGuard();
const defaultOptions = {
  forbiddenRoute: "forbidden"
};
function createRoleGuard(options = {}) {
  const opts = { ...defaultOptions, ...options };
  return function roleGuard2(to, _from, next) {
    const auth = useAuthStore();
    const requiredRoles = to.meta.roles;
    if (!requiredRoles || requiredRoles.length === 0) {
      next();
      return;
    }
    if (auth.hasAnyRole(requiredRoles)) {
      next();
      return;
    }
    next({ name: opts.forbiddenRoute });
  };
}
const roleGuard = createRoleGuard();
function usePaymentRedirect(apiPrefix, api) {
  const loading = vue.ref(false);
  const error = vue.ref(null);
  const invoiceId = vue.ref(null);
  function readInvoiceFromQuery() {
    const id = new URLSearchParams(window.location.search).get("invoice") || null;
    invoiceId.value = id;
    return invoiceId.value;
  }
  async function createAndRedirect() {
    var _a2, _b;
    const id = invoiceId.value || readInvoiceFromQuery();
    if (!id) {
      error.value = "No invoice specified";
      return;
    }
    loading.value = true;
    error.value = null;
    try {
      const data = await api.post(`${apiPrefix}/create-session`, {
        invoice_id: id
      });
      const session_url = data.session_url;
      if (session_url) {
        window.location.href = session_url;
      } else {
        error.value = "No redirect URL received";
        loading.value = false;
      }
    } catch (e) {
      const err = e;
      error.value = ((_b = (_a2 = err == null ? void 0 : err.response) == null ? void 0 : _a2.data) == null ? void 0 : _b.error) || (err == null ? void 0 : err.message) || "Payment session failed";
      loading.value = false;
    }
  }
  return {
    loading,
    error,
    invoiceId,
    readInvoiceFromQuery,
    createAndRedirect
  };
}
function usePaymentStatus(apiPrefix, api, options = {}) {
  const { intervalMs = 2e3, maxAttempts = 15 } = options;
  const polling = vue.ref(false);
  const confirmed = vue.ref(false);
  const timedOut = vue.ref(false);
  const error = vue.ref(null);
  const statusData = vue.ref(null);
  const sessionId = vue.ref(null);
  let timer = null;
  let attempts = 0;
  function readSessionFromQuery() {
    const id = new URLSearchParams(window.location.search).get("session_id") || null;
    sessionId.value = id;
    return sessionId.value;
  }
  function stopPolling() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    polling.value = false;
  }
  async function pollOnce() {
    var _a2, _b;
    const id = sessionId.value;
    if (!id) return false;
    try {
      const data = await api.get(`${apiPrefix}/session-status/${id}`);
      statusData.value = data;
      const status = data == null ? void 0 : data.status;
      if (status === "complete" || status === "PAID") {
        confirmed.value = true;
        stopPolling();
        return true;
      }
    } catch (e) {
      const err = e;
      error.value = ((_b = (_a2 = err == null ? void 0 : err.response) == null ? void 0 : _a2.data) == null ? void 0 : _b.error) || (err == null ? void 0 : err.message) || "Status check failed";
      stopPolling();
      return true;
    }
    return false;
  }
  async function startPolling() {
    const id = sessionId.value || readSessionFromQuery();
    if (!id) {
      error.value = "No session ID";
      return;
    }
    polling.value = true;
    attempts = 0;
    if (await pollOnce()) return;
    timer = setInterval(async () => {
      attempts++;
      if (attempts >= maxAttempts) {
        timedOut.value = true;
        stopPolling();
        return;
      }
      await pollOnce();
    }, intervalMs);
  }
  vue.onUnmounted(stopPolling);
  return {
    polling,
    confirmed,
    timedOut,
    error,
    statusData,
    sessionId,
    readSessionFromQuery,
    startPolling,
    stopPolling
  };
}
const DEFAULT_CONFIG = {
  plugins: {}
};
function loadPluginConfig(configPath) {
  const absolutePath = path__namespace.resolve(configPath);
  if (!fs__namespace.existsSync(absolutePath)) {
    return { ...DEFAULT_CONFIG };
  }
  try {
    const content = fs__namespace.readFileSync(absolutePath, "utf-8");
    const config = JSON.parse(content);
    if (!config.plugins || typeof config.plugins !== "object") {
      console.warn("Invalid plugins.json structure, using default");
      return { ...DEFAULT_CONFIG };
    }
    return config;
  } catch (error) {
    console.warn("Failed to parse plugins.json, using default:", error);
    return { ...DEFAULT_CONFIG };
  }
}
function savePluginConfig(configPath, config) {
  const absolutePath = path__namespace.resolve(configPath);
  const content = JSON.stringify(config, null, 2);
  fs__namespace.writeFileSync(absolutePath, content, "utf-8");
}
function setPluginConfig(config, name2, pluginConfig) {
  return {
    ...config,
    plugins: {
      ...config.plugins,
      [name2]: pluginConfig
    }
  };
}
function removePluginConfig(config, name2) {
  const { [name2]: _, ...remainingPlugins } = config.plugins;
  return {
    ...config,
    plugins: remainingPlugins
  };
}
function ensurePluginsDir(pluginsDir) {
  const absolutePath = path__namespace.resolve(pluginsDir);
  if (!fs__namespace.existsSync(absolutePath)) {
    fs__namespace.mkdirSync(absolutePath, { recursive: true });
  }
}
const VERSION = "1.0.0";
class PluginManagerCLI {
  constructor(registry, options) {
    __publicField(this, "options");
    this.registry = registry;
    this.options = {
      pluginsDir: options.pluginsDir || "./src/plugins",
      configFile: options.configFile || "./plugins.json",
      registry: options.registry || ""
    };
  }
  /**
   * Run CLI with arguments
   */
  async run(args) {
    const [command, ...params] = args;
    switch (command) {
      case "list":
        return this.list();
      case "install":
        return this.install(params[0]);
      case "uninstall":
        return this.uninstall(params[0]);
      case "activate":
        return this.activate(params[0]);
      case "deactivate":
        return this.deactivate(params[0]);
      case "help":
      case "--help":
      case "-h":
        return this.help();
      case "version":
      case "--version":
      case "-v":
        return this.version();
      default:
        if (command) {
          console.error(`Unknown command: ${command}
`);
        }
        return this.help();
    }
  }
  /**
   * List all plugins with their status
   */
  async list() {
    console.log(`
VBWD Plugin Manager v${VERSION}
`);
    const config = loadPluginConfig(this.options.configFile);
    const registeredPlugins = this.registry.getAll();
    const allPlugins = /* @__PURE__ */ new Map();
    for (const [name2, pluginConfig] of Object.entries(config.plugins)) {
      allPlugins.set(name2, {
        name: name2,
        version: pluginConfig.version,
        status: pluginConfig.enabled ? "active" : "inactive",
        description: void 0
      });
    }
    for (const plugin of registeredPlugins) {
      const configPlugin = config.plugins[plugin.name];
      allPlugins.set(plugin.name, {
        name: plugin.name,
        version: plugin.version,
        status: this.getPluginStatus(plugin, configPlugin == null ? void 0 : configPlugin.enabled),
        description: plugin.description
      });
    }
    if (allPlugins.size === 0) {
      console.log("No plugins installed.\n");
      console.log('Use "plugin install <name>" to install a plugin.');
      return;
    }
    console.log(
      this.padEnd("NAME", 20) + this.padEnd("VERSION", 12) + this.padEnd("STATUS", 14) + "DESCRIPTION"
    );
    console.log("─".repeat(70));
    let activeCount = 0;
    let inactiveCount = 0;
    for (const plugin of allPlugins.values()) {
      if (plugin.status === "active") activeCount++;
      else inactiveCount++;
      console.log(
        this.padEnd(plugin.name, 20) + this.padEnd(plugin.version, 12) + this.padEnd(plugin.status, 14) + (plugin.description || "")
      );
    }
    console.log("─".repeat(70));
    console.log(`Total: ${allPlugins.size} plugins (${activeCount} active, ${inactiveCount} inactive)
`);
  }
  /**
   * Install a plugin
   */
  async install(name2) {
    if (!name2) {
      console.error("Error: Plugin name is required");
      console.log("Usage: plugin install <name>");
      return;
    }
    console.log(`
Installing ${name2}...`);
    const config = loadPluginConfig(this.options.configFile);
    if (config.plugins[name2]) {
      console.log(`Plugin "${name2}" is already installed.`);
      return;
    }
    ensurePluginsDir(this.options.pluginsDir);
    const pluginPath = path__namespace.resolve(this.options.pluginsDir, name2);
    if (name2.startsWith("@") || name2.startsWith("npm:")) {
      console.log("  Downloading package...");
      console.log("  NPM installation not yet implemented.");
      console.log("  Please copy the plugin to src/plugins/ manually.");
      return;
    }
    if (!fs__namespace.existsSync(pluginPath)) {
      console.error(`Error: Plugin directory not found at ${pluginPath}`);
      console.log("Please ensure the plugin is copied to the plugins directory.");
      return;
    }
    let version2 = "0.0.0";
    const packageJsonPath = path__namespace.join(pluginPath, "package.json");
    if (fs__namespace.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(fs__namespace.readFileSync(packageJsonPath, "utf-8"));
        version2 = packageJson.version || version2;
        console.log(`  Found plugin version: ${version2}`);
      } catch {
        console.log("  Could not read package.json, using default version");
      }
    }
    const newConfig = setPluginConfig(config, name2, {
      enabled: false,
      version: version2,
      installedAt: (/* @__PURE__ */ new Date()).toISOString(),
      source: "local"
    });
    savePluginConfig(this.options.configFile, newConfig);
    console.log(`  Installed to ${pluginPath}`);
    console.log(`  Updated ${this.options.configFile}`);
    console.log(`
Plugin installed successfully.`);
    console.log(`Run 'npm run plugin activate ${name2}' to enable.
`);
  }
  /**
   * Uninstall a plugin
   */
  async uninstall(name2) {
    if (!name2) {
      console.error("Error: Plugin name is required");
      console.log("Usage: plugin uninstall <name>");
      return;
    }
    console.log(`
Uninstalling ${name2}...`);
    const config = loadPluginConfig(this.options.configFile);
    if (!config.plugins[name2]) {
      console.error(`Error: Plugin "${name2}" is not installed.`);
      return;
    }
    if (config.plugins[name2].enabled) {
      console.log(`  Deactivating plugin first...`);
      await this.deactivate(name2);
    }
    const newConfig = removePluginConfig(config, name2);
    savePluginConfig(this.options.configFile, newConfig);
    console.log(`  Removed from ${this.options.configFile}`);
    console.log(`
Plugin uninstalled successfully.`);
    console.log(`Note: Plugin files in ${this.options.pluginsDir}/${name2} were not deleted.`);
    console.log(`Delete manually if needed.
`);
  }
  /**
   * Activate a plugin
   */
  async activate(name2) {
    if (!name2) {
      console.error("Error: Plugin name is required");
      console.log("Usage: plugin activate <name>");
      return;
    }
    console.log(`
Activating ${name2}...`);
    const config = loadPluginConfig(this.options.configFile);
    if (!config.plugins[name2]) {
      console.error(`Error: Plugin "${name2}" is not installed.`);
      console.log(`Run 'npm run plugin install ${name2}' first.`);
      return;
    }
    if (config.plugins[name2].enabled) {
      console.log(`Plugin "${name2}" is already active.`);
      return;
    }
    const newConfig = setPluginConfig(config, name2, {
      ...config.plugins[name2],
      enabled: true
    });
    savePluginConfig(this.options.configFile, newConfig);
    console.log(`  Updated ${this.options.configFile}`);
    console.log(`
Plugin activated successfully.`);
    console.log(`Restart the application to apply changes.
`);
  }
  /**
   * Deactivate a plugin
   */
  async deactivate(name2) {
    if (!name2) {
      console.error("Error: Plugin name is required");
      console.log("Usage: plugin deactivate <name>");
      return;
    }
    console.log(`
Deactivating ${name2}...`);
    const config = loadPluginConfig(this.options.configFile);
    if (!config.plugins[name2]) {
      console.error(`Error: Plugin "${name2}" is not installed.`);
      return;
    }
    if (!config.plugins[name2].enabled) {
      console.log(`Plugin "${name2}" is already inactive.`);
      return;
    }
    const newConfig = setPluginConfig(config, name2, {
      ...config.plugins[name2],
      enabled: false
    });
    savePluginConfig(this.options.configFile, newConfig);
    console.log(`  Updated ${this.options.configFile}`);
    console.log(`
Plugin deactivated successfully.`);
    console.log(`Restart the application to apply changes.
`);
  }
  /**
   * Show help
   */
  help() {
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
  version() {
    console.log(`VBWD Plugin Manager v${VERSION}`);
  }
  /**
   * Helper: Pad string to fixed length
   */
  padEnd(str, length) {
    return str.padEnd(length);
  }
  /**
   * Helper: Get plugin status string
   */
  getPluginStatus(plugin, enabled) {
    if (enabled === true || plugin.status === PluginStatus.ACTIVE) {
      return "active";
    }
    if (enabled === false || plugin.status === PluginStatus.INACTIVE) {
      return "inactive";
    }
    if (plugin.status === PluginStatus.INSTALLED) {
      return "inactive";
    }
    return "not-installed";
  }
}
const version = "0.1.0";
const name = "@vbwd/view-component";
exports.Alert = Alert;
exports.ApiClient = ApiClient;
exports.ApiError = ApiError;
exports.AppEvents = AppEvents;
exports.Badge = Badge;
exports.Button = Button;
exports.Card = Card;
exports.CartDropdown = CartDropdown;
exports.CartEmpty = CartEmpty;
exports.CartIcon = CartIcon;
exports.CartItem = CartItem;
exports.Col = Col;
exports.Container = Container;
exports.DetailField = DetailField;
exports.DetailGrid = DetailGrid;
exports.Dropdown = Dropdown;
exports.EventBus = EventBus;
exports.FeatureGate = FeatureGate;
exports.FormError = FormError;
exports.FormField = FormField;
exports.FormGroup = FormGroup;
exports.Input = Input;
exports.Modal = Modal;
exports.NetworkError = NetworkError;
exports.Pagination = Pagination;
exports.PlatformSDK = PlatformSDK;
exports.PluginManagerCLI = PluginManagerCLI;
exports.PluginRegistry = PluginRegistry;
exports.PluginStatus = PluginStatus;
exports.Row = Row;
exports.Spinner = Spinner;
exports.Table = Table;
exports.UsageLimit = UsageLimit;
exports.ValidationError = ValidationError;
exports.authGuard = authGuard;
exports.configureAuthStore = configureAuthStore;
exports.configureEventBus = configureEventBus;
exports.createAuthGuard = createAuthGuard;
exports.createCartStore = createCartStore;
exports.createRoleGuard = createRoleGuard;
exports.eventBus = eventBus;
exports.isValidSemver = isValidSemver;
exports.loadPluginConfig = loadPluginConfig;
exports.name = name;
exports.roleGuard = roleGuard;
exports.satisfiesVersion = satisfiesVersion;
exports.savePluginConfig = savePluginConfig;
exports.useAuthStore = useAuthStore;
exports.useCartStore = useCartStore;
exports.useFeatureAccess = useFeatureAccess;
exports.usePaymentRedirect = usePaymentRedirect;
exports.usePaymentStatus = usePaymentStatus;
exports.useSubscriptionStore = useSubscriptionStore;
exports.version = version;
//# sourceMappingURL=index.cjs.map
