import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { groupById, leaveGroup, memberCookieName, memberFromCookie } from '@/lib/social';
import { clearCookie, readForm, see } from '@/lib/http';

export async function POST(req: NextRequest) {
  const form = await readForm(req);
  const g = await groupById(form.get('groupId'));
  const res = see(req, `/${form.lang}`);
  if (!g) return res;
  const m = memberFromCookie(g, (await cookies()).get(memberCookieName(g.id))?.value);
  if (m) await leaveGroup(g, m.id);
  clearCookie(res, memberCookieName(g.id));
  return res;
}
