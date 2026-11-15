import type { NextRequest } from 'next/server';
import { ADMIN_COOKIE, adminCookieFor } from '@/lib/admin';
import { readForm, see } from '@/lib/http';

export async function POST(req: NextRequest) {
  const form = await readForm(req);
  const value = adminCookieFor(form.get('key'));
  if (!value) return see(req, `/${form.lang}/admin/login?error=1`);
  const res = see(req, `/${form.lang}/admin`);
  res.cookies.set(ADMIN_COOKIE, value, { httpOnly: true, sameSite: 'strict', path: '/', maxAge: 60 * 60 * 12, secure: new URL(req.url).protocol === 'https:' || req.headers.get('x-forwarded-proto') === 'https' });
  return res;
}
