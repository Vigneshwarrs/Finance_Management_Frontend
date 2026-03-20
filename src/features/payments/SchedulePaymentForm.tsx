import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { useSchedulePayment } from './hooks/usePayments';

interface Loan {
  id: string;
  principal: number;
  status: string;
}

const schema = z.object({
  loanId: z.string().min(1, 'Select a loan'),
  amount: z
    .number({ invalid_type_error: 'Enter a valid amount' })
    .positive('Amount must be positive'),
  scheduledDate: z.string().refine((d) => {
    const date = new Date(d);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date > today && date.getDate() <= 20;
  }, 'Must be a future date on or before the 20th of the month'),
});

type FormValues = z.infer<typeof schema>;

function getDateConstraints(): { min: string; max: string } {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const day = String(tomorrow.getDate()).padStart(2, '0');
  const min = `${year}-${month}-${day}`;

  // max is the 20th of current month, or 20th of next month if today > 20th
  let maxYear = today.getFullYear();
  let maxMonth = today.getMonth() + 1;
  if (today.getDate() > 20) {
    maxMonth += 1;
    if (maxMonth > 12) {
      maxMonth = 1;
      maxYear += 1;
    }
  }
  const max = `${maxYear}-${String(maxMonth).padStart(2, '0')}-20`;

  return { min, max };
}

export function SchedulePaymentForm() {
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: loans = [], isLoading: loansLoading } = useQuery<Loan[]>({
    queryKey: ['loans'],
    queryFn: () => apiClient.get('/loans').then((r) => r.data),
  });

  const activeLoans = loans.filter((l) => l.status === 'active');

  const schedulePayment = useSchedulePayment();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      loanId: '',
      amount: undefined,
      scheduledDate: '',
    },
  });

  const { min, max } = getDateConstraints();

  function onSubmit(values: FormValues) {
    setSuccessMsg(null);
    setErrorMsg(null);

    schedulePayment.mutate(
      {
        loanId: values.loanId,
        amount: values.amount,
        scheduledDate: new Date(values.scheduledDate).toISOString(),
      },
      {
        onSuccess: () => {
          setSuccessMsg('Payment scheduled successfully.');
          form.reset();
        },
        onError: (err: unknown) => {
          const message =
            err instanceof Error ? err.message : 'Failed to schedule payment. Please try again.';
          setErrorMsg(message);
        },
      }
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Schedule a Payment</CardTitle>
      </CardHeader>
      <CardContent>
        {successMsg && (
          <div className="mb-4 rounded-md bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 px-4 py-3 text-sm text-green-800 dark:text-green-200">
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="mb-4 rounded-md bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-800 dark:text-red-200">
            {errorMsg}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="loanId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loan</FormLabel>
                  <Select
                    disabled={loansLoading}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={loansLoading ? 'Loading loans…' : 'Select a loan'} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {activeLoans.length === 0 && !loansLoading ? (
                        <SelectItem value="__none__" disabled>
                          No active loans
                        </SelectItem>
                      ) : (
                        activeLoans.map((loan) => (
                          <SelectItem key={loan.id} value={loan.id}>
                            {loan.id.slice(0, 8)}… — ₹{loan.principal.toFixed(2)}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (₹)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0.01}
                      step={0.01}
                      placeholder="0.00"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) =>
                        field.onChange(e.target.value === '' ? undefined : Number(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="scheduledDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scheduled Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      min={min}
                      max={max}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={schedulePayment.isPending}
            >
              {schedulePayment.isPending ? 'Scheduling…' : 'Schedule Payment'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
