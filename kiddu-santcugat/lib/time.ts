import type { Weekday } from './types';

/** All times are "naive local" (Europe/Madrid) strings "YYYY-MM-DDTHH:MM"; compare them as UTC-parsed values. */
export const TZ = 'Europe/Madrid';
const DAYS: Weekday[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

export function toNaive(d: Date): string {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    }).formatToParts(d).map((x) => [x.type, x.value]),
  );
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}

export function parseNaive(s: string): Date {
  return new Date(s.length === 10 ? `${s}T00:00:00Z` : `${s}:00Z`);
}

export function dateOf(s: string): string {
  return s.slice(0, 10);
}

export function addDays(day: string, n: number): string {
  const d = parseNaive(day);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function weekdayOf(day: string): Weekday {
  return DAYS[parseNaive(day).getUTCDay()];
}

export function daysBetween(fromDay: string, toDay: string): number {
  return Math.round((parseNaive(toDay).getTime() - parseNaive(fromDay).getTime()) / 86_400_000);
}

/** Days covered by a "when" filter, as YYYY-MM-DD strings. */
export function periodDays(when: 'today' | 'tomorrow' | 'weekend', now: string): string[] {
  const today = dateOf(now);
  if (when === 'today') return [today];
  if (when === 'tomorrow') return [addDays(today, 1)];
  const wd = parseNaive(today).getUTCDay(); // 0 sun .. 6 sat
  if (wd === 0) return [today]; // Sunday: the rest of this weekend
  if (wd === 6) return [today, addDays(today, 1)];
  const toSat = 6 - wd;
  return [addDays(today, toSat), addDays(today, toSat + 1)];
}
