import React from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuthContext } from '../../context/useAuthContext';
import { getDashboardByRole } from '../../utils/routeConfig';

interface GuestRouteProps {
  children: React.ReactNode;
}

/** Auth pages only — redirects signed-in users to their dashboard. */
export const GuestRoute: React.FC<GuestRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, role } = useAuthContext();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <Loader2 className="size-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (isAuthenticated && role) {
    return <Navigate to={getDashboardByRole(role)} replace />;
  }

  return <>{children}</>;
};

export default GuestRoute;
