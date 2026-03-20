import { ReactNode } from 'react';
import { useUserPermissions } from '../features/rbac/hooks/useUserPermissions';

interface PermissionGuardProps {
  permission: string;
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Renders children only if the current user's role has the required permission.
 * Otherwise renders the fallback (default: null).
 *
 * Validates: Requirements 10.1, 10.6
 */
export function PermissionGuard({ permission, fallback = null, children }: PermissionGuardProps) {
  const permissions = useUserPermissions();

  if (permissions.includes(permission)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
