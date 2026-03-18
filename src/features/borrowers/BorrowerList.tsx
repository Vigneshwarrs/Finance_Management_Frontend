import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { apiClient } from '../../api/client';

export function BorrowerList() {
  const { data: borrowers = [], isLoading } = useQuery({
    queryKey: ['borrowers'],
    queryFn: () => apiClient.get('/borrowers').then((r) => r.data),
  });

  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Borrowers</h1>
        <Link to="/borrowers/new" className="bg-blue-600 text-white px-4 py-2 rounded text-sm">
          Add Borrower
        </Link>
      </div>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700">
            <th className="text-left p-2">Name</th>
            <th className="text-left p-2">ID Number</th>
            <th className="text-left p-2">Email</th>
            <th className="text-left p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {borrowers.map((b: any) => (
            <tr key={b.id} className="border-b dark:border-gray-700">
              <td className="p-2">{b.name}</td>
              <td className="p-2">{b.identificationNumber}</td>
              <td className="p-2">{b.contact?.email}</td>
              <td className="p-2">
                <Link to={`/borrowers/${b.id}`} className="text-blue-600 hover:underline mr-2">View</Link>
                <Link to={`/borrowers/${b.id}/edit`} className="text-green-600 hover:underline">Edit</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
