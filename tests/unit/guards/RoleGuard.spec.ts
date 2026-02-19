import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRoleGuard } from '@/guards/RoleGuard';
import * as authStore from '@/stores/auth';

// Mock the auth store
vi.mock('@/stores/auth', () => ({
  useAuthStore: vi.fn(),
}));

describe('RoleGuard', () => {
  let mockNext: ReturnType<typeof vi.fn>;
  let mockHasAnyRole: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockNext = vi.fn();
    mockHasAnyRole = vi.fn();
    vi.mocked(authStore.useAuthStore).mockReturnValue({
      hasAnyRole: mockHasAnyRole,
    } as any);
  });

  it('should allow access when user has required role', () => {
    mockHasAnyRole.mockReturnValue(true);
    const guard = createRoleGuard();

    const to = { meta: { roles: ['admin'] } } as any;
    const from = {} as any;

    guard(to, from, mockNext);

    expect(mockHasAnyRole).toHaveBeenCalledWith(['admin']);
    expect(mockNext).toHaveBeenCalledWith();
  });

  it('should deny access when user lacks required role', () => {
    mockHasAnyRole.mockReturnValue(false);
    const guard = createRoleGuard();

    const to = { meta: { roles: ['admin'] } } as any;
    const from = {} as any;

    guard(to, from, mockNext);

    expect(mockNext).toHaveBeenCalledWith({ name: 'forbidden' });
  });

  it('should allow access when no roles required', () => {
    const guard = createRoleGuard();

    const to = { meta: {} } as any;
    const from = {} as any;

    guard(to, from, mockNext);

    expect(mockHasAnyRole).not.toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalledWith();
  });

  it('should allow access when roles array is empty', () => {
    const guard = createRoleGuard();

    const to = { meta: { roles: [] } } as any;
    const from = {} as any;

    guard(to, from, mockNext);

    expect(mockNext).toHaveBeenCalledWith();
  });

  it('should allow access when user has any of multiple roles', () => {
    mockHasAnyRole.mockReturnValue(true);
    const guard = createRoleGuard();

    const to = { meta: { roles: ['admin', 'moderator'] } } as any;
    const from = {} as any;

    guard(to, from, mockNext);

    expect(mockHasAnyRole).toHaveBeenCalledWith(['admin', 'moderator']);
    expect(mockNext).toHaveBeenCalledWith();
  });

  it('should use custom forbidden route from options', () => {
    mockHasAnyRole.mockReturnValue(false);
    const guard = createRoleGuard({ forbiddenRoute: 'access-denied' });

    const to = { meta: { roles: ['admin'] } } as any;
    const from = {} as any;

    guard(to, from, mockNext);

    expect(mockNext).toHaveBeenCalledWith({ name: 'access-denied' });
  });
});
