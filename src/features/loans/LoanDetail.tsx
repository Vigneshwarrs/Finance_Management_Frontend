import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { apiClient } from '../../api/client';
import { useToastStore } from '../../store/toastStore';

function InstallmentSchedule({ installments }: { installments: any[] }) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Installment Schedule</h2>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700">
            <th className="text-left p-2">#</th>
            <th className="text-left p-2">Due Date</th>
            <th className="text-left p-2">Total</th>
            <th className="text-left p-2">Paid</th>
            <th className="text-left p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {installments.map((inst: any) => (
            <tr key={inst.id} className="border-b dark:border-gray-700">
              <td className="p-2">{inst.sequenceNumber}</td>
              <td className="p-2">{inst.dueDate?.split('T')[0]}</td>
              <td className="p-2">${inst.totalAmount?.toFixed(2)}</td>
              <td className="p-2">${inst.paidAmount?.toFixed(2)}</td>
              <td className="p-2">{inst.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LoanOfficerAssign({ loanId }: { loanId: string }) {
  const [officerId, setOfficerId] = useState('');
  const qc = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  const mutation = useMutation({
    mutationFn: () => apiClient.put(`/loans/${loanId}/assign`, { officerId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['loan', loanId] });
      addToast('Officer assigned', 'success');
      setOfficerId('');
    },
  });

  return (
    <div className="flex gap-2 items-center">
      <label htmlFor="officerId" className="text-sm font-medium">Assign Officer:</label>
      <input
        id="officerId"
        value={officerId}
        onChange={(e) => setOfficerId(e.target.value)}
        placeholder="Officer user ID"
        className="border rounded px-2 py-1 text-sm flex-1"
      />
      <button
        onClick={() => mutation.mutate()}
        disabled={!officerId || mutation.isPending}
        className="bg-blue-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
      >
        Assign
      </button>
    </div>
  );
}

export function LoanDetail() {
  const { id } = useParams<{ id: string }>();

  const { data: loan, isLoading } = useQuery({
    queryKey: ['loan', id],
    queryFn: () => apiClient.get(`/loans/${id}`).then((r) => r.data),
    enabled: Boolean(id),
  });

  const { data: penalty } = useQuery({
    queryKey: ['loan-penalty', id],
    queryFn: () => apiClient.get(`/loans/${id}/penalty`).then((r) => r.data),
    enabled: Boolean(id),
  });

  if (isLoading) return <p>Loading...</p>;
  if (!loan) return <p>Loan not found.</p>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Loan Details</h1>
        <Link to={`/loans/${id}/edit`} className="bg-green-600 text-white px-4 py-2 rounded text-sm">Edit</Link>
      </div>

      <dl className="grid grid-cols-2 gap-2 text-sm">
        <dt className="font-medium">Status</dt><dd>{loan.status}</dd>
        <dt className="font-medium">Principal</dt><dd>${loan.principal?.toFixed(2)}</dd>
        <dt className="font-medium">Interest Rate</dt><dd>{(loan.interestRate * 100).toFixed(2)}%</dd>
        <dt className="font-medium">Term</dt><dd>{loan.termMonths} months</dd>
        <dt className="font-medium">Start Date</dt><dd>{loan.startDate?.split('T')[0]}</dd>
        <dt className="font-medium">Assigned Officer</dt><dd>{loan.assignedOfficerId ?? '—'}</dd>
        {penalty && (
          <>
            <dt className="font-medium">Penalty Rate</dt><dd>{penalty.penaltyRate}</dd>
            <dt className="font-medium">Penalty Accrued</dt><dd>${penalty.penaltyAccrued?.toFixed(2)}</dd>
          </>
        )}
      </dl>

      <LoanOfficerAssign loanId={id!} />

      {loan.installments && <InstallmentSchedule installments={loan.installments} />}
    </div>
  );
}
