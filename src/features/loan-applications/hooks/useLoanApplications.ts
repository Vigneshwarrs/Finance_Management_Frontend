import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../api/client';

export interface LoanApplication {
  id: string;
  borrowerId: string;
  applicantUserId: string;
  requestedPrincipal: number;
  requestedTermMonths: number;
  purpose: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'disbursed';
  submittedAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  disbursedLoanId?: string;
  documents: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateApplicationInput {
  requestedPrincipal: number;
  requestedTermMonths: number;
  purpose: string;
  documents?: string[];
}

export interface ReviewApplicationInput {
  status: 'approved' | 'rejected';
  notes: string;
}

export interface DisburseApplicationInput {
  loanId: string;
}

export function useLoanApplications() {
  return useQuery<LoanApplication[]>({
    queryKey: ['loan-applications'],
    queryFn: () => apiClient.get('/loan-applications').then((r) => r.data),
  });
}

export function useLoanApplication(id: string) {
  return useQuery<LoanApplication>({
    queryKey: ['loan-applications', id],
    queryFn: () => apiClient.get(`/loan-applications/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}

export function useCreateApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateApplicationInput) =>
      apiClient.post('/loan-applications', input).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['loan-applications'] }),
  });
}

export function useSubmitApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.put(`/loan-applications/${id}/submit`).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['loan-applications'] }),
  });
}

export function useReviewApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: ReviewApplicationInput & { id: string }) =>
      apiClient.put(`/loan-applications/${id}/review`, input).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['loan-applications'] }),
  });
}

export function useDisburseApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: DisburseApplicationInput & { id: string }) =>
      apiClient.put(`/loan-applications/${id}/disburse`, input).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['loan-applications'] }),
  });
}
