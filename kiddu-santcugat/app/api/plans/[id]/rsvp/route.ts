import type { NextRequest } from 'next/server';
import { addRsvp, getPlan, groupById } from '@/lib/social';
import { canViewPlan, cleanName } from '@/lib/social-logic';
import { readForm, see } from '@/lib/http';
import { currentProfile, organiserToken } from '@/lib/session';
import { now as clock } from '@/lib/server-context';

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const form = await readForm(req);
  const now = await clock();
  const plan = await getPlan(id, now);
  const back = `/${form.lang}/p/${id}`;
  if (!plan || plan.cancelled) return see(req, back);
  const me = await currentProfile();
  const group = plan.groupId ? await groupById(plan.groupId) : null;
  const orgToken = await organiserToken(plan.id);
  if (!canViewPlan(plan, me, group, !!orgToken && orgToken === plan.organiserToken)) return see(req, back);
  const status = ({ going: 'going', maybe: 'maybe', no: 'no' } as const)[form.get('status') as 'going'] ?? 'going';
  const name = me ? me.firstName : cleanName(form.get('name'));
  if (!name) return see(req, `${back}?error=name`);
  await addRsvp(plan, name, status, me?.id, now);
  return see(req, back);
}
