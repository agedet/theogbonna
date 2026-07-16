import React from 'react';
import { useAuthContext } from '../../context/useAuthContext';

interface PermissionGateProps {
  /**
   * Required permissions to show the children
   */
  permissions: string[];
  /**
   * The content to render if user has required permissions
   */
  children: React.ReactNode;
  /**
   * Optional fallback content if user doesn't have permissions
   * Defaults to null (nothing rendered)
   */
  fallback?: React.ReactNode;
  /**
   * If true, user must have ALL permissions
   * If false (default), user needs ANY of the permissions
   */
  requireAll?: boolean;
}

/**
 * PermissionGate component for conditional UI rendering based on user permissions
 * 
 * Usage examples:
 * 
 * ```tsx
 * // Show button if user has PDM OR CTS permission
 * <PermissionGate permissions={['PDM', 'CTS']}>
 *   <AdminOnlyButton />
 * </PermissionGate>
 * 
 * // Show content only if user has BOTH PM AND SL permissions
 * <PermissionGate permissions={['PM', 'SL']} requireAll>
 *   <SpecialContent />
 * </PermissionGate>
 * 
 * // Show alternative content for users without permission
 * <PermissionGate 
 *   permissions={['Ex']} 
 *   fallback={<p>You don't have access to this feature</p>}
 * >
 *   <ExecutiveOnlyDashboard />
 * </PermissionGate>
 * ```
 */
export const PermissionGate: React.FC<PermissionGateProps> = ({
  permissions,
  children,
  fallback = null,
  requireAll = false,
}) => {
  const { hasAnyPermission, hasAllPermissions } = useAuthContext();

  const hasAccess = requireAll
    ? hasAllPermissions(permissions)
    : hasAnyPermission(permissions);

  if (hasAccess) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};

export default PermissionGate;
