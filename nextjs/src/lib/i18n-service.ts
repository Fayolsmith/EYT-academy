/**
 * Mrs Sarah Early Years Tutoring Platform
 * i18n Internationalization Service: Currency & Timezone Utilities
 *
 * Enforces:
 * 1. Explicit per-invoice currency selection (NGN, GBP, EUR, USD) with manual amounts
 *    and ZERO automatic exchange rate conversions.
 * 2. UTC storage internally for all session bookings and availability slots.
 * 3. Consistent display in Africa/Lagos (WAT) for Mrs Sarah, and detected local timezone
 *    for parents, clearly labeled on all scheduling, booking, and reminder surfaces.
 */

export type InvoiceCurrency = 'NGN' | 'GBP' | 'EUR' | 'USD';

export interface CurrencyConfig {
  code: InvoiceCurrency;
  label: string;
  symbol: string;
}

export const SUPPORTED_CURRENCIES: CurrencyConfig[] = [
  { code: 'NGN', label: 'Nigerian Naira (NGN ₦)', symbol: '₦' },
  { code: 'EUR', label: 'Euro (EUR €)', symbol: '€' },
  { code: 'GBP', label: 'British Pound (GBP £)', symbol: '£' },
  { code: 'USD', label: 'US Dollar (USD $)', symbol: '$' },
];

/**
 * Returns the corresponding currency symbol for a given currency code or symbol.
 * Defaults to '₦' (NGN) if unspecified.
 */
export function getCurrencySymbol(currency?: string | null): string {
  if (!currency) return '₦';
  const clean = currency.trim().toUpperCase();
  switch (clean) {
    case 'EUR':
    case '€':
      return '€';
    case 'GBP':
    case '£':
      return '£';
    case 'USD':
    case '$':
      return '$';
    case 'NGN':
    case '₦':
    default:
      return '₦';
  }
}

/**
 * Formats a monetary amount using the designated record currency without ANY automatic conversion.
 */
export function formatCurrency(
  amount: number,
  currency?: string | null,
  options?: { showCode?: boolean }
): string {
  const symbol = getCurrencySymbol(currency);
  const code = (currency || 'NGN').toUpperCase();
  const formattedNumber = Number(amount || 0).toLocaleString('en-US', {
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  });

  if (options?.showCode) {
    return `${symbol}${formattedNumber} ${code}`;
  }
  return `${symbol}${formattedNumber}`;
}

/**
 * Formats dual public pricing rates (e.g. "₦15,000 / €30").
 * If only primary rate is present, displays only the primary rate.
 */
export function formatDualRate(
  primaryRate?: string | null,
  secondaryRate?: string | null
): string {
  const primary = primaryRate?.trim();
  const secondary = secondaryRate?.trim();

  if (primary && secondary) {
    return `${primary} / ${secondary}`;
  }
  if (primary) {
    return primary;
  }
  if (secondary) {
    return secondary;
  }
  return 'Contact for pricing';
}

// ----------------------------------------------------
// TIMEZONE UTILITIES
// ----------------------------------------------------

/**
 * Mrs Sarah's permanent operational timezone (Lagos, Nigeria).
 * WAT (West Africa Time) is UTC+1 all year with no Daylight Saving Time.
 */
export const SARAH_TIMEZONE = 'Africa/Lagos';

/**
 * Detects the user's browser timezone with SSR safety fallback to Lagos.
 */
export function detectUserTimezone(): string {
  if (typeof window === 'undefined') {
    return SARAH_TIMEZONE;
  }
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || SARAH_TIMEZONE;
  } catch {
    return SARAH_TIMEZONE;
  }
}

/**
 * Computes an explicit, human-readable timezone abbreviation (e.g. WAT, BST, GMT, CEST, CET, EDT, EST).
 */
export function getTimezoneAbbr(timeZone: string, date: Date = new Date()): string {
  if (!timeZone || timeZone === 'Africa/Lagos') {
    return 'WAT';
  }

  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'short',
    }).formatToParts(date);
    const val = parts.find((p) => p.type === 'timeZoneName')?.value;

    if (val) {
      if (timeZone.includes('London')) {
        return val.includes('+1') || val === 'BST' ? 'BST' : 'GMT';
      }
      if (
        timeZone.includes('Paris') ||
        timeZone.includes('Berlin') ||
        timeZone.includes('Rome') ||
        timeZone.includes('Madrid') ||
        timeZone.includes('Amsterdam') ||
        timeZone.includes('Brussels')
      ) {
        return val.includes('+2') || val === 'CEST' ? 'CEST' : 'CET';
      }
      return val;
    }
  } catch {
    // Fallback to timeZone name if formatting fails
  }

  return timeZone;
}

