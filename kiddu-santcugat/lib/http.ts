import 'server-only';
import { NextResponse, type NextRequest } from 'next/server';
import { isLang } from './i18n';
import type { Lang } from './types';

export const see = (req: NextRequest, path: string) => NextResponse.redirect(new URL(path, req.url), 303);

export async function readForm(req: NextRequest): Promise<{ get: (k: string) => string; all: (k: string) => string[]; lang: Lang }> {
  const f = await req.formData();
  const all = (k: string) => f.getAll(k).filter((v): v is string => typeof v === 'string');
  const get = (k: string) => { const v = f.get(k); return typeof v === 'string' ? v : ''; };
  const l = get('lang');
  return { get, all, lang: isLang(l) ? l : 'ca' };
}

export function setCookie(res: NextResponse, req: NextRequest, name: string, value: string) {
  res.cookies.set(name, value, {
    httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 180,
    secure: new URL(req.url).protocol === 'https:' || req.headers.get('x-forwarded-proto') === 'https',
  });
}
export const clearCookie = (res: NextResponse, name: string) => res.cookies.set(name, '', { path: '/', maxAge: 0 });

import { PROFILE_COOKIE, profileCookieValue } from './social';
import type { Profile } from './social-logic';
export const setProfileCookie = (res: NextResponse, req: NextRequest, p: Profile) => setCookie(res, req, PROFILE_COOKIE, profileCookieValue(p));
