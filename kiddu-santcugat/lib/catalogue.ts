import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
import type { Catalogue } from './types';

/** The catalogue file; tests point CATALOGUE_PATH at a fixture. Supabase replaces this in milestone M2. */
export function loadCatalogue(): Catalogue {
  const p = process.env.CATALOGUE_PATH ?? 'data/catalogue.json';
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), p), 'utf8'));
}
