import type { NextRequest } from 'next/server';
import { saveProfile } from '@/lib/social';
import { profileFromForm } from '@/lib/profile-form';
import { readForm, see } from '@/lib/http';
import { currentProfile } from '@/lib/session';

export async function POST(req: NextRequest) {
  const form = await readForm(req);
  const me = await currentProfile();
  if (!me) return see(req, `/${form.lang}/me`);
  const input = profileFromForm(form);
  if (!input) return see(req, `/${form.lang}/me?error=name`);
  Object.assign(me, input);
  await saveProfile(me);
  return see(req, `/${form.lang}/me`);
}
