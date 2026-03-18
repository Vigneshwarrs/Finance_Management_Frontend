import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { ExportButton } from './ExportButton';
import KpiCard from '@/components/KpiCard';

export function PortfolioSummary() {
  const { data, isLoading } = useQuery({
    queryKey: ['portfolio'],
    queryFn: () => apiClient.get('/reports/portfolio').then((r) => r.data),
  });

  const reportCards = [
    { label: 'Active Loans', value: data?.totalActiveLoanCount },
    { label: 'Total Disbursed', value: data ? `$${data.totalDisbursed.toFixed(2)}` : undefined },
    { label: 'Outstanding', value: data ? `$${data.totalOutstandingBalance.toFixed(2)}` : undefined },
    { label: 'Collected', value: data ? `$${data.totalCollected.toFixed(2)}` : undefined },
  ];

  const { data: overdue = [], isLoading: overdueLoading } = useQuery({
    queryKey: ['overdue-report'],
    queryFn: () => apiClient.get('/reports/overdue').then((r) => r.data),
  });

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Reports</h1>
        <ExportButton endpoint="/reports/portfolio/export" filename="portfolio-summary" />
      </div>

      {data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {reportCards.map(({ label, value }) => (
            <KpiCard key={label} label={label} value={value} />
          ))}
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Overdue Loans</h2>
        <ExportButton endpoint="/reports/overdue/export" filename="overdue-report" />
      </div>

      {!overdueLoading && (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="text-left p-2">Loan ID</th>
              <th className="text-left p-2">Borrower</th>
              <th className="text-left p-2">Overdue Amount</th>
              <th className="text-left p-2">Days Overdue</th>
            </tr>
          </thead>
          <tbody>
            {overdue.map((e: any) => (
              <tr key={e.loanId} className="border-b dark:border-gray-700">
                <td className="p-2 font-mono text-xs">{e.loanId.slice(0, 8)}…</td>
                <td className="p-2">{e.borrowerName}</td>
                <td className="p-2">${e.overdueAmount?.toFixed(2)}</td>
                <td className="p-2">{e.daysOverdue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
