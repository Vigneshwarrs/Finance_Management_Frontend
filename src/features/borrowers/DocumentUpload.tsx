import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { useToastStore } from '../../store/toastStore';

const DOCUMENT_TYPES = [
  'national_id', 'passport', 'proof_of_income', 'bank_statement', 'utility_bill', 'other',
] as const;

interface Props {
  borrowerId: string;
}

export function DocumentUpload({ borrowerId }: Props) {
  const [docType, setDocType] = useState<string>('national_id');
  const qc = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  const { data: documents = [] } = useQuery({
    queryKey: ['documents', borrowerId],
    queryFn: () => apiClient.get(`/borrowers/${borrowerId}/documents`).then((r) => r.data),
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => {
      const form = new FormData();
      form.append('file', file);
      form.append('type', docType);
      return apiClient.post(`/borrowers/${borrowerId}/documents`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['documents', borrowerId] });
      addToast('Document uploaded', 'success');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (docId: string) => apiClient.delete(`/documents/${docId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['documents', borrowerId] });
      addToast('Document deleted', 'success');
    },
  });

  const onDrop = useCallback((files: File[]) => {
    if (files[0]) uploadMutation.mutate(files[0]);
  }, [uploadMutation]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
  });

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Documents</h2>

      <div className="flex gap-2 items-center">
        <label htmlFor="docType" className="text-sm font-medium">Type:</label>
        <select
          id="docType"
          value={docType}
          onChange={(e) => setDocType(e.target.value)}
          className="border rounded px-2 py-1 text-sm"
        >
          {DOCUMENT_TYPES.map((t) => (
            <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded p-6 text-center cursor-pointer ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
        aria-label="Drop zone for document upload"
      >
        <input {...getInputProps()} aria-label="File input" />
        <p className="text-sm text-gray-500">
          {isDragActive ? 'Drop the file here...' : 'Drag & drop a file, or click to select (PDF, JPG, PNG — max 10MB)'}
        </p>
      </div>

      {documents.length > 0 && (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="text-left p-2">Filename</th>
              <th className="text-left p-2">Type</th>
              <th className="text-left p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc: any) => (
              <tr key={doc.id} className="border-b dark:border-gray-700">
                <td className="p-2">{doc.filename}</td>
                <td className="p-2">{doc.type}</td>
                <td className="p-2">
                  <button
                    onClick={() => deleteMutation.mutate(doc.id)}
                    className="text-red-500 hover:text-red-700 text-xs"
                    aria-label={`Delete ${doc.filename}`}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
