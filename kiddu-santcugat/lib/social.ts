import 'server-only';
import { randomBytes } from 'node:crypto';
import { store } from './store';
import { siteConfig } from './config';
import {
  canViewPlan, goingCount, planExpired, planRole, planUpcoming,
  type Audience, type CasalChoice, type Group, type Plan, type PlanRole, type Profile, type Rsvp,
} from './social-logic';
import type { Lang, Theme } from './types';

export const newToken = (bytes = 16) => randomBytes(bytes).toString('base64url');
const gKey = (id: string) => `group:${id}`;
const giKey = (t: string) => `invite:${t}`;
const pKey = (id: string) => `plan:${id}`;
const fKey = (id: string) => `profile:${id}`;
const fiKey = (t: string) => `pinvite:${t}`;
const frKey = (t: string) => `recovery:${t}`;

// ---------- profiles ----------
export interface ProfileInput { firstName: string; kidAges: number[]; interests: Theme[]; languages: Lang[] }

export async function createProfile(i: ProfileInput, now: string): Promise<Profile> {
  const p: Profile = {
    id: newToken(10), secret: newToken(16), ...i, inviteToken: newToken(), recoveryToken: newToken(),
    groupIds: [], friendIds: [], requestIds: [], casals: [],
    shareCasals: !!siteConfig().casals.share_with_friends_default, createdAt: now,
  };
  await saveProfile(p);
  await store().set(fiKey(p.inviteToken), p.id);
  await store().set(frKey(p.recoveryToken), p.id);
  return p;
}
export const saveProfile = (p: Profile) => store().set(fKey(p.id), p);
export const profileById = (id: string) => store().get<Profile>(fKey(id));
async function byToken(key: string) { const id = await store().get<string>(key); return id ? profileById(id) : null; }
export const profileByInvite = (t: string) => byToken(fiKey(t));
export const profileByRecovery = (t: string) => byToken(frKey(t));
export function profileFromCookie(cookie: string | undefined, load: (id: string) => Promise<Profile | null>) {
  if (!cookie) return Promise.resolve(null);
  const [id, secret] = cookie.split('.');
  return load(id ?? '').then((p) => (p && p.secret === secret ? p : null));
}
export const PROFILE_COOKIE = 'kiddu_p';
export const profileCookieValue = (p: Profile) => `${p.id}.${p.secret}`;

export async function rotateRecovery(p: Profile) {
  await store().del(frKey(p.recoveryToken));
  p.recoveryToken = newToken();
  await store().set(frKey(p.recoveryToken), p.id);
  await saveProfile(p);
}

// ---------- groups ----------
export async function createGroup(name: string, now: string): Promise<Group> {
  const g: Group = { id: newToken(12), name, inviteToken: newToken(), createdAt: now, members: [] };
  await store().set(gKey(g.id), g);
  await store().set(giKey(g.inviteToken), g.id);
  return g;
}
export const groupById = (id: string) => store().get<Group>(gKey(id));
export async function groupByInvite(token: string): Promise<Group | null> {
  const id = await store().get<string>(giKey(token));
  return id ? groupById(id) : null;
}
export async function joinGroup(g: Group, p: Profile, now: string) {
  if (!g.members.some((m) => m.id === p.id)) { g.members.push({ id: p.id, joinedAt: now }); await store().set(gKey(g.id), g); }
  if (!p.groupIds.includes(g.id)) { p.groupIds.push(g.id); await saveProfile(p); }
}

async function allPlanDocs(): Promise<Plan[]> {
  const keys = await store().list('plan:');
  return (await Promise.all(keys.map((k) => store().get<Plan>(k)))).filter((p): p is Plan => !!p);
}

