import type { NextRequest } from 'next/server';
import { loadCatalogue } from '@/lib/catalogue';
import { pick } from '@/lib/i18n';
import { createPlan, groupById } from '@/lib/social';
import { cleanName, cleanText, validStart, type Audience } from '@/lib/social-logic';
import { readForm, see, setCookie } from '@/lib/http';
import { currentProfile, memberOf } from '@/lib/session';
import { now as clock } from '@/lib/server-context';

export async function POST(req: NextRequest) {
  const form = await readForm(req);
  const now = await clock();
  const itemId = form.get('item') && form.get('item') !== 'other' ? form.get('item') : undefined;
  const item = itemId ? loadCatalogue().items.find((i) => i.id === itemId && i.status === 'published') : undefined;
  const title = item ? pick(item.title, form.lang, item.originalLanguage) : cleanText(form.get('placeName'), 60);
  const start = validStart(form.get('date'), form.get('time'), now);
  const me = await currentProfile();
  const group = form.get('group') ? await groupById(form.get('group')) : null;
  const member = await memberOf(group);
  const name = me ? me.firstName : cleanName(form.get('name'));
  const back = new URLSearchParams();
  if (item) back.set('item', item.id);
  if (member && group) back.set('group', group.id);
  if (!title || !start || !name) return see(req, `/${form.lang}/plan/new?${back}&error=1`);

  // Audience: class playdates stay with the class; friends-only needs a profile and real connections; otherwise the private link.
  let audience: Audience = 'link';
  let invited: string[] = [];
  if (member && group) audience = 'group';
  else if (me && form.get('audience') === 'friends') {
    audience = 'friends';
    invited = form.all('invited').filter((id) => me.friendIds.includes(id));
  }
  const address = !item ? cleanText(form.get('address'), 120) || undefined : undefined;
  const plan = await createPlan({
    title, itemId: item?.id, address, groupId: audience === 'group' ? group!.id : undefined, audience, invited,
    start, note: cleanText(form.get('note'), 140), organiserName: name, organiserProfileId: me?.id,
  }, now);
  const res = see(req, `/${form.lang}/p/${plan.id}?o=${plan.organiserToken}`);
  setCookie(res, req, `kiddu_o_${plan.id}`, plan.organiserToken);
  return res;
}
