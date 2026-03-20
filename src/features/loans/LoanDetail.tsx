import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { apiClient } from '../../api/client';
import { useToastStore } from '../../store/toastStore';
import { PermissionGuard } from '../../components/PermissionGuard';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type BadgeVariant = 'default' | 'secondary' | 'outline' | 'destructive';

function loanStatusVariant(status: string): BadgeVariant {
  switch (status) {
    case 'active': return 'default';
    case 'closed': return 'secondary';
    case 'pending': case 'draft': return 'outline';
    case 'overdue': return 'destructive';
    default: return 'secondary';
  }
}

function installmentStatusVariant(status: string): BadgeVariant {
  switch (status) {
    case 'paid': return 'default';
    case 'overdue': return 'destructive';
    case 'pending': return 'outline';
    case 'partial': return 'secondary';
    default: return 'secondary';
  }
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
    onError: () => addToast('Failed to assign officer', 'error'),
  });

  return (
    <div className="flex gap-2 items-center">
      <Label htmlFor="officerId" className="text-sm font-medium shrink-0">Assign Officer:</Label>
      <Input
        id="officerId"
        value={officerId}
        onChange={(e) => setOfficerId(e.target.value)}
        placeholder="Officer user ID"
        className="flex-1"
      />
      <Button
        size="sm"
        onClick={() => mutation.mutate()}
        disabled={!officerId || mutation.isPending}
      >
        Assign
      </Button>
    </div>
  );
}

function CloseLoanDialog({ loanId }: { loanId: string }) {
  const [notes, setNotes] = useState('');
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  const mutation = useMutation({
    mutationFn: () => apiClient.put(`/loans/${loanId}/close`, { closureNotes: notes }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['loan', loanId] });
      addToast('Loan closed successfully', 'success');
      setNotes('');
      setOpen(false);
    },
    onError: () => addToast('Failed to close loan', 'error'),
  });

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">Close Loan</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Close Loan</AlertDialogTitle>
          <AlertDialogDescription>
            This action will permanently close the loan. Please provide closure notes.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Closure notes..."
          className="mt-2"
          rows={3}
        />
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {mutation.isPending ? 'Closing…' : 'Close Loan'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function UpdateInterestForm({ loanId }: { loanId: string }) {
  const [interestOverride, setInterestOverride] = useState('');
  const qc = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  const mutation = useMutation({
    mutationFn: () =>
      apiClient.put(`/loans/${loanId}/interest`, { interestOverride: parseFloat(interestOverride) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['loan', loanId] });
      addToast('Interest rate updated', 'success');
      setInterestOverride('');
    },
    onError: () => addToast('Failed to update interest rate', 'error'),
  });

  const value = parseFloat(interestOverride);
  const isValid = !isNaN(value) && value >= 0 && value <= 1;

  return (
    <div className="flex gap-2 items-center">
      <Label htmlFor="interestOverride" className="text-sm font-medium shrink-0">Interest Override:</Label>
      <Input
        id="interestOverride"
        type="number"
        min={0}
        max={1}
        step={0.001}
        value={interestOverride}
        onChange={(e) => setInterestOverride(e.target.value)}
        placeholder="0.0 – 1.0"
        className="w-32"
      />
      <Button
        size="sm"
        onClick={() => mutation.mutate()}
        disabled={!isValid || mutation.isPending}
      >
        {mutation.isPending ? 'Updating…' : 'Update'}
      </Button>
    </div>
  );
}

function RepaymentsTab({ loanId }: { loanId: string }) {
  const { data: repayments = [], isLoading } = useQuery({
    queryKey: ['loan-repayments', loanId],
    queryFn: () => apiClient.get(`/loans/${loanId}/repayments`).then((r) => r.data),
    enabled: Boolean(loanId),
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Reference</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {repayments.length ? (
            repayments.map((r: any) => (
              <TableRow key={r.id}>
                <TableCell>{r.date?.split('T')[0] ?? r.createdAt?.split('T')[0]}</TableCell>
                <TableCell>₹{r.amount?.toFixed(2)}</TableCell>
                <TableCell>{r.method ?? '—'}</TableCell>
                <TableCell className="font-mono text-xs">{r.reference ?? r.id?.slice(0, 8)}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                No repayments recorded
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
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

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!loan) return <p>Loan not found.</p>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Loan Details</h1>
        <Button asChild variant="outline" size="sm">
          <Link to={`/loans/${id}/edit`}>Edit</Link>
        </Button>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="installments">Installments</TabsTrigger>
          <TabsTrigger value="repayments">Repayments</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Loan Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <dt className="font-medium">Status</dt>
                <dd><Badge variant={loanStatusVariant(loan.status)}>{loan.status}</Badge></dd>

                <dt className="font-medium">Principal</dt>
                <dd>₹{loan.principal?.toFixed(2)}</dd>

                <dt className="font-medium">Interest Rate</dt>
                <dd>{(loan.interestRate * 100).toFixed(2)}%</dd>

                <dt className="font-medium">Term</dt>
                <dd>{loan.termMonths} months</dd>

                <dt className="font-medium">Start Date</dt>
                <dd>{loan.startDate?.split('T')[0]}</dd>

                <dt className="font-medium">Assigned Officer</dt>
                <dd>{loan.assignedOfficerId ?? '—'}</dd>

                {loan.coolingPeriodEndsAt && (
                  <>
                    <dt className="font-medium">Cooling Period Ends</dt>
                    <dd>{loan.coolingPeriodEndsAt.split('T')[0]}</dd>
                  </>
                )}

                {penalty && (
                  <>
                    <dt className="font-medium">Penalty Rate</dt>
                    <dd>{penalty.penaltyRate}</dd>
                    <dt className="font-medium">Penalty Accrued</dt>
                    <dd>₹{penalty.penaltyAccrued?.toFixed(2)}</dd>
                  </>
                )}
              </dl>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <LoanOfficerAssign loanId={id!} />

            <PermissionGuard permission="loans:write">
              <UpdateInterestForm loanId={id!} />
            </PermissionGuard>

            <PermissionGuard permission="loans:close">
              <CloseLoanDialog loanId={id!} />
            </PermissionGuard>
          </div>
        </TabsContent>

        {/* Installments Tab */}
        <TabsContent value="installments">
          {loan.installments?.length ? (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loan.installments.map((inst: any) => (
                    <TableRow key={inst.id}>
                      <TableCell>{inst.sequenceNumber}</TableCell>
                      <TableCell>{inst.dueDate?.split('T')[0]}</TableCell>
                      <TableCell>₹{inst.totalAmount?.toFixed(2)}</TableCell>
                      <TableCell>₹{inst.paidAmount?.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={installmentStatusVariant(inst.status)}>{inst.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No installment schedule available.</p>
          )}
        </TabsContent>

        {/* Repayments Tab */}
        <TabsContent value="repayments">
          <RepaymentsTab loanId={id!} />
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <p className="text-sm text-muted-foreground">No documents attached to this loan.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
