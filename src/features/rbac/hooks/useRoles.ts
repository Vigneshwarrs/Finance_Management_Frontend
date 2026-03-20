import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../api/client';

export interface RoleDefinition {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleInput {
  name: string;
  description: string;
  permissions: string[];
}

export interface UpdateRoleInput {
  description?: string;
  permissions: string[];
}

export function useRoles() {
  return useQuery<RoleDefinition[]>({
    queryKey: ['roles'],
    queryFn: () => apiClient.get('/roles').then((r) => r.data),
    staleTime: 60 * 1000,
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateRoleInput) =>
      apiClient.post('/roles', input).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roles'] }),
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: UpdateRoleInput & { id: string }) =>
      apiClient.put(`/roles/${id}`, input).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roles'] }),
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(`/roles/${id}`).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roles'] }),
  });
}
