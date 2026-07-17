import { Outlet } from 'react-router-dom';
import { DashboardSidebar } from './DashboardSidebar';
import { cn } from '@/lib/utils';
import { useAuthContext } from '@/context/useAuthContext';
import {
  getDashboardTypeForRole,
  getSidebarNavForRole,
} from '@/utils/sidebarNavigation';

export interface DashboardLayoutProps {
  children?: React.ReactNode;
}

export function DashboardLayout(_props: DashboardLayoutProps = {}) {
  const { user, role } = useAuthContext();
  const dashboardType = getDashboardTypeForRole(role);
  const navigationItems = getSidebarNavForRole(role);

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden font-sans text-foreground">
      <div className={cn('flex flex-1 overflow-hidden h-screen')}>
        <DashboardSidebar
          navigationItems={navigationItems}
          dashboardType={dashboardType}
          user={user}
        />
        <main className="flex-1 overflow-y-auto bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
