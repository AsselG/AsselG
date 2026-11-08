'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import type { Filters, Lang } from '@/lib/types';
import type { CardView } from '@/lib/view';
import type { Key } from '@/lib/i18n';
import { distanceKm } from '@/lib/geo';
import { distanceLabel } from '@/lib/format';

const MapView = dynamic(() => import('./MapView'), { ssr: false, loading: () => <div className="map" /> });

interface Props {
  lang: Lang;
  dict: Record<Key, string>;
  areaName: string;
  center: [number, number];
  radiusKm: number;
  themes: string[];
  filters: Filters;
  cards: CardView[];
  rainy: boolean;
  demo: boolean;
}

function href(lang: Lang, f: Filters, patch: Partial<Record<keyof Filters, unknown>>): string {
  const next: Record<string, unknown> = { ...f, ...patch };
  const qs = new URLSearchParams();
  if (next.theme) qs.set('theme', String(next.theme));
  if (next.age != null && next.age !== '') qs.set('age', String(next.age));
  if (next.when) qs.set('when', String(next.when));
  if (next.free) qs.set('free', '1');
  if (next.indoor) qs.set('indoor', '1');
  const s = qs.toString();
  return `/${lang}${s ? `?${s}` : ''}`;
}

export default function HomeClient(p: Props) {
  const d = p.dict;
  const [selected, setSelected] = useState<string | null>(null);
  const [me, setMe] = useState<[number, number] | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const cardRefs = useRef<Record<string, HTMLLIElement | null>>({});

  // Location stays in this component's memory only: never sent, never stored.
  const cards = useMemo(() => {
    if (!me) return p.cards;
    return p.cards
      .map((c) => ({ ...c, distanceKm: distanceKm(me[0], me[1], c.lat, c.lng) }))
      .map((c) => ({ ...c, distance: distanceLabel(c.distanceKm) }))
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [p.cards, me]);

  useEffect(() => {
    if (selected) cardRefs.current[selected]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [selected]);

  function nearMe() {
    if (!('geolocation' in navigator)) return setNote(d.nearMeRefused);
    navigator.geolocation.getCurrentPosition(
      (pos) => { setMe([pos.coords.latitude, pos.coords.longitude]); setNote(d.nearMeOn); },
      () => { setMe(null); setNote(d.nearMeRefused); },
      { maximumAge: 300_000, timeout: 10_000 },
    );
  }

  const f = p.filters;
  return (
    <>
      {p.demo && <p className="banner" role="note">{d.demoBanner}</p>}
      <h1 data-testid="area-name">{p.areaName}</h1>
      <p className="sub">{d.tagline}</p>

      <nav className="chips" aria-label="Theme" data-testid="theme-filters">
        <a className="chip" href={href(p.lang, f, { theme: undefined })} aria-pressed={!f.theme}>✨ {d.theme_all}</a>
        {p.themes.map((th) => (
          <a key={th} className="chip" data-theme={th} href={href(p.lang, f, { theme: th })} aria-pressed={f.theme === th}>
            {d[`theme_${th}` as Key]}
          </a>
        ))}
      </nav>

      <nav className="chips" aria-label="When" data-testid="when-filters">
        {(['any', 'today', 'tomorrow', 'weekend'] as const).map((w) => (
          <a key={w} className="chip" data-when={w} href={href(p.lang, f, { when: w === 'any' ? undefined : w })}
            aria-pressed={(f.when ?? 'any') === w}>{d[`when_${w}`]}</a>
        ))}
      </nav>

      <div className="controls">
        <label>
          <span className="note">{d.childAge} </span>
          <select
            aria-label={d.childAge}
            data-testid="age-select"
            value={f.age ?? ''}
            onChange={(e) => { window.location.href = href(p.lang, f, { age: e.target.value === '' ? undefined : Number(e.target.value) }); }}
          >
            <option value="">{d.anyAge}</option>
            {Array.from({ length: 15 }, (_, i) => i).map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </label>
        <a className="chip" href={href(p.lang, f, { free: !f.free })} aria-pressed={!!f.free} data-testid="free-toggle">{d.freeOnly}</a>
        {f.indoor && <a className="chip" href={href(p.lang, f, { indoor: false })} aria-pressed="true">{d.indoorOnly} ✕</a>}
        {p.rainy && !f.indoor && <a className="chip rain" href={href(p.lang, f, { indoor: true })} data-testid="rainy-chip">🌧️ {d.rainyDay}</a>}
        <button className="btn" type="button" onClick={nearMe}>📍 {d.nearMe}</button>
      </div>
      {note && <p className="note" role="status" data-testid="location-note">{note}</p>}

      <div className="map" data-testid="map" data-area={p.areaName} data-center-lat={p.center[0]} data-center-lng={p.center[1]}>
        <MapView center={p.center} me={me} cards={cards} selected={selected} onSelect={setSelected} />
      </div>

      <p className="note" data-testid="result-count">{cards.length ? d.results.replace('{n}', String(cards.length)) : d.noResults}</p>
      <ul className="list" data-testid="item-list">
        {cards.map((c) => (
          <li
            key={c.id}
            ref={(el) => { cardRefs.current[c.id] = el; }}
            className={`card${selected === c.id ? ' selected' : ''}`}
            data-testid="item-card" data-id={c.id} data-type={c.type} data-indoor={c.indoor} data-themes={c.themes.join(' ')}
            data-age-specified={c.ageSpecified} data-age-min={c.ageMin ?? ''} data-age-max={c.ageMax ?? ''} aria-current={selected === c.id}
            onClick={(e) => { if (!(e.target as HTMLElement).closest('a')) setSelected(c.id); }}
          >
            <h2><span aria-hidden data-testid="card-icon">{c.icon}</span> <a href={`/${p.lang}/item/${c.id}`} data-testid="card-title">{c.title}</a></h2>
            <div className="meta" data-testid="card-meta">
              <span data-testid="card-theme">{c.themeLabels.join(', ')}</span>
              <span data-testid="card-age">{c.age}</span>
              <span data-testid="card-price">{c.price}</span>
              <span data-testid="card-distance">{c.distance}</span>
              <span data-testid="card-when">{c.when}</span>
            </div>
            <div className="checked" data-testid="card-checked">{c.lastChecked}</div>
            {c.stale && <div className="warn" data-testid="card-stale">⚠️ {d.stale}</div>}
          </li>
        ))}
      </ul>
    </>
  );
}
