import { apiClient } from '../../api/client';

interface Props {
  endpoint: string;
  filename: string;
  extraParams?: Record<string, string>;
}

export function ExportButton({ endpoint, filename, extraParams = {} }: Props) {
  const handleExport = async (format: 'pdf' | 'csv') => {
    const params = new URLSearchParams({ format, ...extraParams });
    const res = await apiClient.get(`${endpoint}?${params}`, { responseType: 'blob' });
    const url = URL.createObjectURL(res.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handleExport('pdf')}
        className="bg-red-600 text-white px-3 py-1 rounded text-sm"
        aria-label={`Export ${filename} as PDF`}
      >
        Export PDF
      </button>
      <button
        onClick={() => handleExport('csv')}
        className="bg-green-600 text-white px-3 py-1 rounded text-sm"
        aria-label={`Export ${filename} as CSV`}
      >
        Export CSV
      </button>
    </div>
  );
}
