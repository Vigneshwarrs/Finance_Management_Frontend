
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { borrowerSchema, BorrowerFormData } from './schemas';
import { setFormErrors } from '../../utils/formErrors';
import { useToastStore } from '../../store/toastStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
        <Label htmlFor="name" className="block text-sm font-medium mb-1">Name</Label>
        <Input id="name" {...register('name')} />
        {errors.name && <p role="alert" className="text-error text-xs mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <Label htmlFor="identificationNumber" className="block text-sm font-medium mb-1">ID Number</Label>
        <Input id="identificationNumber" {...register('identificationNumber')} />
        {errors.identificationNumber && <p role="alert" className="text-error text-xs mt-1">{errors.identificationNumber.message}</p>}
      </div>

      <div>
        <Label htmlFor="email" className="block text-sm font-medium mb-1">Email</Label>
        <Input id="email" type="email" {...register('contact.email')} />
        {errors.contact?.email && <p role="alert" className="text-error text-xs mt-1">{errors.contact.email.message}</p>}
      </div>

      <div>
        <Label htmlFor="phone" className="block text-sm font-medium mb-1">Phone (optional)</Label>
        <Input id="phone" {...register('contact.phone')} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="street" className="block text-sm font-medium mb-1">Street</Label>
          <Input id="street" {...register('address.street')} />
          {errors.address?.street && <p role="alert" className="text-error text-xs mt-1">{errors.address.street.message}</p>}
        </div>
        <div>
          <Label htmlFor="city" className="block text-sm font-medium mb-1">City</Label>
          <Input id="city" {...register('address.city')} />
          {errors.address?.city && <p role="alert" className="text-error text-xs mt-1">{errors.address.city.message}</p>}
        </div>
        <div>
          <Label htmlFor="state" className="block text-sm font-medium mb-1">State</Label>
          <Input id="state" {...register('address.state')} />
        </div>
        <div>
          <Label htmlFor="postalCode" className="block text-sm font-medium mb-1">Postal Code</Label>
          <Input id="postalCode" {...register('address.postalCode')} />
        </div>
        <div>
          <Label htmlFor="country" className="block text-sm font-medium mb-1">Country</Label>
          <Input id="country" {...register('address.country')} />
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
