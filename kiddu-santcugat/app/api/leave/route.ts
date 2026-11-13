import type { NextRequest } from 'next/server';
import { groupById, leaveGroup } from '@/lib/social';
import { readForm, see } from '@/lib/http';
import { currentProfile } from '@/lib/session';

/** Leaving a class removes the family from it and from its playdates; the family profile stays. */
export async function POST(req: NextRequest) {
  const form = await readForm(req);
  const g = await groupById(form.get('groupId'));
  const me = await currentProfile();
  if (g && me && g.members.some((m) => m.id === me.id)) await leaveGroup(g, me);
  return see(req, `/${form.lang}`);
}
