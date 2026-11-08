import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
import bundled from '../data/catalogue.json';
import type { Catalogue } from './types';

/** Bundled catalogue; tests point CATALOGUE_PATH at a fixture. Supabase replaces this in milestone M2. */
export function loadCatalogue(): Catalogue {
  const p = process.env.CATALOGUE_PATH;
  if (p) return JSON.parse(fs.readFileSync(path.join(process.cwd(), p), 'utf8'));
  return bundled as Catalogue;
}
