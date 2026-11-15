import fs from 'node:fs';
import path from 'node:path';
import bundled from '../data/places.json';

/** Known venues with coordinates. The pipeline places events on the map only when it recognises the venue. */
export interface Place { id: string; name: string; aliases: string[]; address: string; lat: number; lng: number }

export function loadPlaces(): Place[] {
  const p = process.env.KIDDU_PLACES_PATH;
  if (p) return JSON.parse(fs.readFileSync(path.join(process.cwd(), p), 'utf8'));
  return bundled as Place[];
}

export const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

/** Finds a known place whose name or alias appears in the place name or address the AI found. */
export function matchPlace(places: Place[], ...texts: (string | null | undefined)[]): Place | null {
  const hay = texts.filter(Boolean).map((x) => ` ${norm(x!)} `);
  for (const p of places) {
    for (const a of [p.name, ...p.aliases]) {
      const n = ` ${norm(a)} `;
      if (n.trim() && hay.some((h) => h.includes(n))) return p;
    }
  }
  return null;
}
