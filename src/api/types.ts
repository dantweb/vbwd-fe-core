/**
 * API Client Types
 * Type definitions for HTTP client and API interactions
 */

/**
 * API Client configuration options
 */
export interface ApiClientConfig {
  /** Base URL for all API requests */
  baseURL: string;

  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;

  /** Default headers to include in all requests */
  headers?: Record<string, string>;

  /** Enable request/response logging (default: false) */
  debug?: boolean;
}

/**
 * HTTP request configuration
 */
export interface RequestConfig {
  /** Request URL (relative or absolute) */
  url: string;

  /** HTTP method */
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

  /** Request headers */
  headers?: Record<string, string>;

  /** URL query parameters */
  params?: Record<string, unknown>;

  /** Request body data */
  data?: unknown;

  /** Request timeout (overrides client default) */
  timeout?: number;
}

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  /** Response data */
  data: T;

  /** HTTP status code */
  status: number;

  /** Optional message */
  message?: string;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  /** Array of items */
  data: T[];

  /** Pagination metadata */
  meta: {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
  };
}

/**
 * Authentication - Login Request
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Authentication - Login Response
 */
export interface LoginResponse {
  /** JWT access token */
  token: string;

  /** Authenticated user */
  user: User;

  /** Optional refresh token */
  refreshToken?: string;
}

/**
 * User model
 */
export interface User {
  id: number;
  email: string;
  name: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Token refresh handler function type
 */
export type RefreshTokenHandler = () => Promise<string>;

/**
 * Event listener function type
 */
export type EventListener = (...args: unknown[]) => void;

/**
 * API event types
 */
export type ApiEvent = 'token-expired' | 'request-start' | 'request-end' | 'error';
