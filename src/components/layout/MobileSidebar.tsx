import { Menu, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { cn, scrollbarHiddenClass } from '@/lib/utils';
import { URLS } from '@/utils/routes';
import type { SideBarNav } from '@/utils/sidebarNavigation';
import type { AppRole } from '@/utils/routeConfig';
import { useAuthContext } from '@/context/useAuthContext';

interface MobileSidebarProps {
  navigationItems: SideBarNav[];
  dashboardType: AppRole;
}

export const MobileSidebar = ({ navigationItems }: MobileSidebarProps) => {
  const location = useLocation();
  const pathname = location.pathname;
  const { logout } = useAuthContext();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  async function handleLogout() {
    await logout();
    window.location.href = URLS.LOGIN;
  }

  return (
    <Sheet>
      <SheetTrigger className="block cursor-pointer p-0.5 rounded-sm outline-0 lg:hidden text-white">
        <Menu className="h-7 w-7" />
      </SheetTrigger>
      <SheetContent
        side="left"
        className={cn(
          'w-[90vw] z-[110] sm:max-w-[80vw] outline-0 flex flex-col bg-foreground overflow-y-auto p-4 border-border',
          scrollbarHiddenClass,
        )}
      >
        <nav className="flex flex-col gap-2 mt-4 flex-1">
          {navigationItems.map(item => {
            const Icon = item.icon;
            const active = isActive(item.url);

            return (
              <SheetClose key={item.url} asChild>
                <Link
                  to={item.url}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    active
                      ? 'bg-amber-600 text-white'
                      : 'text-muted-foreground hover:bg-muted',
                  )}
                >
                  {Icon && <Icon className="h-5 w-5" />}
                  <span>{item.title}</span>
                </Link>
              </SheetClose>
            );
          })}
        </nav>

        <div className="mt-auto pb-6 border-t border-border pt-4">
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
