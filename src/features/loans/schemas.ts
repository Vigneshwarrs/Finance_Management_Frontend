import { z } from 'zod';

export const loanSchema = z.object({
  borrowerId: z.string().min(1, 'Borrower is required'),
  principal: z.coerce.number().positive('Principal must be positive'),
  interestRate: z.coerce.number().min(0, 'Interest rate must be >= 0').max(1, 'Interest rate must be <= 1'),
  interestMethod: z.enum(['flat-rate', 'reducing-balance'], { required_error: 'Interest method is required' }),
  startDate: z.string().min(1, 'Start date is required'),
  termMonths: z.coerce.number().int().positive('Term must be a positive integer'),
  penaltyRate: z.coerce.number().min(0).optional(),
  assignedOfficerId: z.string().optional(),
});

export type LoanFormData = z.infer<typeof loanSchema>;
