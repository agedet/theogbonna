export const URLS = {
    HOME: "/",

    // Error 
    ERROR_PAGE: '/not-found',

    // ADMIN AUTH (admin role)
    ADMIN_LOGIN: "/admin/auth/sign-in",
    ADMIN_NEW_PASSWORD: "/admin/auth/new-password",
    ADMIN_VERIFY_LOGIN: "/admin/auth/verify-login",
    ADMIN_RESET_PASSWORD: "/admin/auth/reset-password",
    ADMIN_VERIFY_EMAIL: "/admin/auth/verify-email",

    // Admin Dashboard (admin-scoped)
    ADMIN: '/admin/dashboard',
    ADMIN_DASHBOARD: '/admin/dashboard',
    ADMIN_PROFILE: '/admin/profile',
    ADMIN_CUSTOMERS: '/admin/customers',
    ADMIN_ORDERS: '/admin/orders',
    ADMIN_FULFILMENT: '/admin/fulfilment',
    ADMIN_PAYMENTS: '/admin/payments',
    ADMIN_INVENTORY: '/admin/inventory',

    // SUPER_ADMIN AUTH (SUPER_ADMIN role)
    SUPER_ADMIN_LOGIN: "/super_admin/auth/sign-in",
    SUPER_ADMIN_SETUP_PASSWORD: "/super_admin/auth/setup-password",
    SUPER_ADMIN_NEW_PASSWORD: "/super_admin/auth/new-password",
    SUPER_ADMIN_VERIFY_LOGIN: "/super_admin/auth/verify-login",
    SUPER_ADMIN_RESET_PASSWORD: "/super_admin/auth/reset-password",
    SUPER_ADMIN_VERIFY_EMAIL: "/super_admin/auth/verify-email",

    // SUPER_ADMIN DASHBOARD (platform-wide)
    SUPER_ADMIN_DASHBOARD: "/super_admin/dashboard",
    SUPER_ADMIN_USER_MANAGEMENT: "/super_admin/user-management",
    SUPER_ADMIN_COMPANIES: "/super_admin/companies",
    SUPER_ADMIN_PROFILE: "/super_admin/profile",
}