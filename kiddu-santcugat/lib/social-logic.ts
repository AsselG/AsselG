import { dateOf, daysBetween } from './time';

export interface Member { id: string; secret: string; firstName: string; kidAges: number[]; joinedAt: string }
export interface Rsvp { id: string; firstName: string; status: 'going' | 'maybe' | 'no'; memberId?: string; at: string }
export interface Group { id: string; name: string; inviteToken: string; createdAt: string; members: Member[] }
export interface Plan {
  id: string; organiserToken: string; organiserName: string; organiserMemberId?: string;
  title: string; itemId?: string; groupId?: string;
  start: string; note: string; createdAt: string; cancelled: boolean; rsvps: Rsvp[];
}

/** First name only: letters (any language), spaces, hyphen, apostrophe. 1–30 chars. */
export function cleanName(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const s = raw.normalize('NFC').replace(/\s+/g, ' ').trim();
  if (s.length < 1 || s.length > 30) return null;
  if (!/^[\p{L}][\p{L}\p{M} '’-]*$/u.test(s)) return null;
  return s;
}

/** "4, 6" → [4, 6]. Ages 0–17, at most 6, no duplicates. Anything else is ignored. */
export function parseAges(raw: unknown): number[] {
  if (typeof raw !== 'string') return [];
  const out: number[] = [];
  for (const part of raw.split(/[,;&\s]+/)) {
    if (!/^\d{1,2}$/.test(part)) continue;
    const n = Number(part);
    if (n >= 0 && n <= 17 && !out.includes(n)) out.push(n);
  }
  return out.sort((a, b) => a - b).slice(0, 6);
}

/** A family matches an age when one child is within one year. Families that shared no ages never match. */
export function matchesAge(m: Member, age: number): boolean {
  return m.kidAges.some((a) => Math.abs(a - age) <= 1);
}

export function cleanText(raw: unknown, max: number): string {
  if (typeof raw !== 'string') return '';
  return raw.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
}

/** A plan lives until `deleteDays` days after its date. */
export function planExpired(plan: Plan, now: string, deleteDays: number): boolean {
  return daysBetween(dateOf(plan.start), dateOf(now)) > deleteDays;
}

export function planUpcoming(plan: Plan, now: string): boolean {
  return !plan.cancelled && dateOf(plan.start) >= dateOf(now);
}

export function goingCount(plan: Plan): number {
  return plan.rsvps.filter((r) => r.status === 'going').length;
}

export function validStart(date: unknown, time: unknown, now: string): string | null {
  if (typeof date !== 'string' || typeof time !== 'string') return null;
  if (!/^\d{4}-\d\d-\d\d$/.test(date) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return null;
  const d = daysBetween(dateOf(now), date);
  if (Number.isNaN(d) || d < 0 || d > 60) return null;
  return `${date}T${time}`;
}
