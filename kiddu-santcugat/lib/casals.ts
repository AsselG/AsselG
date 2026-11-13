import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
import bundled from '../data/casals.json';
import type { Casal } from './types';

export interface CasalCatalogue { meta: { demo?: boolean; season?: string; note?: string }; casals: Casal[] }

/** Bundled casals; tests point CASALS_PATH at a fixture. */
export function loadCasals(): CasalCatalogue {
  const p = process.env.CASALS_PATH;
  if (p) return JSON.parse(fs.readFileSync(path.join(process.cwd(), p), 'utf8'));
  return bundled as unknown as CasalCatalogue;
}

/** Every distinct week offered by any casal, in date order. */
export function casalWeeks(casals: Casal[]): { start: string; end: string }[] {
  const map = new Map<string, string>();
  for (const c of casals) for (const t of c.turns) map.set(t.start, t.end);
  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([start, end]) => ({ start, end }));
}
