import 'server-only';
import { cookies, headers } from 'next/headers';
import { groupById, PROFILE_COOKIE, profileById, profileFromCookie } from './social';
import type { Group, Profile } from './social-logic';

/** The family on this phone, from the profile cookie. */
export async function currentProfile(): Promise<Profile | null> {
  return profileFromCookie((await cookies()).get(PROFILE_COOKIE)?.value, profileById);
}

/** The signed-in family if it belongs to the group. */
export async function memberOf(group: Group | null): Promise<Profile | null> {
  if (!group) return null;
  const p = await currentProfile();
  return p && group.members.some((m) => m.id === p.id) ? p : null;
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
