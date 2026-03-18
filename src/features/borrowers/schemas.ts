import { z } from 'zod';

export const borrowerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  identificationNumber: z.string().min(1, 'ID number is required'),
  contact: z.object({
    email: z.string().email('Valid email is required'),
    phone: z.string().optional(),
  }),
  address: z.object({
    street: z.string().min(1, 'Street is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
    country: z.string().min(1, 'Country is required'),
  }),
});

export type BorrowerFormData = z.infer<typeof borrowerSchema>;
