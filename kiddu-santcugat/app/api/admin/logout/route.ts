import type { NextRequest } from 'next/server';
import { ADMIN_COOKIE } from '@/lib/admin';
import { clearCookie, readForm, see } from '@/lib/http';

export async function POST(req: NextRequest) {
  const form = await readForm(req);
  const res = see(req, `/${form.lang}`);
  clearCookie(res, ADMIN_COOKIE);
  return res;
}
