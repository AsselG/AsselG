import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin';
import { getDraft, publishDraft, PublishError, saveDraft } from '@/lib/gathering';
import { loadPlaces } from '@/lib/places';
import { pickAllowed, cleanText } from '@/lib/social-logic';
import { siteConfig } from '@/lib/config';
import { readForm, see } from '@/lib/http';
import { now as clock } from '@/lib/server-context';
import type { Theme } from '@/lib/types';

const num = (v: string, min: number, max: number) => { if (v.trim() === '') return null; const n = Number(v); return Number.isFinite(n) && n >= min && n <= max ? n : null; };
const dt = (v: string) => (/^\d{4}-\d\d-\d\dT\d\d:\d\d$/.test(v) ? v : undefined);

/** Editor actions on a draft: save edits, publish, or reject with a reason. */
export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return new NextResponse('Not found', { status: 404 });
  const form = await readForm(req);
  const d = await getDraft(form.get('id'));
  const back = `/${form.lang}/admin/queue/${form.get('id')}`;
  if (!d) return see(req, `/${form.lang}/admin/queue`);
  const now = await clock();
  const action = form.get('action');

  if (action === 'reject') {
    const reason = cleanText(form.get('reason'), 200);
    if (!reason) return see(req, `${back}?error=reason`);
    d.status = 'rejected'; d.rejectReason = reason; d.updatedAt = now;
    await saveDraft(d);
    return see(req, `/${form.lang}/admin/queue`);
  }

  // Apply the editor's fields.
  const lang = d.item.originalLanguage ?? 'ca';
  const i = d.item;
  const title = cleanText(form.get('title'), 120);
  if (title) i.title = { [lang]: title };
  const summary = cleanText(form.get('summary'), 300);
  if (summary !== (i.description?.[lang] ?? '')) { i.description = summary ? { [lang]: summary } : undefined; i.descriptionAiGenerated = false; }
  const themes = pickAllowed(form.all('themes'), siteConfig().themes as Theme[]);
  if (themes.length) i.themes = themes;
  i.ageMin = num(form.get('ageMin'), 0, 17); i.ageMax = num(form.get('ageMax'), 0, 17);
  i.price = num(form.get('price'), 0, 500);
  i.indoor = form.get('indoor') === 'yes';
  i.start = dt(form.get('start')); i.end = dt(form.get('end'));
  i.placeName = cleanText(form.get('placeName'), 80) || undefined;
  i.address = cleanText(form.get('address'), 120) || undefined;
  i.town = cleanText(form.get('town'), 60) || i.town;
  const known = loadPlaces().find((p) => p.id === form.get('knownPlace'));
  if (known) { i.lat = known.lat; i.lng = known.lng; i.placeName = known.name; i.address = known.address; }
  else { const lat = num(form.get('lat'), -90, 90), lng = num(form.get('lng'), -180, 180); i.lat = lat; i.lng = lng; }
  const booking = cleanText(form.get('bookingUrl'), 300);
  i.bookingUrl = /^https?:\/\//.test(booking) ? booking : undefined;
  d.edited = true; d.updatedAt = now;
  if (i.lat != null) d.issues = d.issues.filter((x) => !x.startsWith('Location unknown'));

  if (action === 'publish') {
    try { await publishDraft(d, 'editor', now); }
    catch (e) { if (e instanceof PublishError) { await saveDraft(d); return see(req, `${back}?error=location`); } throw e; }
    return see(req, `/${form.lang}/admin/queue`);
  }
  await saveDraft(d);
  return see(req, back);
}
