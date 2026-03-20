import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { ExportButton } from './ExportButton';
import KpiCard from '@/components/KpiCard';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

export function PortfolioSummary() {
  const { data, isLoading } = useQuery({
    queryKey: ['portfolio'],
    queryFn: () => apiClient.get('/reports/portfolio').then((r) => r.data),
  });

  const reportCards = [
    { label: 'Active Loans', value: data?.totalActiveLoanCount },
    { label: 'Total Disbursed', value: data ? `₹${data.totalDisbursed.toFixed(2)}` : undefined },
    { label: 'Outstanding', value: data ? `₹${data.totalOutstandingBalance.toFixed(2)}` : undefined },
    { label: 'Collected', value: data ? `₹${data.totalCollected.toFixed(2)}` : undefined },
  ];

  const { data: overdue = [], isLoading: overdueLoading } = useQuery({
    queryKey: ['overdue-report'],
    queryFn: () => apiClient.get('/reports/overdue').then((r) => r.data),
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Reports</h1>
        <ExportButton endpoint="/reports/portfolio/export" filename="portfolio-summary" />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        data && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {reportCards.map(({ label, value }) => (
              <KpiCard key={label} label={label} value={value} />
            ))}
          </div>
        )
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Overdue Loans</h2>
        <ExportButton endpoint="/reports/overdue/export" filename="overdue-report" />
      </div>

      {overdueLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded" />
          ))}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Loan ID</TableHead>
              <TableHead>Borrower</TableHead>
              <TableHead>Overdue Amount</TableHead>
              <TableHead>Days Overdue</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {overdue.map((e: any) => (
              <TableRow key={e.loanId}>
                <TableCell className="font-mono text-xs">{e.loanId.slice(0, 8)}…</TableCell>
                <TableCell>{e.borrowerName}</TableCell>
                <TableCell>₹{e.overdueAmount?.toFixed(2)}</TableCell>
                <TableCell>{e.daysOverdue}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
