/**
 * Property-based tests for Zustand stores.
 *
 * Validates: Properties 26–27
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { useAuthStore } from './authStore';
import { useToastStore } from './toastStore';
import { setFormErrors } from '../utils/formErrors';

// Reset stores between tests
beforeEach(() => {
  useAuthStore.setState({ token: null, user: null });
  useToastStore.setState({ toasts: [] });
});

// ---------------------------------------------------------------------------
// Property 27: login/logout cycle clears token and user
// ---------------------------------------------------------------------------

describe('Property 27: authStore login/logout cycle', () => {
  it('token and user are null after logout', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 10, maxLength: 200 }),
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.constantFrom('Admin', 'Loan_Officer', 'Borrower'),
        (token, userId, role) => {
          const store = useAuthStore.getState();

          store.login(token, { userId, role });
          expect(useAuthStore.getState().token).toBe(token);
          expect(useAuthStore.getState().user?.userId).toBe(userId);

          store.logout();
          expect(useAuthStore.getState().token).toBeNull();
          expect(useAuthStore.getState().user).toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 26: setFormErrors maps every key to a form field error
// ---------------------------------------------------------------------------

describe('Property 26: setFormErrors maps backend details to form errors', () => {
  it('every key in details object is mapped to a form field error', () => {
    fc.assert(
      fc.property(
        fc.dictionary(
          fc.string({ minLength: 1, maxLength: 30 }).filter((s) => /^[a-zA-Z][a-zA-Z0-9]*$/.test(s)),
          fc.string({ minLength: 1, maxLength: 100 }),
          { minKeys: 1, maxKeys: 10 }
        ),
        (details) => {
          const errors: Record<string, { type: string; message: string }> = {};
          const mockSetError = (field: string, error: { type: string; message: string }) => {
            errors[field] = error;
          };

          setFormErrors(mockSetError as any, details);

          for (const [field, message] of Object.entries(details)) {
            expect(errors[field]).toBeDefined();
            expect(errors[field].message).toBe(message);
            expect(errors[field].type).toBe('server');
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// toastStore: addToast/removeToast
// ---------------------------------------------------------------------------

describe('toastStore: addToast and removeToast', () => {
  it('added toast appears in toasts array', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.constantFrom<'success' | 'error' | 'info' | 'warning'>('success', 'error', 'info', 'warning'),
        (message, variant) => {
          useToastStore.setState({ toasts: [] });
          useToastStore.getState().addToast(message, variant);
          const toasts = useToastStore.getState().toasts;
          expect(toasts.length).toBe(1);
          expect(toasts[0].message).toBe(message);
          expect(toasts[0].variant).toBe(variant);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('removed toast no longer appears in toasts array', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        (message) => {
          useToastStore.setState({ toasts: [] });
          useToastStore.getState().addToast(message);
          const id = useToastStore.getState().toasts[0].id;
          useToastStore.getState().removeToast(id);
          const ids = useToastStore.getState().toasts.map((t) => t.id);
          expect(ids).not.toContain(id);
        }
      ),
      { numRuns: 50 }
    );
  });
});
