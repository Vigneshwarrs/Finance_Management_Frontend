import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { useToastStore } from '../../store/toastStore';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../components/ui/form';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Skeleton } from '../../components/ui/skeleton';

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

  const form = useForm<RepaymentFormData>({
    resolver: zodResolver(repaymentSchema),
    defaultValues: { loanId: '', amount: 0, paymentDate: new Date().toISOString().split('T')[0] },
  });

  const mutation = useMutation({
    mutationFn: (data: RepaymentFormData) =>
      apiClient.post(`/loans/${data.loanId}/repayments`, { amount: data.amount, paymentDate: data.paymentDate }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['repayments', vars.loanId] });
      addToast('Repayment recorded', 'success');
      setSelectedLoanId(vars.loanId);
      form.reset();
    },
  });

  const { data: history = [], isLoading: historyLoading } = useQuery({
    queryKey: ['repayments', selectedLoanId],
    queryFn: () => apiClient.get(`/loans/${selectedLoanId}/repayments`).then((r) => r.data),
    enabled: Boolean(selectedLoanId),
  });

  return (
    <div className="space-y-6">
      <Card className="max-w-sm">
        <CardHeader>
          <CardTitle>Record Repayment</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
              <FormField
                control={form.control}
                name="loanId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loan ID</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input type="number" step="any" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="paymentDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={form.formState.isSubmitting || mutation.isPending}>
                Record
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {selectedLoanId && (
        <Card>
          <CardHeader>
            <CardTitle>Repayment History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historyLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    </TableRow>
                  ))
                ) : history.length > 0 ? (
                  history.map((r: any) => (
                    <TableRow key={r.id}>
                      <TableCell>{r.paymentDate?.split('T')[0]}</TableCell>
                      <TableCell>₹{r.amount?.toFixed(2)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground">
                      No repayments found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
