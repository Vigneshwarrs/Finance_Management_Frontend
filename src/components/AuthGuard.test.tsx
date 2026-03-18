import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthGuard } from './AuthGuard';
import { useAuthStore } from '../store/authStore';

beforeEach(() => {
  useAuthStore.setState({ token: null, user: null });
});

describe('AuthGuard', () => {
  it('redirects unauthenticated users to /login', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route element={<AuthGuard />}>
            <Route path="/dashboard" element={<div>Dashboard</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
  });

  it('renders protected content for authenticated users', () => {
    useAuthStore.setState({ token: 'valid-token', user: { userId: 'u1', role: 'Admin' } });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route element={<AuthGuard />}>
            <Route path="/dashboard" element={<div>Dashboard</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
  });
});
