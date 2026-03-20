import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../api/client';

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  createdAt: string;
  updatedAt: string;
}

export function usePermissions() {
  return useQuery<Permission[]>({
    queryKey: ['permissions'],
    queryFn: () => apiClient.get('/permissions').then((r) => r.data),
    staleTime: 60 * 1000,
  });
}
