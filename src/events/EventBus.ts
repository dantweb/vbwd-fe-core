/**
 * EventBus - Cross-component event communication for Vue apps
 *
 * A typed event bus that enables decoupled communication between components,
 * with support for automatic backend event delivery.
 */

import type { ApiClient } from '../api/ApiClient';

type EventCallback<T = unknown> = (payload: T) => void;

interface EventBusOptions {
  /** Enable debug logging */
  debug?: boolean;
  /** Maximum events to keep in history */
  maxHistory?: number;
  /** API client for backend event delivery */
  apiClient?: ApiClient;
  /** Backend endpoint for events (default: /events) */
  eventsEndpoint?: string;
  /** Enable automatic backend sending (default: true when apiClient is set) */
  autoSendToBackend?: boolean;
  /** Events to exclude from backend sending (local-only events) */
  localOnlyEvents?: string[];
}

interface EventHistoryEntry {
  event: string;
  payload: unknown;
  timestamp: Date;
  sentToBackend?: boolean;
}

interface BackendEventPayload {
  type: string;
  data: unknown;
  timestamp: string;
}

export class EventBus {
  private listeners: Map<string, Set<EventCallback>> = new Map();
  private history: EventHistoryEntry[] = [];
  private options: Required<Omit<EventBusOptions, 'apiClient'>> & { apiClient?: ApiClient };
  private pendingEvents: BackendEventPayload[] = [];
  private isSending = false;

  constructor(options: EventBusOptions = {}) {
    this.options = {
      debug: options.debug ?? false,
      maxHistory: options.maxHistory ?? 100,
      apiClient: options.apiClient,
      eventsEndpoint: options.eventsEndpoint ?? '/events',
      autoSendToBackend: options.autoSendToBackend ?? !!options.apiClient,
      localOnlyEvents: options.localOnlyEvents ?? [
        'notification:show',
        'notification:hide',
        'modal:open',
        'modal:close',
        'loading:start',
        'loading:end',
      ],
    };
  }

  /**
   * Configure the EventBus after construction.
   * Useful for setting ApiClient after app initialization.
   */
  configure(options: Partial<EventBusOptions>): void {
    if (options.apiClient !== undefined) {
      this.options.apiClient = options.apiClient;
    }
    if (options.eventsEndpoint !== undefined) {
      this.options.eventsEndpoint = options.eventsEndpoint;
    }
    if (options.autoSendToBackend !== undefined) {
      this.options.autoSendToBackend = options.autoSendToBackend;
    }
    if (options.localOnlyEvents !== undefined) {
      this.options.localOnlyEvents = options.localOnlyEvents;
    }
    if (options.debug !== undefined) {
      this.options.debug = options.debug;
    }
  }

  /**
   * Emit an event with optional payload.
   * Automatically sends to backend if configured.
   * @param event - Event name
   * @param payload - Optional event data
   */
  emit<T>(event: string, payload?: T): void {
    if (this.options.debug) {
      console.log(`[EventBus] ${event}`, payload);
    }

    // Record in history
    const historyEntry: EventHistoryEntry = {
      event,
      payload,
      timestamp: new Date(),
      sentToBackend: false,
    };
    this.history.push(historyEntry);
    if (this.history.length > this.options.maxHistory) {
      this.history.shift();
    }

    // Notify all local listeners
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

    // Send to backend if configured and not a local-only event
    if (this.shouldSendToBackend(event)) {
      this.queueBackendEvent(event, payload, historyEntry);
    }
  }

  /**
   * Check if event should be sent to backend
   */
  private shouldSendToBackend(event: string): boolean {
    if (!this.options.autoSendToBackend || !this.options.apiClient) {
      return false;
    }
    return !this.options.localOnlyEvents.includes(event);
  }

  /**
   * Queue an event for backend delivery
   */
  private queueBackendEvent<T>(event: string, payload: T, historyEntry: EventHistoryEntry): void {
    const backendPayload: BackendEventPayload = {
      type: event,
      data: payload,
      timestamp: new Date().toISOString(),
    };

    this.pendingEvents.push(backendPayload);
    this.flushPendingEvents().then((success) => {
      historyEntry.sentToBackend = success;
    });
  }

