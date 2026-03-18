import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiClient } from '../../api/client';
import { useToastStore } from '../../store/toastStore';

const createUserSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['Admin', 'Loan_Officer', 'Borrower'], { required_error: 'Role is required' }),
});

type CreateUserData = z.infer<typeof createUserSchema>;

export function UserManagementTable() {
  const [showForm, setShowForm] = useState(false);
  const qc = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => apiClient.get('/auth/users').then((r) => r.data),
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CreateUserData>({
    resolver: zodResolver(createUserSchema),
  });

  const mutation = useMutation({
    mutationFn: (data: CreateUserData) => apiClient.post('/auth/users', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      addToast('User created', 'success');
      setShowForm(false);
      reset();
    },
  });

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">User Management</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm"
        >
          {showForm ? 'Cancel' : 'Add User'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="max-w-sm space-y-3 bg-white dark:bg-gray-800 p-4 rounded shadow">
          <div>
            <label htmlFor="username" className="block text-sm font-medium mb-1">Username</label>
            <input id="username" {...register('username')} className="w-full border rounded px-3 py-2 text-sm" />
            {errors.username && <p role="alert" className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
            <input id="password" type="password" {...register('password')} className="w-full border rounded px-3 py-2 text-sm" />
            {errors.password && <p role="alert" className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>
          <div>
            <label htmlFor="role" className="block text-sm font-medium mb-1">Role</label>
            <select id="role" {...register('role')} className="w-full border rounded px-3 py-2 text-sm">
              <option value="Admin">Admin</option>
              <option value="Loan_Officer">Loan Officer</option>
              <option value="Borrower">Borrower</option>
            </select>
            {errors.role && <p role="alert" className="text-red-500 text-xs mt-1">{errors.role.message}</p>}
          </div>
          <button type="submit" disabled={isSubmitting || mutation.isPending} className="bg-blue-600 text-white px-4 py-2 rounded text-sm disabled:opacity-50">
            Create User
          </button>
        </form>
      )}

      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700">
            <th className="text-left p-2">Username</th>
            <th className="text-left p-2">Role</th>
            <th className="text-left p-2">Created</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u: any) => (
            <tr key={u.id} className="border-b dark:border-gray-700">
              <td className="p-2">{u.username}</td>
              <td className="p-2">{u.role}</td>
              <td className="p-2">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
