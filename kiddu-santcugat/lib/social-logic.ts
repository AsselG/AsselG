import { dateOf, daysBetween } from './time';
import type { Lang, Theme } from './types';

export interface CasalChoice { casalId: string; turn: string; status: 'interested' | 'registered'; at: string }

/** One family. Everything a family does (class, friends, plans, casals) hangs off this. */
export interface Profile {
  id: string; secret: string;
  firstName: string; kidAges: number[]; interests: Theme[]; languages: Lang[];
  inviteToken: string;      // personal "connect with me" link
  recoveryToken: string;    // private link to use this profile on another phone
  groupIds: string[]; friendIds: string[]; requestIds: string[];
  casals: CasalChoice[]; shareCasals: boolean;
  createdAt: string;
}
export interface GroupMember { id: string; joinedAt: string }
export interface Group { id: string; name: string; inviteToken: string; createdAt: string; members: GroupMember[] }
export interface Rsvp { id: string; firstName: string; status: 'going' | 'maybe' | 'no'; profileId?: string; at: string }
export type Audience = 'link' | 'group' | 'friends';
export interface Plan {
  id: string; organiserToken: string; organiserName: string; organiserProfileId?: string;
  title: string; itemId?: string; address?: string; groupId?: string;
  audience: Audience; invited: string[];
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

/** Keeps only allowed values, in the allowed order (so the display order never depends on the form). */
export function pickAllowed<T extends string>(raw: unknown[], allowed: readonly T[]): T[] {
  const set = new Set(raw.filter((x): x is string => typeof x === 'string'));
  return allowed.filter((a) => set.has(a));
}

/** A family matches an age when one child is within one year. Families that shared no ages never match. */
export function matchesAge(m: { kidAges: number[] }, age: number): boolean {
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

/**
 * Who may see a plan.
 * - link: anyone holding the private link
 * - group: members of the plan's class group
 * - friends: the organiser and the families they invited, as long as they are still connected
 * The organiser link always works.
 */
export function canViewPlan(plan: Plan, viewer: Profile | null, group: Group | null, organiserOk: boolean): boolean {
  if (organiserOk || plan.audience === 'link') return true;
  if (!viewer) return false;
  if (viewer.id === plan.organiserProfileId) return true;
  if (plan.audience === 'group') return !!group && group.members.some((m) => m.id === viewer.id);
  return !!plan.organiserProfileId && plan.invited.includes(viewer.id) && viewer.friendIds.includes(plan.organiserProfileId);
}

export type PlanRole = 'organiser' | 'invited' | 'class';
export function planRole(plan: Plan, viewer: Profile): PlanRole {
  return plan.organiserProfileId === viewer.id ? 'organiser' : plan.audience === 'group' ? 'class' : 'invited';
}

/** First day of a casal turn → "21–25 Jun" / "28 Jun–2 Jul" style label parts. */
export function turnKey(start: string) { return start; }
