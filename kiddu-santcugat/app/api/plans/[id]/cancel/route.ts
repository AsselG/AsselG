import type { NextRequest } from 'next/server';
import { cancelPlan, getPlan } from '@/lib/social';
import { readForm, see } from '@/lib/http';
import { now as clock } from '@/lib/server-context';

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const form = await readForm(req);
  const plan = await getPlan(id, await clock());
  const token = form.get('o');
  if (plan && token && token === plan.organiserToken) await cancelPlan(plan);
  return see(req, `/${form.lang}/p/${id}${token ? `?o=${encodeURIComponent(token)}` : ''}`);
}
