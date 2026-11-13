import type { NextRequest } from 'next/server';
import { createProfile, groupByInvite, joinGroup } from '@/lib/social';
import { profileFromForm } from '@/lib/profile-form';
import { readForm, see, setProfileCookie } from '@/lib/http';
import { currentProfile } from '@/lib/session';
import { now as clock } from '@/lib/server-context';

/** Joining a class uses the family profile on this phone; without one, a first name creates it. */
export async function POST(req: NextRequest) {
  const form = await readForm(req);
  const invite = form.get('invite');
  const g = await groupByInvite(invite);
  if (!g) return see(req, `/${form.lang}/class`);
  const now = await clock();
  let me = await currentProfile();
  let created = false;
  if (!me) {
    const input = profileFromForm(form);
    if (!input) return see(req, `/${form.lang}/g/${invite}?error=name`);
    me = await createProfile({ ...input, interests: [], languages: [] }, now);
    created = true;
  }
  await joinGroup(g, me, now);
  const res = see(req, `/${form.lang}/class/${g.id}`);
  if (created) setProfileCookie(res, req, me);
  return res;
}
