import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

export const ADMIN_COOKIE = 'kiddu_admin';
const sign = (key: string) => createHmac('sha256', key).update('kiddu-admin-v1').digest('hex');

export function adminCookieFor(key: string): string | null {
  const admin = process.env.KIDDU_ADMIN_KEY;
  if (!admin || key.length !== admin.length || !timingSafeEqual(Buffer.from(key), Buffer.from(admin))) return null;
  return sign(admin);
}

export async function isAdmin(): Promise<boolean> {
  const admin = process.env.KIDDU_ADMIN_KEY;
  const c = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!admin || !c) return false;
  const want = sign(admin);
  return c.length === want.length && timingSafeEqual(Buffer.from(c), Buffer.from(want));
}

/** Admin pages do not exist for anyone else. */
export async function requireAdmin() { if (!(await isAdmin())) notFound(); }
