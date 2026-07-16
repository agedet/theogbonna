import { Navigate } from 'react-router-dom';
import { useAuthContext } from '@/context/useAuthContext';
import { getDashboardByRole } from '@/utils/routeConfig';

export function AdminIndexRedirect() {
  const { role } = useAuthContext();
  return <Navigate to={getDashboardByRole(role)} replace />;
}
