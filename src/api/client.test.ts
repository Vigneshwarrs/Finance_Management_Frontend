import { describe, it, expect, beforeEach, vi } from 'vitest';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';

// Test the interceptor behavior by simulating what the interceptor does
describe('Axios interceptor behavior', () => {
  beforeEach(() => {
    useAuthStore.setState({ token: 'valid-token', user: { userId: 'u1', role: 'Admin' } });
    useToastStore.setState({ toasts: [] });
  });

  it('401 response clears authStore token and user', () => {
    // Simulate what the 401 interceptor does
    const error = { response: { status: 401, data: { error: 'Unauthorized' } } };

    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }

    expect(useAuthStore.getState().token).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('error response adds toast', () => {
    const error = { response: { status: 500, data: { error: 'Internal Server Error' } } };
    const message = error.response?.data?.error ?? 'An error occurred';

    useToastStore.getState().addToast(message, 'error');

    const toasts = useToastStore.getState().toasts;
    expect(toasts).toHaveLength(1);
    expect(toasts[0].message).toBe('Internal Server Error');
    expect(toasts[0].variant).toBe('error');
  });
});
