import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { addRsvp, getPlan, groupById, memberCookieName, memberFromCookie } from '@/lib/social';
import { cleanName } from '@/lib/social-logic';
import { readForm, see } from '@/lib/http';
import { now as clock } from '@/lib/server-context';

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const form = await readForm(req);
  const now = await clock();
  const plan = await getPlan(id, now);
  const back = `/${form.lang}/p/${id}`;
  if (!plan || plan.cancelled) return see(req, back);
  const status = ({ going: 'going', maybe: 'maybe', no: 'no' } as const)[form.get('status') as 'going'] ?? 'going';
  const group = plan.groupId ? await groupById(plan.groupId) : null;
  const member = memberFromCookie(group, group ? (await cookies()).get(memberCookieName(group.id))?.value : undefined);
  const name = member ? member.firstName : cleanName(form.get('name'));
  if (!name) return see(req, `${back}?error=name`);
  await addRsvp(plan, name, status, member?.id, now);
  return see(req, back);
}
