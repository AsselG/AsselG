import 'server-only';
import { randomBytes } from 'node:crypto';
import { store } from './store';
import { siteConfig } from './config';
import { goingCount, planExpired, planUpcoming, type Group, type Member, type Plan, type Rsvp } from './social-logic';

export const newToken = (bytes = 16) => randomBytes(bytes).toString('base64url');
const gKey = (id: string) => `group:${id}`;
const iKey = (t: string) => `invite:${t}`;
const pKey = (id: string) => `plan:${id}`;

// ---------- groups ----------
export async function createGroup(name: string, now: string): Promise<Group> {
  const g: Group = { id: newToken(12), name, inviteToken: newToken(), createdAt: now, members: [] };
  await store().set(gKey(g.id), g);
  await store().set(iKey(g.inviteToken), g.id);
  return g;
}
export const groupById = (id: string) => store().get<Group>(gKey(id));
export async function groupByInvite(token: string): Promise<Group | null> {
  const id = await store().get<string>(iKey(token));
  return id ? groupById(id) : null;
}
export async function joinGroup(g: Group, firstName: string, kidAges: number[], now: string): Promise<Member> {
  const m: Member = { id: newToken(8), secret: newToken(16), firstName, kidAges, joinedAt: now };
  g.members.push(m);
  await store().set(gKey(g.id), g);
  return m;
}
export function memberFromCookie(g: Group | null, cookie: string | undefined): Member | null {
  if (!g || !cookie) return null;
  const [id, secret] = cookie.split('.');
  return g.members.find((m) => m.id === id && m.secret === secret) ?? null;
}
export const memberCookieName = (groupId: string) => `kiddu_m_${groupId}`;

/** Removes the family from the group and from every RSVP in the group's plans. */
export async function leaveGroup(g: Group, memberId: string): Promise<void> {
  g.members = g.members.filter((m) => m.id !== memberId);
  await store().set(gKey(g.id), g);
  for (const plan of await plansOfGroup(g.id)) {
    const before = plan.rsvps.length;
    plan.rsvps = plan.rsvps.filter((r) => r.memberId !== memberId);
    const organiserLeft = plan.organiserMemberId === memberId;
    if (organiserLeft) { plan.organiserName = ''; plan.organiserMemberId = undefined; }
    if (organiserLeft || plan.rsvps.length !== before) await store().set(pKey(plan.id), plan);
  }
}

// ---------- plans ----------
export async function createPlan(p: { title: string; itemId?: string; groupId?: string; start: string; note: string; organiserName: string; organiserMemberId?: string }, now: string): Promise<Plan> {
  const plan: Plan = {
    id: newToken(), organiserToken: newToken(), organiserName: p.organiserName, organiserMemberId: p.organiserMemberId,
    title: p.title, itemId: p.itemId, groupId: p.groupId, start: p.start, note: p.note, createdAt: now, cancelled: false,
    rsvps: [{ id: newToken(6), firstName: p.organiserName, status: 'going', memberId: p.organiserMemberId, at: now }],
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

export async function addRsvp(plan: Plan, firstName: string, status: Rsvp['status'], memberId: string | undefined, now: string): Promise<boolean> {
  const same = (r: Rsvp) => (memberId ? r.memberId === memberId : !r.memberId && r.firstName.toLowerCase() === firstName.toLowerCase());
  const existing = plan.rsvps.find(same);
  if (existing) { existing.status = status; existing.at = now; }
  else {
    if (plan.rsvps.length >= siteConfig().plans.max_rsvps_per_plan) return false;
    plan.rsvps.push({ id: newToken(6), firstName, status, memberId, at: now });
  }
  await store().set(pKey(plan.id), plan);
  return true;
}
export async function cancelPlan(plan: Plan) { plan.cancelled = true; await store().set(pKey(plan.id), plan); }

async function allPlans(now: string): Promise<Plan[]> {
  const out: Plan[] = [];
  for (const key of await store().list('plan:')) {
    const p = await getPlan(key.slice(5), now);
    if (p) out.push(p);
  }
  return out;
}
async function plansOfGroup(groupId: string): Promise<Plan[]> {
  const keys = await store().list('plan:');
  const plans = await Promise.all(keys.map((k) => store().get<Plan>(k)));
  return plans.filter((p): p is Plan => !!p && p.groupId === groupId);
}

export async function upcomingGroupPlans(groupId: string, now: string): Promise<Plan[]> {
  return (await allPlans(now)).filter((p) => p.groupId === groupId && planUpcoming(p, now)).sort((a, b) => a.start.localeCompare(b.start));
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
