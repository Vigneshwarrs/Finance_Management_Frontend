import { useQuery } from '@tanstack/react-query';
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, ResponsiveContainer,
} from 'recharts';
import { apiClient } from '../../api/client';

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'];

function KpiCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow" role="region" aria-label={label}>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}

export function DashboardPage() {
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => apiClient.get('/reports/dashboard').then((r) => r.data),
  });

  if (isLoading) return <p>Loading dashboard...</p>;
  if (!dashboard) return null;

  const portfolioData = [
    { name: 'Outstanding', value: dashboard.totalOutstandingBalance },
    { name: 'Collected', value: dashboard.totalCollected },
    { name: 'Overdue', value: dashboard.totalOverdueAmount },
  ];

  const collectionData = [
    { name: 'Collection Rate', rate: dashboard.collectionRate },
  ];

  const overdueData = [
    { name: 'Overdue Loans', count: dashboard.overdueCount },
    { name: 'Active Loans', count: dashboard.totalActiveLoanCount },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Active Loans" value={dashboard.totalActiveLoanCount} />
        <KpiCard label="Total Disbursed" value={`$${dashboard.totalDisbursed?.toFixed(2)}`} />
        <KpiCard label="Outstanding" value={`$${dashboard.totalOutstandingBalance?.toFixed(2)}`} />
        <KpiCard label="Collection Rate" value={`${dashboard.collectionRate}%`} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow" role="region" aria-label="Portfolio Health Chart">
          <h2 className="text-sm font-semibold mb-2">Portfolio Health</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={portfolioData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70}>
                {portfolioData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow" role="region" aria-label="Overdue Trend Chart">
          <h2 className="text-sm font-semibold mb-2">Overdue vs Active</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={overdueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#ef4444" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow" role="region" aria-label="Collection Rate Chart">
          <h2 className="text-sm font-semibold mb-2">Collection Rate</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={collectionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="rate" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
