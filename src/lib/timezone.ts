// Timezone utilities for Asia/Dubai display
import { format, parseISO } from 'date-fns';

const DUBAI_OFFSET_HOURS = 4; // UTC+4

export function formatInDubaiTime(isoString: string | null | undefined, formatStr: string = 'MMM d, yyyy h:mm a'): string {
  if (!isoString) return '—';
  
  try {
    const date = parseISO(isoString);
    // Add 4 hours to convert from UTC to Dubai time
    const dubaiDate = new Date(date.getTime() + DUBAI_OFFSET_HOURS * 60 * 60 * 1000);
    return format(dubaiDate, formatStr) + ' (Dubai)';
  } catch {
    return '—';
  }
}

export function formatRelativeTime(isoString: string | null | undefined): string {
  if (!isoString) return '—';
  
  try {
    const date = parseISO(isoString);
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
