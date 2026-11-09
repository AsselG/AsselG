import 'server-only';
import { cookies, headers } from 'next/headers';
import { groupById, memberCookieName, memberFromCookie } from './social';
import type { Group, Member } from './social-logic';

export async function memberOf(group: Group | null): Promise<Member | null> {
  if (!group) return null;
  return memberFromCookie(group, (await cookies()).get(memberCookieName(group.id))?.value);
}

/** The first class group this phone belongs to, if any (cookie only, no lookup). */
export async function myGroupId(): Promise<string | null> {
  const c = (await cookies()).getAll().find((x) => x.name.startsWith('kiddu_m_'));
  return c ? c.name.slice('kiddu_m_'.length) : null;
}

export async function organiserToken(planId: string, query?: string): Promise<string | undefined> {
  return query ?? (await cookies()).get(`kiddu_o_${planId}`)?.value;
}

export async function origin(): Promise<string> {
  const h = await headers();
  const proto = h.get('x-forwarded-proto') ?? 'http';
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost';
  return `${proto}://${host}`;
}

export { groupById };
