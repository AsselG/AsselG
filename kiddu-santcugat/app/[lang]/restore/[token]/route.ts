import type { NextRequest } from 'next/server';
import { profileByRecovery } from '@/lib/social';
import { see, setProfileCookie } from '@/lib/http';
import { isLang } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

/** Opening a private recovery link puts the family profile on this phone. */
export async function GET(req: NextRequest, ctx: { params: Promise<{ lang: string; token: string }> }) {
  const { lang, token } = await ctx.params;
  const l = isLang(lang) ? lang : 'ca';
  const p = await profileByRecovery(token);
  const res = see(req, `/${l}/me`);
  if (p) setProfileCookie(res, req, p);
  return res;
}
