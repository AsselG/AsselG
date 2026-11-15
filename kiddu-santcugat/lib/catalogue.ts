import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
import bundled from '../data/catalogue.json';
import { siteConfig } from './config';
import { listItems } from './gathering';
import type { Catalogue } from './types';

function baseCatalogue(): Catalogue {
  const p = process.env.CATALOGUE_PATH;
  if (p) return JSON.parse(fs.readFileSync(path.join(process.cwd(), p), 'utf8'));
  return bundled as Catalogue;
}

/**
 * What families see: items gathered by the pipeline and published (automatically or by an editor),
 * plus the demo catalogue while config `catalogue.include_demo_data` is on (tests always use the fixture).
 */
export async function loadCatalogue(): Promise<Catalogue> {
  const base = baseCatalogue();
  const demo = process.env.CATALOGUE_PATH ? true : siteConfig().catalogue.include_demo_data;
  const gathered = await listItems();
  return {
    meta: { ...base.meta, demo: demo ? base.meta.demo : false },
    items: [...(demo ? base.items : []), ...gathered],
  };
}
