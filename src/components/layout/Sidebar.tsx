import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

export const Sidebar: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isInitiallyExpanded, setIsInitiallyExpanded] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitiallyExpanded(false);
    }, 3000); // Collapse after 3 seconds initially

    return () => clearTimeout(timer);
  }, []);

  const isExpanded = isHovered || isInitiallyExpanded;
  
  // Determine dashboard type and routes based on current path
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isUserRoute = location.pathname.startsWith('/user');
  const boardsRoute = isAdminRoute ? '/admin/boards' : isUserRoute ? '/user/boards' : '/admin/boards';
  const dashboardRoute = isAdminRoute ? '/admin/dashboard' : isUserRoute ? '/user/start' : '/admin/dashboard';
  const usersRoute = isAdminRoute ? '/admin/users' : '/admin/users';

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`bg-white border-r border-stroke-soft h-screen sticky top-0 flex flex-col transition-all duration-300 ease-in-out z-50 ${
        isExpanded ? 'w-64' : 'w-20'
      }`}
    >
      <div
        className={`p-6 border-b border-stroke-soft flex items-center ${isExpanded ? 'justify-start' : 'justify-center'}`}
      >
        <h2
          className={`text-xl font-bold text-primary-base transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}
        >
          Ogbonnas Memorial
        </h2>
        {!isExpanded && (
          <div className="text-xl font-bold text-primary-base">B</div>
        )}
      </div>
      
      <nav className="flex-1 p-4 space-y-2 overflow-hidden">
        <NavLink
          to={dashboardRoute}
          className={({ isActive }) =>
            `flex items-center rounded-lg transition-colors overflow-hidden ${
              isExpanded ? 'justify-start gap-3 px-4 py-3' : 'justify-center p-3'
            } ${
              isActive
                ? 'bg-primary-lighter text-primary-dark font-semibold'
                : 'text-text-sub hover:bg-bg-weak hover:text-text-strong'
            }`
          }
        >
          <div className="shrink-0 flex items-center justify-center">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </div>
          <span className={`transition-opacity duration-300 whitespace-nowrap ${isExpanded ? 'opacity-100' : 'opacity-0 w-0'}`}>
            Dashboard
          </span>
        </NavLink>

        {isAdminRoute && (
          <NavLink
            to={usersRoute}
            className={({ isActive }) =>
              `flex items-center rounded-lg transition-colors overflow-hidden ${
                isExpanded ? 'justify-start gap-3 px-4 py-3' : 'justify-center p-3'
              } ${
                isActive
                  ? 'bg-primary-lighter text-primary-dark font-semibold'
                  : 'text-text-sub hover:bg-bg-weak hover:text-text-strong'
              }`
            }
          >
            <div className="shrink-0 flex items-center justify-center">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <span className={`transition-opacity duration-300 whitespace-nowrap ${isExpanded ? 'opacity-100' : 'opacity-0 w-0'}`}>
              User Management
            </span>
          </NavLink>
        )}

        <NavLink
          to={boardsRoute}
          className={({ isActive }) =>
            `flex items-center rounded-lg transition-colors overflow-hidden ${
              isExpanded ? 'justify-start gap-3 px-4 py-3' : 'justify-center p-3'
            } ${
              isActive
                ? 'bg-primary-lighter text-primary-dark font-semibold'
                : 'text-text-sub hover:bg-bg-weak hover:text-text-strong'
            }`
          }
        >
          <div className="shrink-0 flex items-center justify-center">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
          </div>
          <span className={`transition-opacity duration-300 whitespace-nowrap ${isExpanded ? 'opacity-100' : 'opacity-0 w-0'}`}>
            Boards
          </span>
        </NavLink>
      </nav>
      <div className="p-4 border-t border-stroke-soft overflow-hidden">
        <div
          className={`flex items-center rounded-lg ${isExpanded ? 'justify-start gap-3 px-4 py-3' : 'justify-center p-3'} text-text-sub`}
        >
          <div className="h-8 w-8 rounded-full bg-primaryGold/20 shrink-0 flex items-center justify-center">
            <span className="text-sm font-semibold text-primaryGold">MN</span>
          </div>
          <div
            className={`flex-1 overflow-hidden transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 w-0'}`}
          >
            <p className="text-sm font-medium text-text-strong truncate">
              Manager Name
            </p>
            <p className="text-xs text-text-soft truncate">manager@veera.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
