import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore, configureAuthStore } from '../../../src/stores/auth';
import { ApiClient } from '../../../src/api/ApiClient';

describe('Auth Store - Login', () => {
  let mockApiClient: Partial<ApiClient>;

  beforeEach(() => {
    setActivePinia(createPinia());

    // Mock API client
    mockApiClient = {
      post: vi.fn(),
      setToken: vi.fn(),
    };

    // Configure auth store with mock API client
    configureAuthStore({
      storageKey: 'test_token',
      apiClient: mockApiClient as ApiClient,
      loginEndpoint: '/auth/login',
    });
  });

  it('should correctly handle login response with ADMIN role', async () => {
    const mockResponse = {
      success: true,
      token: 'jwt_token_here',
      user: {
        id: '123',
        email: 'admin@example.com',
        name: 'admin',
        roles: ['ADMIN'],
      },
      user_id: '123',
    };

    vi.mocked(mockApiClient.post).mockResolvedValue(mockResponse);

    const authStore = useAuthStore();

    // Perform login
    const response = await authStore.login({
      email: 'admin@example.com',
      password: 'AdminPass123@',
    });

    // Verify auth store state
    expect(authStore.token).toBe('jwt_token_here');
    expect(authStore.user).toBeDefined();
    expect(authStore.user?.email).toBe('admin@example.com');
    expect(authStore.user?.roles).toEqual(['ADMIN']);

    // Verify isAdmin getter
    expect(authStore.isAdmin).toBe(true);

    // Verify response
    expect(response.token).toBe('jwt_token_here');
  });

  it('should handle login response without roles', async () => {
    const mockResponse = {
      success: true,
      token: 'jwt_token_here',
      user: {
        id: '456',
        email: 'user@example.com',
        name: 'user',
        roles: ['USER'],
      },
      user_id: '456',
    };

    vi.mocked(mockApiClient.post).mockResolvedValue(mockResponse);

    const authStore = useAuthStore();

    // Perform login
    await authStore.login({
      email: 'user@example.com',
      password: 'Password123@',
    });

    // Verify isAdmin getter returns false for non-admin user
    expect(authStore.isAdmin).toBe(false);
  });
});
