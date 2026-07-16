import {
  CreditCard,
  LayoutDashboard,
  ShoppingCart,
  Users,
  UsersRound,
} from 'lucide-react';
import { URLS } from './routes';
import type { AppRole } from './routeConfig';

export interface SideBarNav {
  title: string | React.ReactNode;
  url: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export const AdminDashboardSidebarNav: SideBarNav[] = [
  { title: 'Dashboard', url: URLS.ADMIN_DASHBOARD, icon: LayoutDashboard },
  { title: 'Attendees', url: URLS.ADMIN_ATTENDEES, icon: UsersRound },
  { title: 'Orders', url: URLS.ADMIN_ORDERS, icon: ShoppingCart },
  { title: 'Payments', url: URLS.ADMIN_PAYMENTS, icon: CreditCard },
];

export const SuperAdminDashboardSidebarNav: SideBarNav[] = [
  { title: 'Dashboard', url: URLS.SUPER_ADMIN_DASHBOARD, icon: LayoutDashboard },
  { title: 'User Management', url: URLS.SUPER_ADMIN_USER_MANAGEMENT, icon: Users },
  { title: 'Attendees', url: URLS.SUPER_ADMIN_ATTENDEES, icon: UsersRound },
  { title: 'Orders', url: URLS.SUPER_ADMIN_ORDERS, icon: ShoppingCart },
  { title: 'Payments', url: URLS.SUPER_ADMIN_PAYMENTS, icon: CreditCard },
];

export const getSidebarNavForRole = (role: string | null): SideBarNav[] => {
  switch (role) {
    case 'super_admin':
      return SuperAdminDashboardSidebarNav;
    case 'admin':
    default:
      return AdminDashboardSidebarNav;
  }
};

export const getDashboardTypeForRole = (role: string | null): AppRole => {
  if (role === 'super_admin') return 'super_admin';
  return 'admin';
};
