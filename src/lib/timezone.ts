// Timezone utilities for Asia/Dubai display
import { formatInTimeZone } from 'date-fns-tz';

const DUBAI_TIMEZONE = 'Asia/Dubai'; // UTC+4

export function formatInDubaiTime(isoString: string | null | undefined, formatStr: string = 'MMM d, yyyy h:mm a'): string {
  if (!isoString) return '—';

  try {
    // n8n sends UTC timestamps that may or may not have timezone suffix
    // Ensure we parse as UTC by appending 'Z' if not present
    let utcString = isoString.trim();

    // If timestamp doesn't have timezone info (no Z, no +00:00), append Z to force UTC parsing
    if (!utcString.endsWith('Z') && !utcString.includes('+') && !utcString.includes('-', 10)) {
      // Replace space with T for ISO format, then append Z
      utcString = utcString.replace(' ', 'T') + 'Z';
    }

    // Use date-fns-tz to properly convert UTC to Dubai time
    return formatInTimeZone(new Date(utcString), DUBAI_TIMEZONE, formatStr);
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
