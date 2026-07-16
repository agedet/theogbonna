import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import {
  getLoginByPath,
  isRouteAllowedForRole,
} from '@/utils/routeConfig';
import { useAuthContext } from '@/context/useAuthContext';
import type { AppRole } from '@/utils/routeConfig';
import { URLS } from '@/utils/routes';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: AppRole[];
}

/**
 * Guards dashboard routes. Public routes (landing, checkout, success, auth)
 * must NOT wrap with this component.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { isAuthenticated, isLoading, role } = useAuthContext();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <Loader2 className="size-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    const loginUrl = getLoginByPath(location.pathname);
    const redirectUrl = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`${loginUrl}?redirectUrl=${redirectUrl}`} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (!role || !allowedRoles.includes(role)) {
      const message = encodeURIComponent(
        'Your account does not have permission to access this area.',
      );
      return (
        <Navigate
          to={`${URLS.ACCESS_DENIED}?error=${message}`}
          replace
          state={{ from: location.pathname }}
        />
      );
    }
  }

  if (role && !isRouteAllowedForRole(location.pathname, role)) {
    const message = encodeURIComponent(
      'You are not allowed to view this page with your current role.',
    );
    return (
      <Navigate
        to={`${URLS.ACCESS_DENIED}?error=${message}`}
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