/** Removes the family from one group and from every answer in that group's plans. */
export async function leaveGroup(g: Group, p: Profile): Promise<void> {
  g.members = g.members.filter((m) => m.id !== p.id);
  await store().set(gKey(g.id), g);
  p.groupIds = p.groupIds.filter((id) => id !== g.id);
  await saveProfile(p);
  for (const plan of (await allPlanDocs()).filter((x) => x.groupId === g.id)) {
    const before = plan.rsvps.length;
    plan.rsvps = plan.rsvps.filter((r) => r.profileId !== p.id);
    const organiserLeft = plan.organiserProfileId === p.id;
    if (organiserLeft) { plan.organiserName = ''; plan.organiserProfileId = undefined; }
    if (organiserLeft || plan.rsvps.length !== before) await store().set(pKey(plan.id), plan);
  }
}

// ---------- friends ----------
export async function connectFamilies(a: Profile, b: Profile): Promise<'ok' | 'limit' | 'self'> {
  if (a.id === b.id) return 'self';
  const max = siteConfig().profile.max_friends;
  if ((!a.friendIds.includes(b.id) && a.friendIds.length >= max) || (!b.friendIds.includes(a.id) && b.friendIds.length >= max)) return 'limit';
  for (const [x, y] of [[a, b], [b, a]] as const) {
    if (!x.friendIds.includes(y.id)) x.friendIds.push(y.id);
    x.requestIds = x.requestIds.filter((id) => id !== y.id);
    await saveProfile(x);
  }
  return 'ok';
}
export async function disconnectFamilies(a: Profile, b: Profile) {
  for (const [x, y] of [[a, b], [b, a]] as const) {
    x.friendIds = x.friendIds.filter((id) => id !== y.id);
    x.requestIds = x.requestIds.filter((id) => id !== y.id);
    await saveProfile(x);
  }
}
/** A request can only go to a family you share a class with, so strangers cannot be spammed. */
export async function requestConnection(from: Profile, to: Profile): Promise<boolean> {
  if (from.id === to.id || from.friendIds.includes(to.id)) return false;
  if (!from.groupIds.some((g) => to.groupIds.includes(g))) return false;
  if (!to.requestIds.includes(from.id)) { to.requestIds.push(from.id); await saveProfile(to); }
  return true;
}
export async function declineRequest(me: Profile, fromId: string) {
  me.requestIds = me.requestIds.filter((id) => id !== fromId);
  await saveProfile(me);
}

/** Erases the family: profile, class membership, connections, answers, and the plans it organised. */
export async function deleteFamily(p: Profile): Promise<void> {
  for (const gid of [...p.groupIds]) { const g = await groupById(gid); if (g) await leaveGroup(g, p); }
  for (const fid of p.friendIds) {
    const f = await profileById(fid);
    if (f) { f.friendIds = f.friendIds.filter((id) => id !== p.id); await saveProfile(f); }
  }
  for (const plan of await allPlanDocs()) {
    if (plan.organiserProfileId === p.id) { await store().del(pKey(plan.id)); continue; }
    const kept = plan.rsvps.filter((r) => r.profileId !== p.id);
    if (kept.length !== plan.rsvps.length) { plan.rsvps = kept; await store().set(pKey(plan.id), plan); }
  }
  for (const other of await Promise.all((await store().list('profile:')).map((k) => store().get<Profile>(k)))) {
    if (other && other.requestIds.includes(p.id)) { other.requestIds = other.requestIds.filter((id) => id !== p.id); await saveProfile(other); }
  }
  await store().del(fiKey(p.inviteToken));
  await store().del(frKey(p.recoveryToken));
  await store().del(fKey(p.id));
}

// ---------- casal plan ----------
export async function addCasal(p: Profile, casalId: string, turn: string, now: string) {
  if (!p.casals.some((c) => c.casalId === casalId && c.turn === turn)) {
    p.casals.push({ casalId, turn, status: 'interested', at: now });
    await saveProfile(p);
  }
}
export async function setCasalStatus(p: Profile, casalId: string, turn: string, status: CasalChoice['status']) {
  const c = p.casals.find((x) => x.casalId === casalId && x.turn === turn);
  if (c) { c.status = status; await saveProfile(p); }
}
export async function removeCasal(p: Profile, casalId: string, turn: string) {
  p.casals = p.casals.filter((x) => !(x.casalId === casalId && x.turn === turn));
  await saveProfile(p);
}

