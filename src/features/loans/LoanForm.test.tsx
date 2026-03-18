import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { LoanForm } from './LoanForm';
import { apiClient } from '../../api/client';

vi.mock('../../api/client', () => ({
  apiClient: { post: vi.fn(), get: vi.fn(), put: vi.fn() },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => vi.fn(), useParams: () => ({}) };
});

function renderForm() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <LoanForm />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

beforeEach(() => { vi.clearAllMocks(); });

describe('LoanForm', () => {
  it('renders penalty rate and officer assignment fields', () => {
    renderForm();
    expect(screen.getByLabelText(/penalty rate/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/assigned officer/i)).toBeInTheDocument();
  });

  it('shows validation errors when submitted empty', async () => {
    renderForm();
    fireEvent.click(screen.getByRole('button', { name: /create/i }));
    await waitFor(() => {
      expect(screen.getAllByRole('alert').length).toBeGreaterThan(0);
    });
  });
});
