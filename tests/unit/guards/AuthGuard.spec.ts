import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createAuthGuard } from '@/guards/AuthGuard';
import * as authStore from '@/stores/auth';

// Mock the auth store
vi.mock('@/stores/auth', () => ({
  useAuthStore: vi.fn(),
}));

describe('AuthGuard', () => {
  let mockNext: ReturnType<typeof vi.fn>;
  let mockAuthStore: {
    isAuthenticated: boolean;
    user: null | { id: string };
  };

  beforeEach(() => {
    mockNext = vi.fn();
    mockAuthStore = {
      isAuthenticated: false,
      user: null,
    };
    vi.mocked(authStore.useAuthStore).mockReturnValue(mockAuthStore as unknown as ReturnType<typeof authStore.useAuthStore>);
  });

  it('should allow access when user is authenticated and route requires auth', () => {
    mockAuthStore.isAuthenticated = true;
    const guard = createAuthGuard();

    const to = { meta: { requiresAuth: true }, fullPath: '/dashboard' } as any;
    const from = {} as any;

    guard(to, from, mockNext);

    expect(mockNext).toHaveBeenCalledWith();
  });

  it('should redirect to login when not authenticated and route requires auth', () => {
    mockAuthStore.isAuthenticated = false;
    const guard = createAuthGuard();

    const to = { meta: { requiresAuth: true }, fullPath: '/dashboard' } as any;
    const from = {} as any;

    guard(to, from, mockNext);

    expect(mockNext).toHaveBeenCalledWith({
      name: 'login',
      query: { redirect: '/dashboard' },
    });
  });

  it('should redirect away from guest routes when authenticated', () => {
    mockAuthStore.isAuthenticated = true;
    const guard = createAuthGuard();

    const to = { meta: { requiresGuest: true }, fullPath: '/login' } as any;
    const from = {} as any;

    guard(to, from, mockNext);

    expect(mockNext).toHaveBeenCalledWith({ name: 'dashboard' });
  });

  it('should allow guest routes when not authenticated', () => {
    mockAuthStore.isAuthenticated = false;
    const guard = createAuthGuard();

    const to = { meta: { requiresGuest: true }, fullPath: '/login' } as any;
    const from = {} as any;

    guard(to, from, mockNext);

    expect(mockNext).toHaveBeenCalledWith();
  });

  it('should allow access to public routes', () => {
    mockAuthStore.isAuthenticated = false;
    const guard = createAuthGuard();

    const to = { meta: {}, fullPath: '/about' } as any;
    const from = {} as any;

    guard(to, from, mockNext);

    expect(mockNext).toHaveBeenCalledWith();
  });

  it('should use custom route names from options', () => {
    mockAuthStore.isAuthenticated = false;
    const guard = createAuthGuard({
      loginRoute: 'auth-login',
      dashboardRoute: 'home',
    });

    const to = { meta: { requiresAuth: true }, fullPath: '/dashboard' } as any;
    const from = {} as any;

    guard(to, from, mockNext);

    expect(mockNext).toHaveBeenCalledWith({
      name: 'auth-login',
      query: { redirect: '/dashboard' },
    });
  });
});
