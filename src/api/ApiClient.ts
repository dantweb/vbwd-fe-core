/**
 * API Client Implementation
 * Type-safe HTTP client built on Axios
 */

import axios, { type AxiosInstance, type AxiosResponse, type AxiosError } from 'axios';
import type {
  ApiClientConfig,
  RequestConfig,
  RefreshTokenHandler,
  EventListener,
  ApiEvent
} from './types';
import { ApiError } from './errors';

/**
 * API Client class
 * Provides HTTP methods with interceptors and error handling
 */
export class ApiClient {
  private axiosInstance: AxiosInstance;
  private token?: string;
  private refreshTokenHandler?: RefreshTokenHandler;
  private eventListeners: Map<ApiEvent, EventListener[]> = new Map();

  public readonly baseURL: string;
  public readonly timeout: number;
  public readonly headers: Record<string, string>;

  constructor(config: ApiClientConfig) {
    this.baseURL = config.baseURL;
    this.timeout = config.timeout || 30000;
    this.headers = {
      'Content-Type': 'application/json',
      ...config.headers
    };

    // Create Axios instance
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: this.headers
    });

    // Setup interceptors
    this.setupInterceptors();
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Add auth token if available
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        // Handle 401 Unauthorized
        if (error.response?.status === 401) {
          this.emit('token-expired');

          // Try to refresh token if handler is set
          if (this.refreshTokenHandler && error.config) {
            try {
              const newToken = await this.refreshTokenHandler();
              this.setToken(newToken);

              // Retry original request with new token
              error.config.headers.Authorization = `Bearer ${newToken}`;
              return this.axiosInstance.request(error.config);
            } catch (refreshError) {
              // Token refresh failed, reject with original error
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
  async get<T = unknown>(url: string, config?: Partial<RequestConfig>): Promise<T> {
    try {
      const response = await this.axiosInstance.get<T>(url, {
        params: config?.params,
        headers: config?.headers,
        timeout: config?.timeout
      });
      return response.data;
    } catch (error) {
      throw ApiError.fromAxiosError(error as never);
    }
  }

  /**
   * POST request
   */
  async post<T = unknown>(url: string, data?: unknown, config?: Partial<RequestConfig>): Promise<T> {
    try {
      const response = await this.axiosInstance.post<T>(url, data, {
        params: config?.params,
        headers: config?.headers,
        timeout: config?.timeout
      });
      return response.data;
    } catch (error) {
      throw ApiError.fromAxiosError(error as never);
    }
  }

  /**
   * PUT request
   */
  async put<T = unknown>(url: string, data?: unknown, config?: Partial<RequestConfig>): Promise<T> {
    try {
      const response = await this.axiosInstance.put<T>(url, data, {
        params: config?.params,
        headers: config?.headers,
        timeout: config?.timeout
      });
      return response.data;
    } catch (error) {
      throw ApiError.fromAxiosError(error as never);
    }
  }

  /**
   * PATCH request
   */
  async patch<T = unknown>(url: string, data?: unknown, config?: Partial<RequestConfig>): Promise<T> {
    try {
      const response = await this.axiosInstance.patch<T>(url, data, {
        params: config?.params,
        headers: config?.headers,
        timeout: config?.timeout
      });
      return response.data;
    } catch (error) {
      throw ApiError.fromAxiosError(error as never);
    }
  }

  /**
   * DELETE request
   */
  async delete<T = unknown>(url: string, config?: Partial<RequestConfig>): Promise<T> {
    try {
      const response = await this.axiosInstance.delete<T>(url, {
        params: config?.params,
        headers: config?.headers,
        timeout: config?.timeout
      });
      return response.data;
    } catch (error) {
      throw ApiError.fromAxiosError(error as never);
    }
  }

  /**
   * Set authentication token
   */
  setToken(token: string): void {
    this.token = token;
  }

  /**
   * Get authentication token
   */
  getToken(): string | undefined {
    return this.token;
  }

  /**
   * Clear authentication token
   */
  clearToken(): void {
    this.token = undefined;
  }

  /**
   * Set refresh token handler
   */
  setRefreshTokenHandler(handler: RefreshTokenHandler): void {
    this.refreshTokenHandler = handler;
  }

  /**
   * Get refresh token handler
   */
  getRefreshTokenHandler(): RefreshTokenHandler | undefined {
    return this.refreshTokenHandler;
  }

  /**
   * Add event listener
   */
  on(event: ApiEvent, listener: EventListener): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
  }

  /**
   * Remove event listener
   */
  off(event: ApiEvent, listener: EventListener): void {
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
  private emit(event: ApiEvent, ...args: unknown[]): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => listener(...args));
    }
  }

  /**
   * Get request configuration (for testing)
   */
  getRequestConfig(url: string, config?: Partial<RequestConfig>): RequestConfig {
    const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`;

    const requestConfig: RequestConfig = {
      url: fullUrl,
      method: config?.method || 'GET',
      headers: {
        ...this.headers,
        ...config?.headers
      },
      timeout: config?.timeout || this.timeout
    };

    // Add auth header if token is set
    if (this.token && requestConfig.headers) {
      requestConfig.headers.Authorization = `Bearer ${this.token}`;
    }

    // Add params if provided
    if (config?.params) {
      requestConfig.params = config.params;
    }

    // Add data if provided
    if (config?.data) {
      requestConfig.data = config.data;
    }

    return requestConfig;
  }

  /**
   * Handle response (for testing)
   */
  handleResponse<T>(response: AxiosResponse<T>): T {
    if (response.status >= 400) {
      // Emit event for 401
      if (response.status === 401) {
        this.emit('token-expired');
      }

      // Extract error message
      const errorData = response.data as { error?: string; message?: string };
      const message = errorData?.error || errorData?.message || response.statusText;

      throw new ApiError(message, response.status);
    }

    return response.data;
  }
}
