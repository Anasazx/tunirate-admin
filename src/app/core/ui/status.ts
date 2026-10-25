// Colors for every status shown in the admin panel, kept in one place
export type Tone = 'gray' | 'amber' | 'green' | 'red' | 'orange' | 'blue' | 'violet';

const TONES: Record<string, Tone> = {
  // Products
  DRAFT: 'gray',
  PENDING_REVIEW: 'amber',
  PUBLISHED: 'green',
  REJECTED: 'red',
  ARCHIVED: 'gray',
  // Companies
  PENDING: 'amber',
  ACTIVE: 'green',
  SUSPENDED: 'orange',
  // Suggestions
  APPROVED: 'green',
  // Roles
  ADMIN: 'violet',
  USER: 'gray',
  HEAD: 'blue',
  WORKER: 'gray',
};

export function toneOf(status: string | null | undefined): Tone {
  return (status && TONES[status]) || 'gray';
}
