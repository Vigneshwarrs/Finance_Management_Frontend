import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useCreateApplication } from './hooks/useLoanApplications';

const loanApplicationSchema = z.object({
  requestedPrincipal: z.number().positive(),
  requestedTermMonths: z.number().int().min(1).max(360),
  purpose: z.string().min(10, 'Please describe the loan purpose'),
  documents: z.array(z.string().uuid()).optional().default([]),
});

type LoanApplicationFormValues = z.infer<typeof loanApplicationSchema>;

export function ApplicationForm() {
  const navigate = useNavigate();
  const createApplication = useCreateApplication();

  const form = useForm<LoanApplicationFormValues>({
    resolver: zodResolver(loanApplicationSchema),
    defaultValues: {
      requestedPrincipal: 0,
      requestedTermMonths: 12,
      purpose: '',
      documents: [],
    },
  });

  function onSubmit(values: LoanApplicationFormValues) {
    createApplication.mutate(values, {
      onSuccess: () => navigate('/applications'),
    });
  }

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-2xl font-semibold mb-6">New Loan Application</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="requestedPrincipal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Requested Principal</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="e.g. 50000"
                    {...field}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="requestedTermMonths"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Term (months)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="e.g. 24"
                    min={1}
                    max={360}
                    {...field}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="purpose"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purpose</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe the purpose of this loan (min 10 characters)"
                    rows={4}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormItem>
            <FormLabel>Documents (optional)</FormLabel>
            <Input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              disabled
              className="cursor-not-allowed opacity-60"
            />
            <p className="text-sm text-muted-foreground">
              Document upload coming soon.
            </p>
          </FormItem>

          <div className="flex gap-3">
            <Button type="submit" disabled={createApplication.isPending}>
              {createApplication.isPending ? 'Submitting…' : 'Submit'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/applications')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
