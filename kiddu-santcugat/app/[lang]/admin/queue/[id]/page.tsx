import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLang } from '@/lib/i18n';
import { requireAdmin } from '@/lib/admin';
import { firstText, getDraft, listDrafts, type Evidence } from '@/lib/gathering';
import { loadPlaces } from '@/lib/places';
import { siteConfig } from '@/lib/config';
import AdminNav from '@/components/AdminNav';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Admin · review', robots: { index: false, follow: false } };

/** Splits the source text so every quote the AI used is highlighted; quotes that are not there stay unhighlighted. */
function highlight(text: string, ev: Evidence): React.ReactNode[] {
  const quotes = Object.values(ev).filter((q): q is string => !!q && q.length > 2);
  const lower = text.toLowerCase();
  const marks: [number, number][] = [];
  for (const q of quotes) { const i = lower.indexOf(q.toLowerCase()); if (i >= 0) marks.push([i, i + q.length]); }
  marks.sort((a, b) => a[0] - b[0]);
  const out: React.ReactNode[] = [];
  let pos = 0;
  marks.forEach(([a, b], n) => { if (a < pos) return; out.push(text.slice(pos, a)); out.push(<mark key={n}>{text.slice(a, b)}</mark>); pos = b; });
  out.push(text.slice(pos));
  return out;
}

export default async function Review({ params, searchParams }: { params: Promise<{ lang: string; id: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const { lang, id } = await params;
  if (!isLang(lang)) notFound();
  await requireAdmin();
  const d = await getDraft(id);
  if (!d) notFound();
  const sp = await searchParams;
  const pending = await listDrafts('pending');
  const i = d.item;
  const themes = siteConfig().themes;
  const places = loadPlaces();
  const allText = d.sources.map((s) => s.excerpt).join('\n').toLowerCase().replace(/\s+/g, ' ');
  const missing = (Object.entries(d.evidence) as [string, string | null][]).filter(([, q]) => q && !allText.includes(q.toLowerCase().replace(/\s+/g, ' ')));
  const field = (name: string, label: string, value: string | number | null | undefined, type = 'text') => (
    <div className="field"><label htmlFor={name}>{label}</label><input id={name} name={name} type={type} defaultValue={value ?? ''} step={type === 'number' ? 'any' : undefined} /></div>
  );
  return (
    <div className="stack">
      <AdminNav lang={lang} active="queue" pending={pending.length} />
      {sp.error === 'location' && <p className="alert danger" role="alert" data-testid="admin-error">This draft needs a location for the map: choose a known place or enter coordinates.</p>}
      {sp.error === 'reason' && <p className="alert danger" role="alert" data-testid="admin-error">Write a reason to reject it.</p>}
      <div className="page-head">
        <h1>{firstText(i.title)}</h1>
        <p><span data-testid="confidence" data-value={d.confidence}>{Math.round(d.confidence * 100)}% confidence</span> · {d.status} · model {d.model}</p>
      </div>
      {d.issues.length > 0 && <ul className="people">{d.issues.map((x) => <li key={x} data-testid="issue">{x}</li>)}</ul>}
      {missing.length > 0 && (
        <div className="panel" style={{ padding: 14 }}>
          <strong>Quotes the AI gave that are not on the page</strong>
          <ul style={{ margin: '6px 0 0', paddingLeft: 18 }}>{missing.map(([f, q]) => <li key={f} data-testid="missing-quote">{f}: “{q}”</li>)}</ul>
        </div>
      )}

      <div className="review-grid">
        <form className="panel form" method="post" action="/api/admin/draft" style={{ maxWidth: 'none' }}>
          <input type="hidden" name="lang" value={lang} /><input type="hidden" name="id" value={d.id} />
          {field('title', 'Title', firstText(i.title))}
          <div className="field"><label htmlFor="summary">Summary (AI, in its own words)</label><textarea id="summary" name="summary" rows={3} defaultValue={firstText(i.description)} /></div>
          <fieldset className="checks"><legend>Themes</legend>{themes.map((t) => <label key={t}><input type="checkbox" name="themes" value={t} defaultChecked={i.themes.includes(t as never)} />{t}</label>)}</fieldset>
          <div className="row">{field('start', 'Starts', i.start, 'datetime-local')}{field('end', 'Ends', i.end, 'datetime-local')}</div>
          <div className="row">{field('ageMin', 'Age from', i.ageMin, 'number')}{field('ageMax', 'Age to', i.ageMax, 'number')}{field('price', 'Price (€, 0 = free)', i.price, 'number')}</div>
          <div className="field"><label htmlFor="indoor">Indoor or outdoor</label><select id="indoor" name="indoor" defaultValue={i.indoor ? 'yes' : 'no'}><option value="yes">Indoor</option><option value="no">Outdoor</option></select></div>
          <div className="field"><label htmlFor="knownPlace">Known place</label>
            <select id="knownPlace" name="knownPlace" defaultValue={places.find((p) => p.lat === i.lat && p.lng === i.lng)?.id ?? ''}>
              <option value="">Not in the list</option>{places.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="row">{field('placeName', 'Place name', i.placeName)}{field('address', 'Address', i.address)}{field('town', 'Town', i.town)}</div>
          <div className="row">{field('lat', 'Latitude', i.lat, 'number')}{field('lng', 'Longitude', i.lng, 'number')}</div>
          {field('bookingUrl', 'Booking link', i.bookingUrl, 'url')}
          <div className="answers">
            <button className="btn" type="submit" name="action" value="publish">Publish</button>
            <button className="btn secondary" type="submit" name="action" value="save">Save draft</button>
          </div>
          <div className="field" style={{ marginTop: 8 }}><label htmlFor="reason">Reason for rejecting</label><input id="reason" name="reason" type="text" maxLength={200} /></div>
          <div><button className="btn danger" type="submit" name="action" value="reject">Reject</button></div>
        </form>

        <section className="panel">
          <h2>Source text</h2>
          <p className="note" style={{ marginTop: 0 }}>Highlighted: the quotes the AI gave as evidence and that we found on the page.</p>
          {d.sources.map((s) => (
            <div key={s.url} style={{ marginBottom: 14 }}>
              <a className="link" href={s.url} target="_blank" rel="noopener">{s.url}</a>
              <div className="source-text" data-testid="source-text">{highlight(s.excerpt, d.evidence)}</div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
