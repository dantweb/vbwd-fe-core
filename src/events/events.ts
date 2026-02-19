/**
 * Typed event definitions for the EventBus
 *
 * Use these constants for type-safe event names across the application.
 */

/**
 * Application event names
 */
export const AppEvents = {
  // Authentication events
  AUTH_LOGIN: 'auth:login',
  AUTH_LOGOUT: 'auth:logout',
  AUTH_TOKEN_REFRESHED: 'auth:token-refreshed',
  AUTH_SESSION_EXPIRED: 'auth:session-expired',

  // User events
  USER_REGISTERED: 'user:registered',
  USER_UPDATED: 'user:updated',
  USER_DELETED: 'user:deleted',

  // Subscription events
  SUBSCRIPTION_CREATED: 'subscription:created',
  SUBSCRIPTION_ACTIVATED: 'subscription:activated',
  SUBSCRIPTION_UPGRADED: 'subscription:upgraded',
  SUBSCRIPTION_DOWNGRADED: 'subscription:downgraded',
  SUBSCRIPTION_CANCELLED: 'subscription:cancelled',
  SUBSCRIPTION_EXPIRED: 'subscription:expired',

  // Payment events
  PAYMENT_INITIATED: 'payment:initiated',
  PAYMENT_SUCCEEDED: 'payment:succeeded',
  PAYMENT_FAILED: 'payment:failed',
  PAYMENT_REFUNDED: 'payment:refunded',

  // UI events
  NOTIFICATION_SHOW: 'notification:show',
  NOTIFICATION_HIDE: 'notification:hide',
  MODAL_OPEN: 'modal:open',
  MODAL_CLOSE: 'modal:close',
  LOADING_START: 'loading:start',
  LOADING_END: 'loading:end',

  // WebSocket events
  WS_CONNECTED: 'ws:connected',
  WS_DISCONNECTED: 'ws:disconnected',
  WS_MESSAGE: 'ws:message',
  WS_ERROR: 'ws:error',

  // Plugin events
  PLUGIN_REGISTERED: 'plugin:registered',
  PLUGIN_INITIALIZED: 'plugin:initialized',
  PLUGIN_ERROR: 'plugin:error',
  PLUGIN_STOPPED: 'plugin:stopped',
} as const;

/**
 * Event type from AppEvents values
 */
export type AppEventType = (typeof AppEvents)[keyof typeof AppEvents];

// ==================
// Event Payload Types
// ==================

/**
 * Auth login event payload
 */
export interface AuthLoginPayload {
  userId: string;
  email: string;
  role?: string;
}

/**
 * Auth logout event payload
 */
export interface AuthLogoutPayload {
  reason?: 'user_action' | 'session_expired' | 'forced';
}

/**
 * User registered event payload
 */
export interface UserRegisteredPayload {
  userId: string;
  email: string;
}

/**
 * User updated event payload
 */
export interface UserUpdatedPayload {
  userId: string;
  changes: Record<string, unknown>;
}

/**
 * Subscription event payload
 */
export interface SubscriptionPayload {
  subscriptionId: string;
  planId: string;
  planName: string;
  status?: string;
  expiresAt?: string;
}

/**
 * Payment event payload
 */
export interface PaymentPayload {
  paymentId?: string;
  transactionId?: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  error?: string;
}

/**
 * Notification event payload
 */
export interface NotificationPayload {
  id?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  title?: string;
  duration?: number;
  dismissible?: boolean;
}

/**
 * Modal event payload
 */
export interface ModalPayload {
  modalId: string;
  data?: Record<string, unknown>;
}

/**
 * Loading event payload
 */
export interface LoadingPayload {
  key?: string;
  message?: string;
}

/**
 * WebSocket message event payload
 */
export interface WSMessagePayload {
  type: string;
  data: unknown;
}

/**
 * Plugin event payload
 */
export interface PluginPayload {
  pluginId: string;
  version?: string;
  error?: string;
}

// ==================
// Type-safe event helpers
// ==================

/**
 * Event payload type map for type inference
 */
export interface EventPayloadMap {
  [AppEvents.AUTH_LOGIN]: AuthLoginPayload;
  [AppEvents.AUTH_LOGOUT]: AuthLogoutPayload;
  [AppEvents.AUTH_TOKEN_REFRESHED]: void;
  [AppEvents.AUTH_SESSION_EXPIRED]: void;
  [AppEvents.USER_REGISTERED]: UserRegisteredPayload;
  [AppEvents.USER_UPDATED]: UserUpdatedPayload;
  [AppEvents.USER_DELETED]: { userId: string };
  [AppEvents.SUBSCRIPTION_CREATED]: SubscriptionPayload;
  [AppEvents.SUBSCRIPTION_ACTIVATED]: SubscriptionPayload;
  [AppEvents.SUBSCRIPTION_UPGRADED]: SubscriptionPayload;
  [AppEvents.SUBSCRIPTION_DOWNGRADED]: SubscriptionPayload;
  [AppEvents.SUBSCRIPTION_CANCELLED]: SubscriptionPayload;
  [AppEvents.SUBSCRIPTION_EXPIRED]: SubscriptionPayload;
  [AppEvents.PAYMENT_INITIATED]: PaymentPayload;
  [AppEvents.PAYMENT_SUCCEEDED]: PaymentPayload;
  [AppEvents.PAYMENT_FAILED]: PaymentPayload;
  [AppEvents.PAYMENT_REFUNDED]: PaymentPayload;
  [AppEvents.NOTIFICATION_SHOW]: NotificationPayload;
  [AppEvents.NOTIFICATION_HIDE]: { id: string };
  [AppEvents.MODAL_OPEN]: ModalPayload;
  [AppEvents.MODAL_CLOSE]: { modalId: string };
  [AppEvents.LOADING_START]: LoadingPayload;
  [AppEvents.LOADING_END]: LoadingPayload;
  [AppEvents.WS_CONNECTED]: void;
  [AppEvents.WS_DISCONNECTED]: { reason?: string };
  [AppEvents.WS_MESSAGE]: WSMessagePayload;
  [AppEvents.WS_ERROR]: { error: string };
  [AppEvents.PLUGIN_REGISTERED]: PluginPayload;
  [AppEvents.PLUGIN_INITIALIZED]: PluginPayload;
  [AppEvents.PLUGIN_ERROR]: PluginPayload;
  [AppEvents.PLUGIN_STOPPED]: PluginPayload;
}
