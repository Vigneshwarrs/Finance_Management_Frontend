import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { DashboardPage } from './DashboardPage';

const mockDashboard = {
  totalActiveLoanCount: 5,
  totalDisbursed: 50000,
  totalOutstandingBalance: 35000,
  totalCollected: 15000,
  totalOverdueAmount: 5000,
  overdueCount: 2,
  collectionRate: 30,
};

const server = setupServer(
  http.get('/api/reports/dashboard', () => HttpResponse.json(mockDashboard))
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

vi.mock('../../api/client', () => ({
  apiClient: {
    get: vi.fn().mockResolvedValue({
      data: {
        totalActiveLoanCount: 5,
        totalDisbursed: 50000,
        totalOutstandingBalance: 35000,
        totalCollected: 15000,
        totalOverdueAmount: 5000,
        overdueCount: 2,
        collectionRate: 30,
      },
    }),
  },
}));

function renderDashboard() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('DashboardPage', () => {
  it('renders KPI cards with mocked data', async () => {
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByRole('region', { name: 'Active Loans' })).toBeInTheDocument();
      expect(screen.getByRole('region', { name: 'Total Disbursed' })).toBeInTheDocument();
      expect(screen.getByRole('region', { name: 'Outstanding' })).toBeInTheDocument();
      expect(screen.getByRole('region', { name: 'Collection Rate' })).toBeInTheDocument();
    });
  });

  it('renders all three chart regions', async () => {
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByRole('region', { name: /portfolio health/i })).toBeInTheDocument();
      expect(screen.getByRole('region', { name: /overdue/i })).toBeInTheDocument();
      expect(screen.getByRole('region', { name: /collection rate chart/i })).toBeInTheDocument();
    });
  });
});
