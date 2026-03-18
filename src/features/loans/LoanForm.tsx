
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { loanSchema, LoanFormData } from './schemas';
import { setFormErrors } from '../../utils/formErrors';
import { useToastStore } from '../../store/toastStore';
import { Button } from '@/components/ui/button';

export function LoanForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  const { data: existing } = useQuery({
    queryKey: ['loan', id],
    queryFn: () => apiClient.get(`/loans/${id}`).then((r) => r.data),
    enabled: isEdit,
  });

  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<LoanFormData>({
    resolver: zodResolver(loanSchema),
    values: existing ? { ...existing, startDate: existing.startDate?.split('T')[0] } : undefined,
  });

  const mutation = useMutation({
    mutationFn: (data: LoanFormData) =>
      isEdit ? apiClient.put(`/loans/${id}`, data) : apiClient.post('/loans', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['loans'] });
      addToast(isEdit ? 'Loan updated' : 'Loan created', 'success');
      navigate('/loans');
    },
    onError: (err: any) => {
      const details = err.response?.data?.details;
      if (details) setFormErrors(setError, details);
    },
  });

  return (
    <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="max-w-lg space-y-4 bg-surface p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
      <h1 className="text-2xl font-bold text-primary mb-4">{isEdit ? 'Edit Loan' : 'New Loan'}</h1>

      {[
        { id: 'borrowerId', label: 'Borrower ID', type: 'text' },
        { id: 'principal', label: 'Principal', type: 'number' },
        { id: 'interestRate', label: 'Interest Rate (0–1)', type: 'number' },
        { id: 'startDate', label: 'Start Date', type: 'date' },
        { id: 'termMonths', label: 'Term (months)', type: 'number' },
        { id: 'penaltyRate', label: 'Penalty Rate (optional)', type: 'number' },
        { id: 'assignedOfficerId', label: 'Assigned Officer ID (optional)', type: 'text' },
      ].map(({ id: fieldId, label, type }) => (
        <div key={fieldId}>
          <label htmlFor={fieldId} className="block text-sm font-medium mb-1">{label}</label>
          <input
            id={fieldId}
            type={type}
            step={type === 'number' ? 'any' : undefined}
            {...register(fieldId as keyof LoanFormData)}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
          />
          {errors[fieldId as keyof LoanFormData] && (
            <p role="alert" className="text-error text-xs mt-1">
              {errors[fieldId as keyof LoanFormData]?.message as string}
            </p>
          )}
        </div>
      ))}

      <div>
        <label htmlFor="interestMethod" className="block text-sm font-medium mb-1">Interest Method</label>
        <select id="interestMethod" {...register('interestMethod')} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white">
          <option value="flat-rate">Flat Rate</option>
          <option value="reducing-balance">Reducing Balance</option>
        </select>
        {errors.interestMethod && <p role="alert" className="text-error text-xs mt-1">{errors.interestMethod.message}</p>}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting || mutation.isPending}
        className="w-full"
      >
        {isEdit ? 'Update' : 'Create'}
      </Button>
    </form>
  );
}
