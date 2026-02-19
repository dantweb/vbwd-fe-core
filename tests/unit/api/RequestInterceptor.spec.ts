import { describe, it, expect, beforeEach } from 'vitest';
import { ApiClient } from '@/api/ApiClient';

describe('Request Interceptors', () => {
  let client: ApiClient;

  beforeEach(() => {
    client = new ApiClient({ baseURL: 'http://localhost:5001' });
  });

  it('should add authorization header when token is set', () => {
    client.setToken('test-token');

    const config = client.getRequestConfig('/api/test');

    expect(config.headers.Authorization).toBe('Bearer test-token');
  });

  it('should not add authorization header when token is not set', () => {
    const config = client.getRequestConfig('/api/test');

    expect(config.headers.Authorization).toBeUndefined();
  });

  it('should merge custom headers with defaults', () => {
    const config = client.getRequestConfig('/api/test', {
      headers: { 'X-Custom': 'value' }
    });

    expect(config.headers['X-Custom']).toBe('value');
    expect(config.headers['Content-Type']).toBe('application/json');
  });

  it('should append baseURL to relative URLs', () => {
    const config = client.getRequestConfig('/api/test');

    expect(config.url).toBe('http://localhost:5001/api/test');
  });

  it('should not modify absolute URLs', () => {
    const config = client.getRequestConfig('https://external.com/api');

    expect(config.url).toBe('https://external.com/api');
  });

  it('should include query parameters', () => {
    const config = client.getRequestConfig('/api/test', {
      params: { page: 1, limit: 10 }
    });

    expect(config.params).toEqual({ page: 1, limit: 10 });
  });

  it('should include request body data', () => {
    const data = { name: 'Test', value: 123 };
    const config = client.getRequestConfig('/api/test', {
      method: 'POST',
      data
    });

    expect(config.data).toEqual(data);
  });

  it('should use custom timeout if provided', () => {
    const config = client.getRequestConfig('/api/test', {
      timeout: 5000
    });

    expect(config.timeout).toBe(5000);
  });

  it('should use default timeout if not provided', () => {
    const config = client.getRequestConfig('/api/test');

    expect(config.timeout).toBe(30000);
  });
});
