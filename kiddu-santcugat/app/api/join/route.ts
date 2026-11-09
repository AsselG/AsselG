import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { groupByInvite, joinGroup, memberCookieName, memberFromCookie } from '@/lib/social';
import { cleanName, parseAges } from '@/lib/social-logic';
import { readForm, see, setCookie } from '@/lib/http';
import { now } from '@/lib/server-context';

export async function POST(req: NextRequest) {
  const form = await readForm(req);
  const invite = form.get('invite');
  const g = await groupByInvite(invite);
  if (!g) return see(req, `/${form.lang}/class`);
  const existing = memberFromCookie(g, (await cookies()).get(memberCookieName(g.id))?.value);
  if (existing) return see(req, `/${form.lang}/class/${g.id}`);
  const name = cleanName(form.get('firstName'));
  if (!name) return see(req, `/${form.lang}/g/${invite}?error=name`);
  const m = await joinGroup(g, name, parseAges(form.get('ages')), await now());
  const res = see(req, `/${form.lang}/class/${g.id}`);
  setCookie(res, req, memberCookieName(g.id), `${m.id}.${m.secret}`);
  return res;
}
