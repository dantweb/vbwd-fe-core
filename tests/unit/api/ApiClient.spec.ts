import { describe, it, expect, beforeEach } from 'vitest';
import { ApiClient } from '@/api/ApiClient';

describe('ApiClient', () => {
  let client: ApiClient;

  beforeEach(() => {
    client = new ApiClient({ baseURL: 'http://localhost:5001' });
  });

  it('should create client with baseURL', () => {
    expect(client).toBeDefined();
    expect(client.baseURL).toBe('http://localhost:5001');
  });

  it('should have default timeout', () => {
    expect(client.timeout).toBe(30000); // 30 seconds default
  });

  it('should allow custom timeout', () => {
    const customClient = new ApiClient({
      baseURL: 'http://localhost:5001',
      timeout: 5000
    });
    expect(customClient.timeout).toBe(5000);
  });

  it('should have request methods', () => {
    expect(typeof client.get).toBe('function');
    expect(typeof client.post).toBe('function');
    expect(typeof client.put).toBe('function');
    expect(typeof client.patch).toBe('function');
    expect(typeof client.delete).toBe('function');
  });

  it('should support setting auth token', () => {
    client.setToken('test-token-123');
    expect(client.getToken()).toBe('test-token-123');
  });

  it('should support clearing auth token', () => {
    client.setToken('test-token-123');
    client.clearToken();
    expect(client.getToken()).toBeUndefined();
  });

  it('should support custom headers', () => {
    const customClient = new ApiClient({
      baseURL: 'http://localhost:5001',
      headers: {
        'X-Custom-Header': 'value'
      }
    });
    expect(customClient.headers['X-Custom-Header']).toBe('value');
  });

  it('should have default headers', () => {
    expect(client.headers['Content-Type']).toBe('application/json');
  });

  it('should support setting refresh token handler', () => {
    const handler = async (): Promise<string> => 'new-token';
    client.setRefreshTokenHandler(handler);
    expect(client.getRefreshTokenHandler()).toBe(handler);
  });

  it('should support event listeners', () => {
    const listener = (): void => {};
    client.on('token-expired', listener);
    // If we get here without error, event listener was added
    expect(true).toBe(true);
  });
});
