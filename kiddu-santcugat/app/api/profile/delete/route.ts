import type { NextRequest } from 'next/server';
import { deleteFamily, PROFILE_COOKIE } from '@/lib/social';
import { clearCookie, readForm, see } from '@/lib/http';
import { currentProfile } from '@/lib/session';

export async function POST(req: NextRequest) {
  const form = await readForm(req);
  const me = await currentProfile();
  const res = see(req, `/${form.lang}/me`);
  if (!me || form.get('confirm') !== 'yes') return res;
  await deleteFamily(me);
  clearCookie(res, PROFILE_COOKIE);
  return res;
}
