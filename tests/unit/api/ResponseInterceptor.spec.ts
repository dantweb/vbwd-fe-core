import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ApiClient } from '@/api/ApiClient';
import { ApiError } from '@/api/errors';

describe('Response Interceptors', () => {
  let client: ApiClient;

  beforeEach(() => {
    client = new ApiClient({ baseURL: 'http://localhost:5001' });
  });

  it('should return response data on success', () => {
    const mockResponse = {
      status: 200,
      data: { message: 'success' },
      statusText: 'OK',
      headers: {},
      config: {}
    };

    const result = client.handleResponse(mockResponse);

    expect(result).toEqual({ message: 'success' });
  });

  it('should throw ApiError on 400 error', () => {
    const mockResponse = {
      status: 400,
      data: { error: 'Bad Request' },
      statusText: 'Bad Request',
      headers: {},
      config: {}
    };

    expect(() => client.handleResponse(mockResponse)).toThrow(ApiError);
  });

  it('should throw ApiError on 404 error', () => {
    const mockResponse = {
      status: 404,
      data: { error: 'Not Found' },
      statusText: 'Not Found',
      headers: {},
      config: {}
    };

    expect(() => client.handleResponse(mockResponse)).toThrow(ApiError);
    expect(() => client.handleResponse(mockResponse)).toThrow('Not Found');
  });

  it('should throw ApiError on 500 error', () => {
    const mockResponse = {
      status: 500,
      data: { error: 'Internal Server Error' },
      statusText: 'Internal Server Error',
      headers: {},
      config: {}
    };

    expect(() => client.handleResponse(mockResponse)).toThrow(ApiError);
  });

  it('should emit token-expired event on 401', () => {
    const spy = vi.fn();
    client.on('token-expired', spy);

    const mockResponse = {
      status: 401,
      data: { error: 'Unauthorized' },
      statusText: 'Unauthorized',
      headers: {},
      config: {}
    };

    expect(() => client.handleResponse(mockResponse)).toThrow();
    expect(spy).toHaveBeenCalled();
  });

  it('should extract error message from response', () => {
    const mockResponse = {
      status: 400,
      data: { error: 'Custom error message' },
      statusText: 'Bad Request',
      headers: {},
      config: {}
    };

    try {
      client.handleResponse(mockResponse);
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      if (error instanceof ApiError) {
        expect(error.message).toContain('Custom error message');
      }
    }
  });

  it('should handle response without error field', () => {
    const mockResponse = {
      status: 500,
      data: {},
      statusText: 'Internal Server Error',
      headers: {},
      config: {}
    };

    try {
      client.handleResponse(mockResponse);
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      if (error instanceof ApiError) {
        expect(error.status).toBe(500);
      }
    }
  });
});
