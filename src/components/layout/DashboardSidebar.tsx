import { Link, useLocation } from 'react-router-dom';
import { LogOut, ArrowRight, Shield } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import type { SideBarNav } from '@/utils/sidebarNavigation';
import type { UserProfile } from '@/services/user';
import { useAuthContext } from '@/context/useAuthContext';
import { cn, scrollbarHiddenClass } from '@/lib/utils';
import type { AppRole } from '@/utils/routeConfig';
import { URLS } from '@/utils/routes';

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
  const { role, logout } = useAuthContext();

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
        'hidden lg:flex flex-shrink-0 w-64 flex-col overflow-y-auto border-r border-white/10 h-full bg-slate-950',
        scrollbarHiddenClass,
      )}
    >
      <div className="flex items-center gap-2 px-6 pt-8 pb-6">
        <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30">
          <Shield className="size-4 text-amber-400" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-white">Ogbonna</h2>
          <p className="text-[10px] text-slate-500 uppercase tracking-wide">
            {isSuperAdmin ? 'Super Admin' : 'Admin'}
          </p>
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
                  : 'text-slate-400 hover:bg-white/5 hover:text-white',
              )}
            >
              {Icon && <Icon className="h-5 w-5" />}
              <span>{item.title}</span>
              {isSuperAdmin && active && <ArrowRight className="h-4 w-4 ml-auto" />}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 mt-auto pt-4 pb-6 border-t border-white/10">
        {user && (
          <div className="flex items-center gap-3 mb-3 p-2">
            <Avatar className="h-10 w-10 border border-white/10">
              <AvatarImage src={user.picture ?? undefined} alt={displayName} />
              <AvatarFallback className="bg-amber-500/15 text-amber-400">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-white">{displayName}</p>
              <p className="text-[10px] truncate text-slate-500">{user.email}</p>
            </div>
          </div>
        )}
        {!user && (
          <p className="mb-3 px-2 text-sm font-medium text-slate-400 capitalize">
            {role?.replace(/_/g, ' ') ?? 'User'}
          </p>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => void handleLogout()}
          className="w-full justify-start gap-2 rounded-xl px-4 text-slate-400 hover:text-red-400 hover:bg-red-500/10"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </Button>
      </div>
    </aside>
  );
};
