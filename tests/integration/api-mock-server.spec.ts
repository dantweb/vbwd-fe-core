import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { ApiClient } from '@/api/ApiClient';

const server = setupServer();

describe('API Client with Mock Server', () => {
  let client: ApiClient;

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterAll(() => server.close());
  afterEach(() => server.resetHandlers());

  beforeEach(() => {
    client = new ApiClient({ baseURL: 'http://localhost:5001' });
  });

  it('should make successful GET request', async () => {
    server.use(
      http.get('http://localhost:5001/api/users', () => {
        return HttpResponse.json({ users: [{ id: 1, name: 'Test' }] });
      })
    );

    const response = await client.get('/api/users');

    expect(response.users).toHaveLength(1);
    expect(response.users[0].name).toBe('Test');
  });

  it('should make successful POST request', async () => {
    server.use(
      http.post('http://localhost:5001/api/users', async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ user: { id: 1, ...body } }, { status: 201 });
      })
    );

    const response = await client.post('/api/users', {
      name: 'New User',
      email: 'new@example.com'
    });

    expect(response.user.name).toBe('New User');
    expect(response.user.email).toBe('new@example.com');
  });

  it('should make successful PUT request', async () => {
    server.use(
      http.put('http://localhost:5001/api/users/1', async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ user: { id: 1, ...body } });
      })
    );

    const response = await client.put('/api/users/1', {
      name: 'Updated User'
    });

    expect(response.user.name).toBe('Updated User');
  });

  it('should make successful DELETE request', async () => {
    server.use(
      http.delete('http://localhost:5001/api/users/1', () => {
        return HttpResponse.json({ message: 'User deleted' });
      })
    );

    const response = await client.delete('/api/users/1');

    expect(response.message).toBe('User deleted');
  });

  it('should handle 404 error', async () => {
    server.use(
      http.get('http://localhost:5001/api/users/999', () => {
        return HttpResponse.json({ error: 'User not found' }, { status: 404 });
      })
    );

    await expect(client.get('/api/users/999')).rejects.toThrow('User not found');
  });

  it('should handle 500 error', async () => {
    server.use(
      http.get('http://localhost:5001/api/users', () => {
        return HttpResponse.json({ error: 'Server error' }, { status: 500 });
      })
    );

    await expect(client.get('/api/users')).rejects.toThrow();
  });

  it('should attach token to authenticated requests', async () => {
    server.use(
      http.get('http://localhost:5001/api/protected', ({ request }) => {
        const auth = request.headers.get('Authorization');
        if (auth === 'Bearer test-token') {
          return HttpResponse.json({ message: 'Authorized' });
        }
        return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
      })
    );

    client.setToken('test-token');
    const response = await client.get('/api/protected');

    expect(response.message).toBe('Authorized');
  });

  it('should reject unauthorized requests without token', async () => {
    server.use(
      http.get('http://localhost:5001/api/protected', ({ request }) => {
        const auth = request.headers.get('Authorization');
        if (!auth) {
          return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        return HttpResponse.json({ message: 'Authorized' });
      })
    );

    await expect(client.get('/api/protected')).rejects.toThrow();
  });

  it('should send query parameters', async () => {
    server.use(
      http.get('http://localhost:5001/api/users', ({ request }) => {
        const url = new URL(request.url);
        const page = url.searchParams.get('page');
        const limit = url.searchParams.get('limit');

        return HttpResponse.json({
          users: [],
          page: parseInt(page || '1'),
          limit: parseInt(limit || '10')
        });
      })
    );

    const response = await client.get('/api/users', {
      params: { page: 2, limit: 20 }
    });

    expect(response.page).toBe(2);
    expect(response.limit).toBe(20);
  });

  it('should send custom headers', async () => {
    server.use(
      http.get('http://localhost:5001/api/test', ({ request }) => {
        const customHeader = request.headers.get('X-Custom-Header');
        return HttpResponse.json({ header: customHeader });
      })
    );

    const response = await client.get('/api/test', {
      headers: { 'X-Custom-Header': 'test-value' }
    });

    expect(response.header).toBe('test-value');
  });
});
