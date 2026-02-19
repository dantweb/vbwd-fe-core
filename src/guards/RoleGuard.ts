/**
 * Role-based route guard.
 *
 * Restricts access to routes based on user roles.
 */
import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router';
import { useAuthStore } from '../stores/auth';

export interface RoleGuardOptions {
  forbiddenRoute?: string;
}

const defaultOptions: RoleGuardOptions = {
  forbiddenRoute: 'forbidden',
};

/**
 * Create a role guard with custom options.
 *
 * @param options - Guard configuration options
 * @returns Navigation guard function
 */
export function createRoleGuard(options: RoleGuardOptions = {}) {
  const opts = { ...defaultOptions, ...options };

  return function roleGuard(
    to: RouteLocationNormalized,
    _from: RouteLocationNormalized,
    next: NavigationGuardNext
  ): void {
    const auth = useAuthStore();
    const requiredRoles = to.meta.roles as string[] | undefined;

    // No roles required - allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      next();
      return;
    }

    // Check if user has any of the required roles
    if (auth.hasAnyRole(requiredRoles)) {
      next();
      return;
    }

    // User doesn't have required role - redirect to forbidden
    next({ name: opts.forbiddenRoute });
  };
}

/**
 * Default role guard.
 *
 * Usage in router:
 * ```typescript
 * import { roleGuard } from '@vbwd/view-component';
 *
 * // Apply after authGuard
 * router.beforeEach((to, from, next) => {
 *   authGuard(to, from, (result) => {
 *     if (result !== undefined) { next(result); return; }
 *     roleGuard(to, from, next);
 *   });
 * });
 * ```
 *
 * Route configuration:
 * ```typescript
 * {
 *   path: '/admin',
 *   meta: { requiresAuth: true, roles: ['admin'] }
 * }
 * ```
 */
export const roleGuard = createRoleGuard();
