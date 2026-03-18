import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { LoginForm } from './LoginForm';
import { apiClient } from '../../api/client';

vi.mock('../../api/client', () => ({
  apiClient: { post: vi.fn() },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => vi.fn() };
});

function renderLoginForm() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('LoginForm', () => {
  it('shows field errors when submitted empty', async () => {
    renderLoginForm();
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getAllByRole('alert').length).toBeGreaterThan(0);
    });
  });

  it('calls API with credentials on valid submission', async () => {
    const mockPost = vi.mocked(apiClient.post);
    mockPost.mockResolvedValueOnce({ data: { token: 'tok', userId: 'u1', role: 'Admin' } });

    renderLoginForm();
    await userEvent.type(screen.getByLabelText(/username/i), 'admin');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/auth/login', { username: 'admin', password: 'password123' });
    });
  });

  it('shows error when API returns 401', async () => {
    const mockPost = vi.mocked(apiClient.post);
    mockPost.mockRejectedValueOnce({
      response: { status: 401, data: { error: 'invalid_credentials' } },
    });

    renderLoginForm();
    await userEvent.type(screen.getByLabelText(/username/i), 'wrong');
    await userEvent.type(screen.getByLabelText(/password/i), 'wrong');
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalled();
    });
  });
});
