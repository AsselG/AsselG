import type { NextRequest } from 'next/server';
import { rotateRecovery } from '@/lib/social';
import { readForm, see } from '@/lib/http';
import { currentProfile } from '@/lib/session';

export async function POST(req: NextRequest) {
  const form = await readForm(req);
  const me = await currentProfile();
  if (me) await rotateRecovery(me);
  return see(req, `/${form.lang}/me`);
}