  /**
   * Flush pending events to backend
   */
  private async flushPendingEvents(): Promise<boolean> {
    if (this.isSending || this.pendingEvents.length === 0 || !this.options.apiClient) {
      return false;
    }

    this.isSending = true;
    const eventsToSend = [...this.pendingEvents];
    this.pendingEvents = [];

    try {
      // Send events in batch
      await this.options.apiClient.post(this.options.eventsEndpoint, {
        events: eventsToSend,
      });

      if (this.options.debug) {
        console.log(`[EventBus] Sent ${eventsToSend.length} events to backend`);
      }

      return true;
    } catch (error) {
      // Re-queue failed events for retry
      this.pendingEvents = [...eventsToSend, ...this.pendingEvents];

      if (this.options.debug) {
        console.error('[EventBus] Failed to send events to backend:', error);
      }

      return false;
    } finally {
      this.isSending = false;
    }
  }

  /**
   * Manually send events to backend (for local-only events that need explicit sending)
   */
  async sendToBackend<T>(event: string, payload?: T): Promise<boolean> {
    if (!this.options.apiClient) {
      console.warn('[EventBus] No API client configured for backend sending');
      return false;
    }

    try {
      await this.options.apiClient.post(this.options.eventsEndpoint, {
        events: [{
          type: event,
          data: payload,
          timestamp: new Date().toISOString(),
        }],
      });
      return true;
    } catch (error) {
      if (this.options.debug) {
        console.error('[EventBus] Failed to send event to backend:', error);
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
  on<T>(event: string, callback: EventCallback<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback as EventCallback);

    // Return unsubscribe function
    return () => this.off(event, callback);
  }

  /**
   * Unsubscribe from an event
   * @param event - Event name
   * @param callback - Handler function to remove
   */
  off<T>(event: string, callback: EventCallback<T>): void {
    this.listeners.get(event)?.delete(callback as EventCallback);
  }

  /**
   * Subscribe to an event once (auto-unsubscribes after first emit)
   * @param event - Event name
   * @param callback - Handler function
   */
  once<T>(event: string, callback: EventCallback<T>): void {
    const wrapper = (payload: T) => {
      callback(payload);
      this.off(event, wrapper);
    };
    this.on(event, wrapper);
  }

  /**
   * Check if an event has any listeners
   * @param event - Event name
   */
  hasListeners(event: string): boolean {
    return (this.listeners.get(event)?.size ?? 0) > 0;
  }

  /**
   * Get count of listeners for an event
   * @param event - Event name
   */
  listenerCount(event: string): number {
    return this.listeners.get(event)?.size ?? 0;
  }

  /**
   * Get event history for debugging
   * @param event - Optional filter by event name
   */
  getHistory(event?: string): EventHistoryEntry[] {
    if (event) {
      return this.history.filter((entry) => entry.event === event);
    }
    return [...this.history];
  }

  /**
   * Clear all listeners and history
   */
  clear(): void {
    this.listeners.clear();
    this.history = [];
    this.pendingEvents = [];
  }

  /**
   * Clear only history (keep listeners)
   */
  clearHistory(): void {
    this.history = [];
  }

  /**
   * Remove all listeners for a specific event
   * @param event - Event name
   */
  clearEvent(event: string): void {
    this.listeners.delete(event);
  }

  /**
   * Get pending event count (events not yet sent to backend)
   */
  getPendingCount(): number {
    return this.pendingEvents.length;
  }
}

// Singleton instance for app-wide use
export const eventBus = new EventBus({
  debug: typeof process !== 'undefined' && process.env?.NODE_ENV === 'development',
});

/**
 * Configure the singleton eventBus instance.
 * Call this in main.ts after creating the API client.
 */
export function configureEventBus(options: Partial<EventBusOptions>): void {
  eventBus.configure(options);
}
