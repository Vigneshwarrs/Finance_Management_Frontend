import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { BorrowerForm } from './BorrowerForm';
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
        <BorrowerForm />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

beforeEach(() => { vi.clearAllMocks(); });

describe('BorrowerForm', () => {
  it('shows validation errors when submitted empty', async () => {
    renderForm();
    fireEvent.click(screen.getByRole('button', { name: /create/i }));
    await waitFor(() => {
      expect(screen.getAllByRole('alert').length).toBeGreaterThan(0);
    });
  });

  it('calls API on valid submission', async () => {
    const mockPost = vi.mocked(apiClient.post);
    mockPost.mockResolvedValueOnce({ data: { id: 'b1', name: 'Test' } });

    renderForm();
    await userEvent.type(screen.getByLabelText(/name/i), 'John Doe');
    await userEvent.type(screen.getByLabelText(/id number/i), 'ID-001');
    await userEvent.type(screen.getByLabelText(/email/i), 'john@example.com');
    await userEvent.type(screen.getByLabelText(/street/i), '1 Main St');
    await userEvent.type(screen.getByLabelText(/city/i), 'Springfield');
    await userEvent.type(screen.getByLabelText(/state/i), 'IL');
    await userEvent.type(screen.getByLabelText(/postal code/i), '62701');
    await userEvent.type(screen.getByLabelText(/country/i), 'US');

    fireEvent.click(screen.getByRole('button', { name: /create/i }));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/borrowers', expect.objectContaining({ name: 'John Doe' }));
    });
  });
});
