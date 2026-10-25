// Small display helpers shared by pages

// PENDING_REVIEW -> "Pending review"
export function humanize(value: string | null | undefined): string {
  if (!value) return '';
  const text = value.replace(/_/g, ' ').toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function initials(name: string | null | undefined): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase() || '?';
}

// "3 days ago"
export function timeAgo(date: string | null | undefined): string {
  if (!date) return '';
  const seconds = Math.round((Date.now() - new Date(date).getTime()) / 1000);
  const units: [number, string][] = [[60, 'second'], [60, 'minute'], [24, 'hour'], [30, 'day'], [12, 'month'], [Infinity, 'year']];
  let value = seconds;
  for (const [size, unit] of units) {
    if (Math.abs(value) < size) {
      const n = Math.max(1, Math.floor(value));
      return seconds < 45 ? 'just now' : `${n} ${unit}${n === 1 ? '' : 's'} ago`;
    }
    value /= size;
  }
  return '';
}