// ---------- plans ----------
export interface NewPlan {
  title: string; itemId?: string; address?: string; groupId?: string; audience: Audience; invited: string[];
  start: string; note: string; organiserName: string; organiserProfileId?: string;
}
export async function createPlan(p: NewPlan, now: string): Promise<Plan> {
  const plan: Plan = {
    id: newToken(), organiserToken: newToken(), organiserName: p.organiserName, organiserProfileId: p.organiserProfileId,
    title: p.title, itemId: p.itemId, address: p.address, groupId: p.groupId, audience: p.audience, invited: p.invited,
    start: p.start, note: p.note, createdAt: now, cancelled: false,
    rsvps: [{ id: newToken(6), firstName: p.organiserName, status: 'going', profileId: p.organiserProfileId, at: now }],
  };
  await store().set(pKey(plan.id), plan);
  return plan;
}

/** Loads a plan; plans past the retention period are deleted on first access. */
export async function getPlan(id: string, now: string): Promise<Plan | null> {
  if (!/^[A-Za-z0-9_-]{16,40}$/.test(id)) return null;
  const plan = await store().get<Plan>(pKey(id));
  if (!plan) return null;
  if (planExpired(plan, now, siteConfig().plans.delete_days_after_plan)) { await store().del(pKey(id)); return null; }
  return plan;
}

export async function addRsvp(plan: Plan, firstName: string, status: Rsvp['status'], profileId: string | undefined, now: string): Promise<boolean> {
  const same = (r: Rsvp) => (profileId ? r.profileId === profileId : !r.profileId && r.firstName.toLowerCase() === firstName.toLowerCase());
  const existing = plan.rsvps.find(same);
  if (existing) { existing.status = status; existing.at = now; }
  else {
    if (plan.rsvps.length >= siteConfig().plans.max_rsvps_per_plan) return false;
    plan.rsvps.push({ id: newToken(6), firstName, status, profileId, at: now });
  }
  await store().set(pKey(plan.id), plan);
  return true;
}
export async function cancelPlan(plan: Plan) { plan.cancelled = true; await store().set(pKey(plan.id), plan); }

async function livePlans(now: string): Promise<Plan[]> {
  const out: Plan[] = [];
  for (const key of await store().list('plan:')) {
    const p = await getPlan(key.slice(5), now);
    if (p) out.push(p);
  }
  return out;
}

export async function upcomingGroupPlans(groupId: string, now: string): Promise<Plan[]> {
  return (await livePlans(now)).filter((p) => p.groupId === groupId && planUpcoming(p, now)).sort((a, b) => a.start.localeCompare(b.start));
}

/** Plans this family may see and that are still ahead: organised, invited to, or from one of their classes. */
export async function plansForProfile(p: Profile, now: string): Promise<{ plan: Plan; role: PlanRole }[]> {
  const groups = new Map<string, Group | null>();
  const out: { plan: Plan; role: PlanRole }[] = [];
  for (const plan of await livePlans(now)) {
    if (!planUpcoming(plan, now) || plan.audience === 'link' && plan.organiserProfileId !== p.id) continue;
    if (plan.groupId && !groups.has(plan.groupId)) groups.set(plan.groupId, await groupById(plan.groupId));
    if (canViewPlan(plan, p, plan.groupId ? groups.get(plan.groupId) ?? null : null, false)) out.push({ plan, role: planRole(plan, p) });
  }
  return out.sort((a, b) => a.plan.start.localeCompare(b.plan.start));
}

/** Items used in the group's plans with the number of families going. Counts only, never names. */
export function popularItems(plans: Plan[]): { itemId: string; title: string; families: number }[] {
  const map = new Map<string, { itemId: string; title: string; families: number }>();
  for (const p of plans) {
    if (!p.itemId) continue;
    const e = map.get(p.itemId) ?? { itemId: p.itemId, title: p.title, families: 0 };
    e.families += goingCount(p);
    map.set(p.itemId, e);
  }
  return [...map.values()].sort((a, b) => b.families - a.families);
}
