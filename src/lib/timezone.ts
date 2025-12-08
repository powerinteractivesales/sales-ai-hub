// Timezone utilities for Asia/Dubai display
import { formatInTimeZone } from 'date-fns-tz';

const DUBAI_TIMEZONE = 'Asia/Dubai'; // UTC+4

export function formatInDubaiTime(isoString: string | null | undefined, formatStr: string = 'MMM d, yyyy h:mm a'): string {
  if (!isoString) return '—';

  try {
    // Use date-fns-tz to properly convert UTC to Dubai time
    return formatInTimeZone(new Date(isoString), DUBAI_TIMEZONE, formatStr);
  } catch {
    return '—';
  }
}

export function formatRelativeTime(isoString: string | null | undefined): string {
  if (!isoString) return '—';

  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffHours < 0) {
      if (diffHours > -24) return `${Math.abs(diffHours)}h ago`;
      return `${Math.abs(diffDays)}d ago`;
    } else {
      if (diffHours < 24) return `in ${diffHours}h`;
      return `in ${diffDays}d`;
    }
  } catch {
    return '—';
  }
}
