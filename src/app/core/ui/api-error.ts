import { HttpErrorResponse } from '@angular/common/http';

// Readable message for a failed API call: the backend's "detail" when it gives one, else a fallback
export function apiErrorMessage(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) return 'Cannot reach the server. Check that the backend is running.';
    const detail = err.error?.detail || err.error?.message;
    if (typeof detail === 'string' && detail.trim()) return detail;
    if (err.status === 403) return 'You are not allowed to do this.';
    if (err.status === 404) return 'Not found. It may have been removed.';
  }
  return fallback;
}
