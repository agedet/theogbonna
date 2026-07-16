/**
 * Route configuration for role-based access control.
 * Roles match the API/prisma enum: admin | super_admin
 */

export type AppRole = 'admin' | 'super_admin';

interface RoleRouteConfig {
  prefix: string;
  dashboard: string;
  login: string;
  allowedPaths: string[];
}

export const ROLE_ROUTES: Record<AppRole, RoleRouteConfig> = {
  admin: {
    prefix: '/admin',
    dashboard: '/admin/dashboard',
    login: '/admin/auth/login',
    allowedPaths: [
      '/admin/dashboard',
      '/admin/attendees',
      '/admin/orders',
      '/admin/fulfilment',
      '/admin/payments',
      '/admin/profile',
    ],
  },
  super_admin: {
    prefix: '/super-admin',
    dashboard: '/super-admin/dashboard',
    login: '/admin/auth/login',
    allowedPaths: [
      '/super-admin/dashboard',
      '/super-admin/user-management',
      '/super-admin/attendees',
      '/super-admin/orders',
      '/super-admin/payments',
      '/super-admin/profile',
      // Super admins may also open the admin dashboard
      '/admin/dashboard',
      '/admin/attendees',
      '/admin/orders',
      '/admin/fulfilment',
      '/admin/payments',
      '/admin/profile',
    ],
  },
};

const AUTH_GUEST_PATHS = [
  '/admin/auth/login',
  '/admin/auth/verify-otp',
  '/admin/auth/forgot-password',
  '/admin/auth/reset-password',
  '/admin/auth/setup-password',
  '/admin/auth/verify-email',
  // Legacy aliases
  '/admin/login',
  '/admin/verify-otp',
  '/admin/forgot-password',
  '/admin/reset-password',
  '/admin/setup-password',
  '/admin/verify-email',
];

const PUBLIC_EXACT_PATHS = [
  '/',
  '/checkout',
  '/success',
  '/not-found',
  '/auth/access-denied',
];

const matchesAllowedPath = (path: string, allowedPaths: string[]): boolean =>
  allowedPaths.some(allowed => path === allowed || path.startsWith(`${allowed}/`));

export const getDashboardByRole = (role: string | null): string => {
  if (role && role in ROLE_ROUTES) {
    return ROLE_ROUTES[role as AppRole].dashboard;
  }
  return ROLE_ROUTES.admin.login;
};

export const getLoginByRole = (role: string | null): string => {
  if (role && role in ROLE_ROUTES) {
    return ROLE_ROUTES[role as AppRole].login;
  }
  return ROLE_ROUTES.admin.login;
};

export const getLoginByPath = (path: string): string => {
  if (path.startsWith('/super-admin')) {
    return ROLE_ROUTES.super_admin.login;
  }
  return ROLE_ROUTES.admin.login;
};

export const isRouteAllowedForRole = (
  path: string,
  role: string | null,
): boolean => {
  if (!role || !(role in ROLE_ROUTES)) return false;
  return matchesAllowedPath(path, ROLE_ROUTES[role as AppRole].allowedPaths);
};

/** Public marketing + auth flows (not behind ProtectedRoute). */
export const isGuestRoute = (path: string): boolean => {
  if (PUBLIC_EXACT_PATHS.includes(path)) return true;
  return AUTH_GUEST_PATHS.some(route => path === route || path.startsWith(`${route}?`));
};

/**
 * Dashboard areas that require auth.
 * Checkout, landing, success, and auth pages are NOT protected.
 */
export const isProtectedRoute = (path: string): boolean => {
  if (isGuestRoute(path)) return false;
  // Auth subtree under /admin/auth is never a dashboard guard target
  if (path.startsWith('/admin/auth')) return false;
  return path.startsWith('/admin') || path.startsWith('/super-admin');
};

export const getUnauthorizedRedirect = (
  path: string,
  isAuthenticated: boolean,
  userRole: string | null,
): string | null => {
  if (!isAuthenticated && isProtectedRoute(path)) {
    return getLoginByPath(path);
  }
  if (isAuthenticated && userRole && !isRouteAllowedForRole(path, userRole)) {
    return getDashboardByRole(userRole);
  }
  return null;
};
