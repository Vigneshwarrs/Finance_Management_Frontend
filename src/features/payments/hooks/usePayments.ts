import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../api/client';

export interface ScheduledPayment {
  id: string;
  loanId: string;
  borrowerUserId: string;
  amount: number;
  scheduledDate: string;
  status: 'pending' | 'processed' | 'cancelled' | 'failed';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  processedAt?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderInput {
  loanId: string;
  amount: number;
}

export interface CreateOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  key: string;
}

export interface VerifyPaymentInput {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  loanId: string;
  amount: number;
}

export interface SchedulePaymentInput {
  loanId: string;
  amount: number;
  scheduledDate: string; // ISO datetime string
}

export function usePaymentHistory() {
  return useQuery<ScheduledPayment[]>({
    queryKey: ['payments', 'history'],
    queryFn: () => apiClient.get('/payments/history').then((r) => r.data),
  });
}

export function useCreateOrder() {
  return useMutation({
    mutationFn: (input: CreateOrderInput): Promise<CreateOrderResponse> =>
      apiClient.post('/payments/orders', input).then((r) => r.data),
  });
}

export function useVerifyPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: VerifyPaymentInput) =>
      apiClient.post('/payments/verify', input).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments', 'history'] });
      queryClient.invalidateQueries({ queryKey: ['loans'] });
    },
  });
}

export function useSchedulePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SchedulePaymentInput) =>
      apiClient.post('/payments/schedule', input).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payments', 'history'] }),
  });
}

export function useCancelScheduledPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(`/payments/schedule/${id}`).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payments', 'history'] }),
  });
}
