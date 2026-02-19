import { describe, it, expect } from 'vitest';
import { ApiError, NetworkError, ValidationError } from '@/api/errors';

describe('API Error Handling', () => {
  it('should create ApiError with status and message', () => {
    const error = new ApiError('Not Found', 404);

    expect(error.message).toBe('Not Found');
    expect(error.status).toBe(404);
    expect(error.name).toBe('ApiError');
  });

  it('should create ApiError with default status', () => {
    const error = new ApiError('Something went wrong');

    expect(error.message).toBe('Something went wrong');
    expect(error.status).toBe(500);
  });

  it('should be instance of Error', () => {
    const error = new ApiError('Test', 400);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ApiError);
  });

  it('should create NetworkError for connection failures', () => {
    const error = new NetworkError('Network request failed');

    expect(error.message).toBe('Network request failed');
    expect(error.name).toBe('NetworkError');
    expect(error.isNetworkError).toBe(true);
  });

  it('should create ValidationError for 422 responses', () => {
    const errors = {
      email: ['Email is required'],
      password: ['Password too short']
    };
    const error = new ValidationError('Validation failed', errors);

    expect(error.message).toBe('Validation failed');
    expect(error.status).toBe(422);
    expect(error.errors.email).toEqual(['Email is required']);
    expect(error.errors.password).toEqual(['Password too short']);
  });

  it('should check if error is retryable', () => {
    const networkError = new NetworkError('Timeout');
    const serverError = new ApiError('Server Error', 500);
    const validationError = new ValidationError('Invalid', {});
    const notFoundError = new ApiError('Not Found', 404);

    expect(networkError.isRetryable()).toBe(true);
    expect(serverError.isRetryable()).toBe(true);
    expect(validationError.isRetryable()).toBe(false);
    expect(notFoundError.isRetryable()).toBe(false);
  });

  it('should normalize axios error with response', () => {
    const axiosError = {
      response: {
        status: 404,
        data: { error: 'Not Found' },
        statusText: 'Not Found',
        headers: {},
        config: {}
      },
      config: {},
      request: {},
      message: 'Request failed'
    };

    const normalized = ApiError.fromAxiosError(axiosError);

    expect(normalized).toBeInstanceOf(ApiError);
    expect(normalized.status).toBe(404);
    expect(normalized.message).toContain('Not Found');
  });

  it('should normalize axios error without response (network error)', () => {
    const axiosError = {
      request: {},
      config: {},
      message: 'Network Error'
    };

    const normalized = ApiError.fromAxiosError(axiosError);

    expect(normalized).toBeInstanceOf(NetworkError);
    expect(normalized.message).toContain('Network Error');
  });

  it('should normalize axios error for validation (422)', () => {
    const axiosError = {
      response: {
        status: 422,
        data: {
          error: 'Validation failed',
          errors: {
            email: ['Email is required']
          }
        },
        statusText: 'Unprocessable Entity',
        headers: {},
        config: {}
      },
      config: {},
      request: {},
      message: 'Request failed'
    };

    const normalized = ApiError.fromAxiosError(axiosError);

    expect(normalized).toBeInstanceOf(ValidationError);
    if (normalized instanceof ValidationError) {
      expect(normalized.errors.email).toEqual(['Email is required']);
    }
  });
});
