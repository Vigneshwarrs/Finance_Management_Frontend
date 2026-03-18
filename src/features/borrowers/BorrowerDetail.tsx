import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { DocumentUpload } from './DocumentUpload';

export function BorrowerDetail() {
  const { id } = useParams<{ id: string }>();

  const { data: borrower, isLoading } = useQuery({
    queryKey: ['borrower', id],
    queryFn: () => apiClient.get(`/borrowers/${id}`).then((r) => r.data),
    enabled: Boolean(id),
  });

  if (isLoading) return <p>Loading...</p>;
  if (!borrower) return <p>Borrower not found.</p>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">{borrower.name}</h1>
        <Link to={`/borrowers/${id}/edit`} className="bg-green-600 text-white px-4 py-2 rounded text-sm">
          Edit
        </Link>
      </div>

      <dl className="grid grid-cols-2 gap-2 text-sm">
        <dt className="font-medium">ID Number</dt>
        <dd>{borrower.identificationNumber}</dd>
        <dt className="font-medium">Email</dt>
        <dd>{borrower.contact?.email}</dd>
        <dt className="font-medium">Phone</dt>
        <dd>{borrower.contact?.phone ?? '—'}</dd>
        <dt className="font-medium">Address</dt>
        <dd>{[borrower.address?.street, borrower.address?.city, borrower.address?.country].filter(Boolean).join(', ')}</dd>
      </dl>

      <DocumentUpload borrowerId={id!} />
    </div>
  );
}
