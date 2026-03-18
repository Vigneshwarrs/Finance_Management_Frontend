/**
 * Property-based tests for Zod schemas.
 *
 * Validates: Property 25
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { borrowerSchema } from './borrowers/schemas';
import { loanSchema } from './loans/schemas';
import { z } from 'zod';

const repaymentSchema = z.object({
  loanId: z.string().min(1),
  amount: z.coerce.number().positive(),
  paymentDate: z.string().min(1),
});

// ---------------------------------------------------------------------------
// Property 25: valid inputs are accepted, invalid inputs are rejected
// ---------------------------------------------------------------------------

describe('Property 25: Zod schema validation', () => {
  // borrowerSchema
  it('borrowerSchema accepts valid inputs', () => {
    fc.assert(
      fc.property(
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
          identificationNumber: fc.string({ minLength: 1, maxLength: 20 }).filter((s) => s.trim().length > 0),
          contact: fc.record({
            email: fc.tuple(
              fc.stringOf(fc.char().filter((c) => /[a-z0-9]/.test(c)), { minLength: 1, maxLength: 10 }),
              fc.stringOf(fc.char().filter((c) => /[a-z0-9]/.test(c)), { minLength: 1, maxLength: 10 }),
              fc.stringOf(fc.char().filter((c) => /[a-z]/.test(c)), { minLength: 2, maxLength: 4 })
            ).map(([local, domain, tld]) => `${local}@${domain}.${tld}`),
            phone: fc.option(fc.string({ minLength: 7, maxLength: 15 }), { nil: undefined }),
          }),
          address: fc.record({
            street: fc.string({ minLength: 1, maxLength: 100 }).filter((s) => s.trim().length > 0),
            city: fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
            state: fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
            postalCode: fc.string({ minLength: 1, maxLength: 10 }).filter((s) => s.trim().length > 0),
            country: fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
          }),
        }),
        (input) => {
          const result = borrowerSchema.safeParse(input);
          expect(result.success).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('borrowerSchema rejects inputs with empty name', () => {
    fc.assert(
      fc.property(
        fc.record({
          name: fc.constant(''),
          identificationNumber: fc.string({ minLength: 1 }),
          contact: fc.record({ email: fc.emailAddress() }),
          address: fc.record({
            street: fc.string({ minLength: 1 }),
            city: fc.string({ minLength: 1 }),
            state: fc.string({ minLength: 1 }),
            postalCode: fc.string({ minLength: 1 }),
            country: fc.string({ minLength: 1 }),
          }),
        }),
        (input) => {
          const result = borrowerSchema.safeParse(input);
          expect(result.success).toBe(false);
          if (!result.success) {
            const fields = result.error.issues.map((i) => i.path[0]);
            expect(fields).toContain('name');
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  // loanSchema
  it('loanSchema accepts valid inputs', () => {
    fc.assert(
      fc.property(
        fc.record({
          borrowerId: fc.uuid(),
          principal: fc.float({ min: Math.fround(1), max: Math.fround(100_000), noNaN: true }),
          interestRate: fc.float({ min: Math.fround(0.01), max: Math.fround(0.99), noNaN: true }),
          interestMethod: fc.constantFrom('flat-rate', 'reducing-balance'),
          startDate: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-01-01') })
            .map((d) => d.toISOString().split('T')[0]),
          termMonths: fc.integer({ min: 1, max: 60 }),
        }),
        (input) => {
          const result = loanSchema.safeParse(input);
          expect(result.success).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('loanSchema rejects negative principal', () => {
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(-100_000), max: Math.fround(-0.01), noNaN: true }),
        (principal) => {
          const result = loanSchema.safeParse({
            borrowerId: 'some-id',
            principal,
            interestRate: 0.1,
            interestMethod: 'flat-rate',
            startDate: '2024-01-01',
            termMonths: 12,
          });
          expect(result.success).toBe(false);
          if (!result.success) {
            const fields = result.error.issues.map((i) => i.path[0]);
            expect(fields).toContain('principal');
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  // repaymentSchema
  it('repaymentSchema accepts valid inputs', () => {
    fc.assert(
      fc.property(
        fc.record({
          loanId: fc.uuid(),
          amount: fc.float({ min: Math.fround(0.01), max: Math.fround(100_000), noNaN: true }),
          paymentDate: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-01-01') })
            .map((d) => d.toISOString().split('T')[0]),
        }),
        (input) => {
          const result = repaymentSchema.safeParse(input);
          expect(result.success).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('repaymentSchema rejects non-positive amount', () => {
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(-1000), max: Math.fround(0), noNaN: true }),
        (amount) => {
          const result = repaymentSchema.safeParse({
            loanId: 'some-id',
            amount,
            paymentDate: '2024-01-01',
          });
          expect(result.success).toBe(false);
          if (!result.success) {
            const fields = result.error.issues.map((i) => i.path[0]);
            expect(fields).toContain('amount');
          }
        }
      ),
      { numRuns: 50 }
    );
  });
});
