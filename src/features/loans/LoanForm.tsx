import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { loanSchema, LoanFormData } from './schemas';
import { setFormErrors } from '../../utils/formErrors';
import { useToastStore } from '../../store/toastStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

  const form = useForm<LoanFormData>({
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
      if (details) setFormErrors(form.setError, details);
    },
  });

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>{isEdit ? 'Edit Loan' : 'New Loan'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
            <FormField
              control={form.control}
              name="borrowerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Borrower ID</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="principal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Principal (₹)</FormLabel>
                  <FormControl>
                    <Input type="number" step="any" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="interestRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Interest Rate (0–1)</FormLabel>
                  <FormControl>
                    <Input type="number" step="any" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="interestMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Interest Method</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="flat-rate">Flat Rate</SelectItem>
                      <SelectItem value="reducing-balance">Reducing Balance</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="termMonths"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Term (months)</FormLabel>
                  <FormControl>
                    <Input type="number" step="1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="penaltyRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Penalty Rate (optional)</FormLabel>
                  <FormControl>
                    <Input type="number" step="any" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="assignedOfficerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigned Officer ID (optional)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={form.formState.isSubmitting || mutation.isPending}
              className="w-full"
            >
              {isEdit ? 'Update' : 'Create'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
