import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { MobileSidebar } from './MobileSidebar';
import { URLS } from '@/utils/routes';
import { cn } from '@/lib/utils';
import type { AppRole } from '@/utils/routeConfig';
import type { SideBarNav } from '@/utils/sidebarNavigation';

interface DashboardHeaderProps {
  title?: string;
  dashboardType: AppRole;
  navigationItems: SideBarNav[];
}

export const DashboardHeader = ({
  dashboardType,
  navigationItems,
}: DashboardHeaderProps) => {
  const homeUrl =
    dashboardType === 'super_admin'
      ? URLS.SUPER_ADMIN_DASHBOARD
      : URLS.ADMIN_DASHBOARD;

  return (
    <header
      className={cn(
        'sticky top-0 w-full z-50 border-b border-white/10 bg-slate-950/90 backdrop-blur-md',
      )}
    >
      <div className="flex h-14 items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <MobileSidebar
            navigationItems={navigationItems}
            dashboardType={dashboardType}
          />
          <Link to={homeUrl} className="text-sm font-semibold text-white lg:hidden">
            Ogbonnas Memorial
          </Link>
        </div>

        {dashboardType === 'admin' && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:text-white hover:bg-white/5"
              >
                <Bell className="size-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 bg-slate-900 border-white/10 text-slate-200">
              <p className="text-sm text-slate-400">No new notifications</p>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </header>
  );
};
