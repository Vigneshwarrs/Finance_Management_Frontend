import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { useToastStore } from '../../store/toastStore';

const repaymentSchema = z.object({
  loanId: z.string().min(1, 'Loan ID is required'),
  amount: z.coerce.number().positive('Amount must be positive'),
  paymentDate: z.string().min(1, 'Payment date is required'),
});

type RepaymentFormData = z.infer<typeof repaymentSchema>;

export function RepaymentForm() {
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
  const qc = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<RepaymentFormData>({
    resolver: zodResolver(repaymentSchema),
    defaultValues: { paymentDate: new Date().toISOString().split('T')[0] },
  });

  const mutation = useMutation({
    mutationFn: (data: RepaymentFormData) =>
      apiClient.post(`/loans/${data.loanId}/repayments`, { amount: data.amount, paymentDate: data.paymentDate }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['repayments', vars.loanId] });
      addToast('Repayment recorded', 'success');
      setSelectedLoanId(vars.loanId);
      reset();
    },
  });

  const { data: history = [] } = useQuery({
    queryKey: ['repayments', selectedLoanId],
    queryFn: () => apiClient.get(`/loans/${selectedLoanId}/repayments`).then((r) => r.data),
    enabled: Boolean(selectedLoanId),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Record Repayment</h1>

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="max-w-sm space-y-4">
        <div>
          <label htmlFor="loanId" className="block text-sm font-medium mb-1">Loan ID</label>
          <input id="loanId" {...register('loanId')} className="w-full border rounded px-3 py-2 text-sm" />
          {errors.loanId && <p role="alert" className="text-red-500 text-xs mt-1">{errors.loanId.message}</p>}
        </div>
        <div>
          <label htmlFor="amount" className="block text-sm font-medium mb-1">Amount</label>
          <input id="amount" type="number" step="any" {...register('amount')} className="w-full border rounded px-3 py-2 text-sm" />
          {errors.amount && <p role="alert" className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
        </div>
        <div>
          <label htmlFor="paymentDate" className="block text-sm font-medium mb-1">Payment Date</label>
          <input id="paymentDate" type="date" {...register('paymentDate')} className="w-full border rounded px-3 py-2 text-sm" />
          {errors.paymentDate && <p role="alert" className="text-red-500 text-xs mt-1">{errors.paymentDate.message}</p>}
        </div>
        <button type="submit" disabled={isSubmitting || mutation.isPending} className="bg-blue-600 text-white px-4 py-2 rounded text-sm disabled:opacity-50">
          Record
        </button>
      </form>

      {selectedLoanId && history.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-2">Repayment History</h2>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="text-left p-2">Date</th>
                <th className="text-left p-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {history.map((r: any) => (
                <tr key={r.id} className="border-b dark:border-gray-700">
                  <td className="p-2">{r.paymentDate?.split('T')[0]}</td>
                  <td className="p-2">${r.amount?.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
