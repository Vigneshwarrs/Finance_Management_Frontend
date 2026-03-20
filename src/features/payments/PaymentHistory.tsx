import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useCancelScheduledPayment, usePaymentHistory } from './hooks/usePayments';
import type { ScheduledPayment } from './hooks/usePayments';

type BadgeVariant = 'default' | 'secondary' | 'outline' | 'destructive';

function statusVariant(status: ScheduledPayment['status']): BadgeVariant {
  switch (status) {
    case 'pending':
      return 'secondary';
    case 'processed':
      return 'default';
    case 'cancelled':
      return 'outline';
    case 'failed':
      return 'destructive';
  }
}

function LoadingRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          {Array.from({ length: 6 }).map((_, j) => (
            <TableCell key={j}>
              <Skeleton className="h-4 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

export function PaymentHistory() {
  const { data: payments, isLoading } = usePaymentHistory();
  const cancelPayment = useCancelScheduledPayment();
  const [pendingCancelId, setPendingCancelId] = useState<string | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment History</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Loan ID</TableHead>
              <TableHead>Amount (₹)</TableHead>
              <TableHead>Scheduled Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment ID</TableHead>
              <TableHead>Processed At</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <LoadingRows />
            ) : !payments || payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No payment records found.
                </TableCell>
              </TableRow>
            ) : (
              payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell title={payment.loanId}>
                    {payment.loanId.slice(0, 8)}&hellip;
                  </TableCell>
                  <TableCell>₹{payment.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    {new Date(payment.scheduledDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(payment.status)}>
                      {payment.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{payment.razorpayPaymentId ?? '—'}</TableCell>
                  <TableCell>
                    {payment.processedAt
                      ? new Date(payment.processedAt).toLocaleDateString()
                      : '—'}
                  </TableCell>
                  <TableCell>
                    {payment.status === 'pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPendingCancelId(payment.id)}
                      >
                        Cancel
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>

      <AlertDialog
        open={pendingCancelId !== null}
        onOpenChange={(open: boolean) => { if (!open) setPendingCancelId(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel scheduled payment?</AlertDialogTitle>
            <AlertDialogDescription>
              This will cancel the scheduled payment. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingCancelId) {
                  cancelPayment.mutate(pendingCancelId);
                  setPendingCancelId(null);
                }
              }}
            >
              Yes, cancel payment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
