import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type BadgeVariant = 'default' | 'secondary' | 'outline' | 'destructive';

function statusVariant(status: string): BadgeVariant {
  switch (status) {
    case 'active':
      return 'default';
    case 'closed':
      return 'secondary';
    case 'pending':
    case 'draft':
      return 'outline';
    case 'overdue':
      return 'destructive';
    default:
      return 'secondary';
  }
}

export function LoanList() {
  const { data: loans = [], isLoading } = useQuery({
    queryKey: ['loans'],
    queryFn: () => apiClient.get('/loans').then((r) => r.data),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-9 w-28" />
        </div>
        <div className="border rounded-md">
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Loans</h1>
        <Button asChild>
          <Link to="/loans/new">New Loan</Link>
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Borrower</TableHead>
              <TableHead>Principal</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loans.length ? (
              loans.map((l: any) => (
                <TableRow key={l.id}>
                  <TableCell className="font-mono text-xs">{l.id.slice(0, 8)}…</TableCell>
                  <TableCell>{l.borrowerId}</TableCell>
                  <TableCell>₹{l.principal?.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(l.status)}>{l.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-x-2">
                      <Link to={`/loans/${l.id}`} className="text-blue-600 hover:underline">View</Link>
                      <Link to={`/loans/${l.id}/edit`} className="text-green-600 hover:underline">Edit</Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No loans found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
