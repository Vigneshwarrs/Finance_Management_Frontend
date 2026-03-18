import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './authStore';
import { useUiStore } from './uiStore';
import { useToastStore } from './toastStore';

beforeEach(() => {
  useAuthStore.setState({ token: null, user: null });
  useUiStore.setState({ theme: 'light', sidebarOpen: true });
  useToastStore.setState({ toasts: [] });
});

describe('authStore', () => {
  it('login sets token and user', () => {
    useAuthStore.getState().login('tok123', { userId: 'u1', role: 'Admin' });
    expect(useAuthStore.getState().token).toBe('tok123');
    expect(useAuthStore.getState().user?.userId).toBe('u1');
  });

  it('logout clears token and user', () => {
    useAuthStore.getState().login('tok123', { userId: 'u1', role: 'Admin' });
    useAuthStore.getState().logout();
    expect(useAuthStore.getState().token).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
  });
});

describe('uiStore', () => {
  it('toggleTheme switches from light to dark', () => {
    expect(useUiStore.getState().theme).toBe('light');
    useUiStore.getState().toggleTheme();
    expect(useUiStore.getState().theme).toBe('dark');
  });

  it('toggleTheme switches from dark to light', () => {
    useUiStore.setState({ theme: 'dark' });
    useUiStore.getState().toggleTheme();
    expect(useUiStore.getState().theme).toBe('light');
  });

  it('setSidebarOpen updates sidebarOpen', () => {
    useUiStore.getState().setSidebarOpen(false);
    expect(useUiStore.getState().sidebarOpen).toBe(false);
    useUiStore.getState().setSidebarOpen(true);
    expect(useUiStore.getState().sidebarOpen).toBe(true);
  });
});

describe('toastStore', () => {
  it('addToast adds a toast with correct message and variant', () => {
    useToastStore.getState().addToast('Hello', 'success');
    const toasts = useToastStore.getState().toasts;
    expect(toasts).toHaveLength(1);
    expect(toasts[0].message).toBe('Hello');
    expect(toasts[0].variant).toBe('success');
  });

  it('removeToast removes the correct toast', () => {
    useToastStore.getState().addToast('A');
    useToastStore.getState().addToast('B');
    const id = useToastStore.getState().toasts[0].id;
    useToastStore.getState().removeToast(id);
    const remaining = useToastStore.getState().toasts;
    expect(remaining).toHaveLength(1);
    expect(remaining[0].message).toBe('B');
  });

  it('default variant is info', () => {
    useToastStore.getState().addToast('test');
    expect(useToastStore.getState().toasts[0].variant).toBe('info');
  });
});
