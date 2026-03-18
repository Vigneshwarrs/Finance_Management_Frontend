import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';

export const apiClient = axios.create({
  baseURL: 'http://localhost:3000/',
  headers: { 'Content-Type': 'application/json' },
});

// Inject Bearer token
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.error ?? error.message ?? 'An error occurred';

    if (status === 401) {
      useAuthStore.getState().logout();
    }

    useToastStore.getState().addToast(message, 'error');
    return Promise.reject(error);
  }
);
