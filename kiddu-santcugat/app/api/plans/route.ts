import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { loadCatalogue } from '@/lib/catalogue';
import { pick } from '@/lib/i18n';
import { createPlan, groupById, memberCookieName, memberFromCookie } from '@/lib/social';
import { cleanName, cleanText, validStart } from '@/lib/social-logic';
import { readForm, see, setCookie } from '@/lib/http';
import { now as clock } from '@/lib/server-context';

export async function POST(req: NextRequest) {
  const form = await readForm(req);
  const now = await clock();
  const itemId = form.get('item') && form.get('item') !== 'other' ? form.get('item') : undefined;
  const item = itemId ? loadCatalogue().items.find((i) => i.id === itemId && i.status === 'published') : undefined;
  const title = item ? pick(item.title, form.lang, item.originalLanguage) : cleanText(form.get('placeName'), 60);
  const start = validStart(form.get('date'), form.get('time'), now);
  const group = form.get('group') ? await groupById(form.get('group')) : null;
  const member = memberFromCookie(group, group ? (await cookies()).get(memberCookieName(group.id))?.value : undefined);
  const name = member ? member.firstName : cleanName(form.get('name'));
  const back = new URLSearchParams();
  if (item) back.set('item', item.id);
  if (member && group) back.set('group', group.id);
  if (!title || !start || !name) return see(req, `/${form.lang}/plan/new?${back}&error=1`);

  const plan = await createPlan({ title, itemId: item?.id, groupId: member ? group!.id : undefined, start, note: cleanText(form.get('note'), 140), organiserName: name, organiserMemberId: member?.id }, now);
  const res = see(req, `/${form.lang}/p/${plan.id}?o=${plan.organiserToken}`);
  setCookie(res, req, `kiddu_o_${plan.id}`, plan.organiserToken);
  return res;
}
