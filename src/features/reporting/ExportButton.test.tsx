import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ExportButton } from './ExportButton';
import { apiClient } from '../../api/client';

vi.mock('../../api/client', () => ({
  apiClient: { get: vi.fn() },
}));

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:mock');
global.URL.revokeObjectURL = vi.fn();

beforeEach(() => { vi.clearAllMocks(); });

describe('ExportButton', () => {
  it('calls API with pdf format when Export PDF is clicked', async () => {
    const mockGet = vi.mocked(apiClient.get);
    mockGet.mockResolvedValueOnce({ data: new Blob(['pdf content']) });

    render(<ExportButton endpoint="/reports/portfolio/export" filename="portfolio" />);
    fireEvent.click(screen.getByText('Export PDF'));

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith(
        expect.stringContaining('format=pdf'),
        expect.objectContaining({ responseType: 'blob' })
      );
    });
  });

  it('calls API with csv format when Export CSV is clicked', async () => {
    const mockGet = vi.mocked(apiClient.get);
    mockGet.mockResolvedValueOnce({ data: new Blob(['csv content']) });

    render(<ExportButton endpoint="/reports/portfolio/export" filename="portfolio" />);
    fireEvent.click(screen.getByText('Export CSV'));

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith(
        expect.stringContaining('format=csv'),
        expect.objectContaining({ responseType: 'blob' })
      );
    });
  });
});
