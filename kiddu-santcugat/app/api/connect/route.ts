import type { NextRequest } from 'next/server';
import { connectFamilies, createProfile, declineRequest, disconnectFamilies, profileById, profileByInvite, requestConnection } from '@/lib/social';
import { profileFromForm } from '@/lib/profile-form';
import { readForm, see, setProfileCookie } from '@/lib/http';
import { currentProfile } from '@/lib/session';
import { now } from '@/lib/server-context';

/** One endpoint for every connection action: invite (personal link), request, accept, decline, remove. */
export async function POST(req: NextRequest) {
  const form = await readForm(req);
  const action = form.get('action');
  const me = await currentProfile();
  const home = `/${form.lang}/me`;

  if (action === 'invite') {
    const inviter = await profileByInvite(form.get('token'));
    if (!inviter) return see(req, home);
    let who = me;
    let created = false;
    if (!who) {
      const input = profileFromForm(form);
      if (!input) return see(req, `/${form.lang}/f/${form.get('token')}?error=name`);
      who = await createProfile({ ...input, interests: [], languages: [] }, await now());
      created = true;
    }
    const r = await connectFamilies(who, inviter);
    const res = see(req, r === 'limit' ? `${home}?error=limit` : home);
    if (created) setProfileCookie(res, req, who);
    return res;
  }

  if (!me) return see(req, `${home}?need=profile`);
  const other = await profileById(form.get('id'));
  if (!other) return see(req, home);

  if (action === 'request') {
    await requestConnection(me, other);
    return see(req, form.get('back') === 'class' && me.groupIds[0] ? `/${form.lang}/class/${me.groupIds.find((g) => other.groupIds.includes(g)) ?? me.groupIds[0]}` : home);
  }
  if (action === 'accept' && me.requestIds.includes(other.id)) {
    const r = await connectFamilies(me, other);
    return see(req, r === 'limit' ? `${home}?error=limit` : home);
  }
  if (action === 'decline') await declineRequest(me, other.id);
  if (action === 'remove') await disconnectFamilies(me, other);
  return see(req, home);
}
