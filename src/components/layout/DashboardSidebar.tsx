import { Link, useLocation } from 'react-router-dom';
import { LogOut, ArrowRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import type { SideBarNav } from '@/utils/sidebarNavigation';
import type { UserProfile } from '@/services/user';
import { useAuthContext } from '@/context/useAuthContext';
import { cn, scrollbarHiddenClass } from '@/lib/utils';
import type { AppRole } from '@/utils/routeConfig';
import { URLS } from '@/utils/routes';
import OgbonnaLogo from '@/assets/ogbonna-logo.png'

interface DashboardSidebarProps {
  navigationItems: SideBarNav[];
  dashboardType: AppRole;
  user?: UserProfile | null;
}

export const DashboardSidebar = ({
  navigationItems,
  dashboardType,
  user,
}: DashboardSidebarProps) => {
  const location = useLocation();
  const pathname = location.pathname;
  const { logout } = useAuthContext();

  const isActive = (item: SideBarNav) => {
    const pathOnly = item.url.split('?')[0];
    return pathname === pathOnly || pathname.startsWith(`${pathOnly}/`);
  };

  async function handleLogout() {
    await logout();
    window.location.href = URLS.LOGIN;
  }

  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase() || 'A';
  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
    user?.email ||
    'Admin';
  const isSuperAdmin = dashboardType === 'super_admin';

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-shrink-0 w-64 flex-col overflow-y-auto border-r border-sidebar-border h-full bg-foreground',
        scrollbarHiddenClass,
      )}
    >
      <div className="flex items-center gap-2 px-6 pt-8 pb-6">
        <div>
          <img 
            src={OgbonnaLogo}
            alt='logo'
            className="h-16 w-auto object-contain"
          />
          {/* <h2 className="text-base font-semibold text-foreground">Ogbonnas Memorial</h2> */}
          {/* Role label intentionally hidden from UI */}
          {/* <p className="text-[10px] text-slate-500 uppercase tracking-wide">
            {isSuperAdmin ? 'Super Admin' : 'Admin'}
          </p> */}
        </div>
      </div>

      <nav className="flex flex-col gap-1 px-4 flex-1 pt-2">
        {navigationItems.map(item => {
          const Icon = item.icon;
          const active = isActive(item);

          return (
            <Link
              key={item.url}
              to={item.url}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                active
                  ? 'bg-amber-600 text-white'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              {Icon && <Icon className="h-5 w-5" />}
              <span>{item.title}</span>
              {isSuperAdmin && active && <ArrowRight className="h-4 w-4 ml-auto" />}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 mt-auto pt-4 pb-6 border-t border-border">
        {user && (
          <div className="flex items-center gap-3 mb-3 p-2">
            <Avatar className="h-10 w-10 border border-border">
              <AvatarImage src={user.picture ?? undefined} alt={displayName} />
              <AvatarFallback className="bg-slate-900 text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-background">{displayName}</p>
              <p className="text-[10px] truncate text-muted-foreground">{user.email}</p>
            </div>
          </div>
        )}
        {/* {!user && (
          <p className="mb-3 px-2 text-sm font-medium text-slate-400 capitalize">
            {role?.replace(/_/g, ' ') ?? 'User'}
          </p>
        )} */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => void handleLogout()}
          className="w-full justify-start gap-2 rounded-xl px-4 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </Button>
      </div>
    </aside>
  );
};
