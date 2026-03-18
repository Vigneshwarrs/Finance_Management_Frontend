
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { borrowerSchema, BorrowerFormData } from './schemas';
import { setFormErrors } from '../../utils/formErrors';
import { useToastStore } from '../../store/toastStore';
import { Button } from '@shadcn/ui/button';

export function BorrowerForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  const { data: existing } = useQuery({
    queryKey: ['borrower', id],
    queryFn: () => apiClient.get(`/borrowers/${id}`).then((r) => r.data),
    enabled: isEdit,
  });

  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<BorrowerFormData>({
    resolver: zodResolver(borrowerSchema),
    values: existing,
  });

  const mutation = useMutation({
    mutationFn: (data: BorrowerFormData) =>
      isEdit
        ? apiClient.put(`/borrowers/${id}`, data)
        : apiClient.post('/borrowers', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['borrowers'] });
      addToast(isEdit ? 'Borrower updated' : 'Borrower created', 'success');
      navigate('/borrowers');
    },
    onError: (err: any) => {
      const details = err.response?.data?.details;
      if (details) setFormErrors(setError, details);
    },
  });

  return (
    <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="max-w-lg space-y-4 bg-surface p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
      <h1 className="text-2xl font-bold text-primary mb-4">{isEdit ? 'Edit Borrower' : 'New Borrower'}</h1>

      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
        <input id="name" {...register('name')} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white" />
        {errors.name && <p role="alert" className="text-error text-xs mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="identificationNumber" className="block text-sm font-medium mb-1">ID Number</label>
        <input id="identificationNumber" {...register('identificationNumber')} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white" />
        {errors.identificationNumber && <p role="alert" className="text-error text-xs mt-1">{errors.identificationNumber.message}</p>}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
        <input id="email" type="email" {...register('contact.email')} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white" />
        {errors.contact?.email && <p role="alert" className="text-error text-xs mt-1">{errors.contact.email.message}</p>}
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium mb-1">Phone (optional)</label>
        <input id="phone" {...register('contact.phone')} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label htmlFor="street" className="block text-sm font-medium mb-1">Street</label>
          <input id="street" {...register('address.street')} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white" />
          {errors.address?.street && <p role="alert" className="text-error text-xs mt-1">{errors.address.street.message}</p>}
        </div>
        <div>
          <label htmlFor="city" className="block text-sm font-medium mb-1">City</label>
          <input id="city" {...register('address.city')} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white" />
          {errors.address?.city && <p role="alert" className="text-error text-xs mt-1">{errors.address.city.message}</p>}
        </div>
        <div>
          <label htmlFor="state" className="block text-sm font-medium mb-1">State</label>
          <input id="state" {...register('address.state')} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white" />
        </div>
        <div>
          <label htmlFor="postalCode" className="block text-sm font-medium mb-1">Postal Code</label>
          <input id="postalCode" {...register('address.postalCode')} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white" />
        </div>
        <div>
          <label htmlFor="country" className="block text-sm font-medium mb-1">Country</label>
          <input id="country" {...register('address.country')} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white" />
        </div>
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
