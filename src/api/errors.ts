/**
 * API Error Classes
 * Custom error types for HTTP and network failures
 */

/**
 * Base API Error
 */
export class ApiError extends Error {
  public status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = 'ApiError';
    this.status = status;

    // Maintains proper stack trace for where error was thrown (V8 only)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  /**
   * Check if error is retryable
   * 5xx errors and network errors are retryable
   */
  isRetryable(): boolean {
    return this.status >= 500 && this.status < 600;
  }

  /**
   * Create ApiError from Axios error
   */
  static fromAxiosError(error: {
    response?: {
      status: number;
      data?: { error?: string; message?: string; errors?: Record<string, string[]> };
      statusText: string;
    };
    request?: unknown;
    message: string;
  }): ApiError {
    // Network error (no response received)
    if (error.request && !error.response) {
      return new NetworkError(error.message || 'Network request failed');
    }

    // HTTP error with response
    if (error.response) {
      const { status, data, statusText } = error.response;

      // Validation error (422)
      if (status === 422 && data?.errors) {
        return new ValidationError(
          data.error || data.message || 'Validation failed',
          data.errors
        );
      }

      // Regular API error
      const message = data?.error || data?.message || statusText || 'Request failed';
      return new ApiError(message, status);
    }

    // Fallback error
    return new ApiError(error.message || 'Unknown error occurred');
  }
}

/**
 * Network Error (connection failures, timeouts)
 */
export class NetworkError extends ApiError {
  public isNetworkError = true;

  constructor(message: string) {
    super(message, 0);
    this.name = 'NetworkError';
  }

  /**
   * Network errors are always retryable
   */
  isRetryable(): boolean {
    return true;
  }
}

/**
 * Validation Error (422 Unprocessable Entity)
 */
export class ValidationError extends ApiError {
  public errors: Record<string, string[]>;

  constructor(message: string, errors: Record<string, string[]>) {
    super(message, 422);
    this.name = 'ValidationError';
    this.errors = errors;
  }

  /**
   * Validation errors are not retryable
   */
  isRetryable(): boolean {
    return false;
  }
}