/**
 * Converts Mrs Sarah's entered local Lagos date (YYYY-MM-DD) and time (HH:mm)
 * to a standardized UTC ISO string (ending in Z) for database storage.
 * Since Lagos is UTC+1 with no DST, Lagos 10:00 is UTC 09:00.
 */
export function convertLagosTimeToUTC(dateStr: string, timeStr: string): string {
  // Format as ISO with +01:00 offset to guarantee deterministic UTC conversion across any server/client
  const isoWithOffset = `${dateStr}T${timeStr}:00+01:00`;
  const date = new Date(isoWithOffset);
  if (isNaN(date.getTime())) {
    // Fallback if parsing fails
    return new Date().toISOString();
  }
  return date.toISOString();
}

/**
 * Formats a time string (e.g. "10:00 AM WAT" or "11:00 AM CEST") in a target timezone.
 */
export function formatTimeInTimezone(
  isoDateString: string,
  timeZone: string = SARAH_TIMEZONE,
  includeAbbr: boolean = true
): string {
  const d = new Date(isoDateString);
  if (isNaN(d.getTime())) return '';

  try {
    const timeFormatted = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(d);

    if (!includeAbbr) return timeFormatted;
    const abbr = getTimezoneAbbr(timeZone, d);
    return `${timeFormatted} ${abbr}`;
  } catch {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}

/**
 * Returns the YYYY-MM-DD local calendar date string for a given timezone.
 * Defaults to the user's detected timezone (or Lagos fallback).
 * This guarantees day boundaries align with the child/family's local date,
 * not the raw server UTC date.
 */
export function getLocalDateInTimezone(
  date: Date = new Date(),
  timeZone: string = detectUserTimezone()
): string {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: timeZone || SARAH_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  } catch {
    return date.toISOString().split('T')[0];
  }
}

/**
 * Formats a date string (e.g. "Tuesday, 15 September 2026") in a target timezone.
 * Accepts either a boolean (includeDayOfWeek) or custom Intl.DateTimeFormatOptions.
 */
export function formatDateInTimezone(
  isoDateString: string,
  timeZone: string = SARAH_TIMEZONE,
  optionsOrIncludeDayOfWeek?: boolean | Intl.DateTimeFormatOptions
): string {
  const d = new Date(isoDateString);
  if (isNaN(d.getTime())) return '';

  try {
    let options: Intl.DateTimeFormatOptions;
    if (typeof optionsOrIncludeDayOfWeek === 'object' && optionsOrIncludeDayOfWeek !== null) {
      options = {
        timeZone,
        ...optionsOrIncludeDayOfWeek,
      };
    } else {
      const includeDayOfWeek = optionsOrIncludeDayOfWeek !== false;
      options = {
        timeZone,
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      };
      if (includeDayOfWeek) {
        options.weekday = 'long';
      }
    }
    return new Intl.DateTimeFormat('en-GB', options).format(d);
  } catch {
    return d.toLocaleDateString('en-GB');
  }
}

/**
 * Formats combined date and time with timezone label (e.g. "Tuesday, 15 September 2026 at 10:00 AM WAT").
 */
export function formatDateTimeInTimezone(
  isoDateString: string,
  timeZone: string = SARAH_TIMEZONE
): string {
  const dateStr = formatDateInTimezone(isoDateString, timeZone, true);
  const timeStr = formatTimeInTimezone(isoDateString, timeZone, true);
  return `${dateStr} at ${timeStr}`;
}

/**
 * Compares tutor's time (WAT) and parent's time to provide clear preview in booking flow.
 */
export function formatDualTimePreview(
  isoDateString: string,
  userTimezone: string = detectUserTimezone()
): {
  tutorTime: string;
  userTime: string;
  sarahTime: string;
  parentTime: string;
  isDifferent: boolean;
  explanation: string;
} {
  const tutorTime = formatTimeInTimezone(isoDateString, SARAH_TIMEZONE, true);
  const userTime = formatTimeInTimezone(isoDateString, userTimezone, true);
  const isDifferent = tutorTime !== userTime;

  let explanation = `Session time: ${userTime}`;
  if (isDifferent) {
    explanation = `Mrs Sarah’s Time: ${tutorTime} • In your local time: ${userTime}`;
  }

  return {
    tutorTime,
    userTime,
    sarahTime: tutorTime,
    parentTime: userTime,
    isDifferent,
    explanation,
  };
}
