import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../api/client';
import { useAuthStore } from '../../../store/authStore';

interface RoleDefinition {
  id: string;
  name: string;
  permissions: string[];
}

/**
 * Returns the set of permissions for the current user's role.
 * Fetches all roles from GET /roles and finds the matching role.
 * Result is cached via React Query with a 60s staleTime.
 *
 * Falls back to permissions stored in authStore (populated at login)
 * while the React Query fetch is still in-flight, so permissions are
 * available immediately on page load.
 *
 * Validates: Requirements 10.3
 */
export function useUserPermissions(): string[] {
  const role = useAuthStore((s) => s.user?.role);
  const storePermissions = useAuthStore((s) => s.permissions);

  const { data: roles } = useQuery<RoleDefinition[]>({
    queryKey: ['roles'],
    queryFn: () => apiClient.get('/roles').then((r) => r.data),
    enabled: !!role,
    staleTime: 60 * 1000, // 60s — role definitions change infrequently
  });

  if (!role) return [];

  // If the React Query fetch hasn't resolved yet, fall back to the
  // permissions that were cached in authStore at login time.
  if (!roles) return storePermissions;

  const roleDef = roles.find((r) => r.name === role);
  return roleDef?.permissions ?? storePermissions;
}
