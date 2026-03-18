
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { Button } from '@/components/ui/button';
import { useToastStore } from '../../store/toastStore';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const addToast = useToastStore((s) => s.addToast);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const res = await apiClient.post('/auth/login', data);
      const { token, userId, role } = res.data;
      login(token, { userId, role });
      navigate('/');
    } catch (err: any) {
      const details = err.response?.data?.details;
      if (details) {
        for (const [field, msg] of Object.entries(details)) {
          setError(field as keyof LoginFormData, { type: 'server', message: msg as string });
        }
      } else {
        addToast('Login failed. Please try again.', 'error');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-surface dark:bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-sm border border-gray-200 dark:border-gray-700"
        aria-label="Login form"
      >
        <h1 className="text-3xl font-bold mb-6 text-primary">Sign In</h1>

        <div className="mb-4">
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Username
          </label>
          <input
            id="username"
            type="text"
            autoComplete="username"
            {...register('username')}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
          />
          {errors.username && (
            <p role="alert" className="text-error text-xs mt-1">{errors.username.message}</p>
          )}
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            {...register('password')}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
          />
          {errors.password && (
            <p role="alert" className="text-error text-xs mt-1">{errors.password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>
    </div>
  );
}
