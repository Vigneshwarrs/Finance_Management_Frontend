import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { apiClient } from '../../api/client';

export function LoanList() {
  const { data: loans = [], isLoading } = useQuery({
    queryKey: ['loans'],
    queryFn: () => apiClient.get('/loans').then((r) => r.data),
  });

  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Loans</h1>
        <Link to="/loans/new" className="bg-blue-600 text-white px-4 py-2 rounded text-sm">New Loan</Link>
      </div>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700">
            <th className="text-left p-2">ID</th>
            <th className="text-left p-2">Borrower</th>
            <th className="text-left p-2">Principal</th>
            <th className="text-left p-2">Status</th>
            <th className="text-left p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loans.map((l: any) => (
            <tr key={l.id} className="border-b dark:border-gray-700">
              <td className="p-2 font-mono text-xs">{l.id.slice(0, 8)}…</td>
              <td className="p-2">{l.borrowerId}</td>
              <td className="p-2">${l.principal?.toFixed(2)}</td>
              <td className="p-2">{l.status}</td>
              <td className="p-2">
                <Link to={`/loans/${l.id}`} className="text-blue-600 hover:underline mr-2">View</Link>
                <Link to={`/loans/${l.id}/edit`} className="text-green-600 hover:underline">Edit</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
