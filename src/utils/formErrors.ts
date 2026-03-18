import type { UseFormSetError, FieldValues, Path } from 'react-hook-form';

/**
 * Maps backend validation details object to React Hook Form field errors.
 * @param setError - React Hook Form's setError function
 * @param details - Backend error details object (key: field name, value: error message)
 */
export function setFormErrors<T extends FieldValues>(
  setError: UseFormSetError<T>,
  details: Record<string, string>
): void {
  for (const [field, message] of Object.entries(details)) {
    setError(field as Path<T>, { type: 'server', message });
  }
}
