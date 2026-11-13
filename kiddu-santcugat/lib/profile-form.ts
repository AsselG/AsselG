import 'server-only';
import { siteConfig } from './config';
import { LANGS } from './i18n';
import { cleanName, parseAges, pickAllowed } from './social-logic';
import type { ProfileInput } from './social';
import type { Theme } from './types';

/** Reads the family profile fields from a submitted form. Returns null when the first name is missing or invalid. */
export function profileFromForm(form: { get: (k: string) => string; all: (k: string) => string[] }): ProfileInput | null {
  const firstName = cleanName(form.get('firstName'));
  if (!firstName) return null;
  return {
    firstName,
    kidAges: parseAges(form.get('ages')),
    interests: pickAllowed(form.all('interests'), siteConfig().themes as Theme[]),
    languages: pickAllowed(form.all('languages'), LANGS),
  };
}
