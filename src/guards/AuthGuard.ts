/**
 * Authentication route guard.
 *
 * Protects routes requiring authentication and handles
 * guest-only routes (like login).
 */
import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router';
import { useAuthStore } from '../stores/auth';

export interface AuthGuardOptions {
  loginRoute?: string;
  dashboardRoute?: string;
}

const defaultOptions: AuthGuardOptions = {
  loginRoute: 'login',
  dashboardRoute: 'dashboard',
};

/**
 * Create an authentication guard with custom options.
 *
 * @param options - Guard configuration options
 * @returns Navigation guard function
 */
export function createAuthGuard(options: AuthGuardOptions = {}) {
  const opts = { ...defaultOptions, ...options };

  return function authGuard(
    to: RouteLocationNormalized,
    _from: RouteLocationNormalized,
    next: NavigationGuardNext
  ): void {
    const auth = useAuthStore();

    // Check if route requires authentication
    if (to.meta.requiresAuth && !auth.isAuthenticated) {
      next({
        name: opts.loginRoute,
        query: { redirect: to.fullPath },
      });
      return;
    }

    // Check if route is for guests only (e.g., login page)
    if (to.meta.requiresGuest && auth.isAuthenticated) {
      next({ name: opts.dashboardRoute });
      return;
    }

    next();
  };
}

/**
 * Default authentication guard.
 *
 * Usage in router:
 * ```typescript
 * import { authGuard } from '@vbwd/view-component';
 * router.beforeEach(authGuard);
 * ```
 */
export const authGuard = createAuthGuard();
