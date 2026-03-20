import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { useCreateOrder, useVerifyPayment } from './hooks/usePayments';

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open(): void }
  }
}

interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  order_id: string
  name?: string
  description?: string
  handler: (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => void
  modal?: { ondismiss?: () => void }
  theme?: { color?: string }
}

interface Loan {
  id: string;
  principal: number;
  status: string;
  borrowerId: string;
  coolingPeriodEndsAt?: string;
  installments?: Array<{
    totalAmount: number;
    paidAmount: number;
    status: string;
  }>;
}

function getOutstandingBalance(loan: Loan): number {
  if (!loan.installments?.length) return loan.principal;
  return loan.installments.reduce((sum, inst) => {
    if (inst.status !== 'paid') {
      return sum + (inst.totalAmount - inst.paidAmount);
    }
    return sum;
  }, 0);
}

function isCoolingPeriodActive(coolingPeriodEndsAt?: string): boolean {
  if (!coolingPeriodEndsAt) return false;
  return new Date(coolingPeriodEndsAt) > new Date();
}

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay script'));
    document.body.appendChild(script);
  });
}

function LoanCard({ loan, onPay, paying }: { loan: Loan; onPay: (loan: Loan) => void; paying: boolean }) {
  const coolingActive = isCoolingPeriodActive(loan.coolingPeriodEndsAt);
  const outstanding = getOutstandingBalance(loan);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-mono">{loan.id.slice(0, 8)}…</CardTitle>
          <Badge variant="secondary">active</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <span className="text-muted-foreground">Principal</span>
          <span className="font-medium">₹{loan.principal.toFixed(2)}</span>
          <span className="text-muted-foreground">Outstanding</span>
          <span className="font-medium">₹{outstanding.toFixed(2)}</span>
        </div>

        {coolingActive && loan.coolingPeriodEndsAt && (
          <div className="rounded-md bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 px-3 py-2 text-sm text-amber-800 dark:text-amber-200">
            Cooling period ends:{' '}
            <span className="font-medium">
              {new Date(loan.coolingPeriodEndsAt).toLocaleDateString()}
            </span>
          </div>
        )}

        <Button
          className="w-full"
          disabled={coolingActive || paying}
          onClick={() => onPay(loan)}
        >
          {coolingActive ? 'Payment Unavailable' : paying ? 'Processing…' : 'Pay Now'}
        </Button>
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader className="pb-3">
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-9 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function PaymentPortal() {
  const { data: loans = [], isLoading } = useQuery<Loan[]>({
    queryKey: ['loans'],
    queryFn: () => apiClient.get('/loans').then((r) => r.data),
  });

  const [payingLoanId, setPayingLoanId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const createOrder = useCreateOrder();
  const verifyPayment = useVerifyPayment();

  const activeLoans = loans.filter((l) => l.status === 'active');

  useEffect(() => {
    // Preload Razorpay script on mount
    loadRazorpayScript().catch(() => {
      // silently ignore preload failure; will retry on pay click
    });
  }, []);

  function showToast(type: 'success' | 'error', message: string) {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ type, message });
    toastTimerRef.current = setTimeout(() => setToast(null), 5000);
  }

  async function handlePay(loan: Loan) {
    const outstandingBalance = getOutstandingBalance(loan);
    setPayingLoanId(loan.id);

    try {
      await loadRazorpayScript();
    } catch {
      showToast('error', 'Could not load payment gateway. Please try again.');
      setPayingLoanId(null);
      return;
    }

    let orderData: { orderId: string; amount: number; currency: string; key: string };
    try {
      orderData = await createOrder.mutateAsync({ loanId: loan.id, amount: outstandingBalance });
    } catch {
      showToast('error', 'Failed to create payment order. Please try again.');
      setPayingLoanId(null);
      return;
    }

    const options: RazorpayOptions = {
      key: orderData.key,
      amount: orderData.amount,
      currency: orderData.currency,
      order_id: orderData.orderId,
      name: 'Loan Repayment',
      description: `Repayment for loan ${loan.id.slice(0, 8)}`,
      handler: async (response) => {
        try {
          await verifyPayment.mutateAsync({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
            loanId: loan.id,
            amount: orderData.amount,
          });
          showToast('success', 'Payment successful! Your loan has been updated.');
        } catch {
          showToast('error', 'Payment verification failed. Please contact support.');
        } finally {
          setPayingLoanId(null);
        }
      },
      modal: {
        ondismiss: () => {
          showToast('error', 'Payment cancelled.');
          setPayingLoanId(null);
        },
      },
      theme: { color: '#6366f1' },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Payment Portal</h1>
        <p className="text-muted-foreground mt-1">Pay your active loan installments</p>
      </div>

      {toast && (
        <div
          className={`rounded-md px-4 py-3 text-sm font-medium ${
            toast.type === 'success'
              ? 'bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
              : 'bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
          }`}
        >
          {toast.message}
        </div>
      )}

      {isLoading ? (
        <LoadingSkeleton />
      ) : activeLoans.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No active loans found.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activeLoans.map((loan) => (
            <LoanCard
              key={loan.id}
              loan={loan}
              onPay={handlePay}
              paying={payingLoanId === loan.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
