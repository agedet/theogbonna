export const URLS = {
  HOME: '/',
  CHECKOUT: '/checkout',
  SUCCESS: '/success',
  ERROR_PAGE: '/not-found',

  // Shared admin auth (admin + super_admin)
  LOGIN: '/admin/login',
  ADMIN_LOGIN: '/admin/login',
  ADMIN_VERIFY_OTP: '/admin/verify-otp',
  ADMIN_FORGOT_PASSWORD: '/admin/forgot-password',
  ADMIN_RESET_PASSWORD: '/admin/reset-password',
  ADMIN_SETUP_PASSWORD: '/admin/setup-password',
  ADMIN_VERIFY_EMAIL: '/admin/verify-email',
  FORGOT_PASSWORD: '/admin/forgot-password',
  RESET_PASSWORD: '/admin/reset-password',
  VERIFY_EMAIL: '/admin/verify-email',

  // Admin dashboard
  ADMIN: '/admin/dashboard',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_PROFILE: '/admin/profile',
  ADMIN_ATTENDEES: '/admin/attendees',
  ADMIN_ORDERS: '/admin/orders',
  ADMIN_FULFILMENT: '/admin/fulfilment',
  ADMIN_PAYMENTS: '/admin/payments',

  // Super admin (same login portal)
  SUPER_ADMIN_LOGIN: '/admin/login',
  SUPER_ADMIN_DASHBOARD: '/super-admin/dashboard',
  SUPER_ADMIN_USER_MANAGEMENT: '/super-admin/user-management',
  SUPER_ADMIN_ATTENDEES: '/super-admin/attendees',
  SUPER_ADMIN_ORDERS: '/super-admin/orders',
  SUPER_ADMIN_PAYMENTS: '/super-admin/payments',
  SUPER_ADMIN_PROFILE: '/super-admin/profile',
} as const;
