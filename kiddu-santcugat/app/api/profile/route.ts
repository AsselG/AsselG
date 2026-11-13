import type { NextRequest } from 'next/server';
import { createProfile } from '@/lib/social';
import { profileFromForm } from '@/lib/profile-form';
import { readForm, see, setProfileCookie } from '@/lib/http';
import { currentProfile } from '@/lib/session';
import { now } from '@/lib/server-context';

/** Creates the family profile for this phone (one per phone; an existing one is kept). */
export async function POST(req: NextRequest) {
  const form = await readForm(req);
  if (await currentProfile()) return see(req, `/${form.lang}/me`);
  const input = profileFromForm(form);
  if (!input) return see(req, `/${form.lang}/me?error=name`);
  const p = await createProfile(input, await now());
  const res = see(req, `/${form.lang}/me`);
  setProfileCookie(res, req, p);
  return res;
}
