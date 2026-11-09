import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createGroup } from '@/lib/social';
import { cleanText } from '@/lib/social-logic';
import { readForm, see } from '@/lib/http';
import { now } from '@/lib/server-context';

/** Creating class groups is for the owner/AFA only: needs KIDDU_ADMIN_KEY. */
export async function POST(req: NextRequest) {
  const form = await readForm(req);
  const key = form.get('key');
  const admin = process.env.KIDDU_ADMIN_KEY;
  if (!admin || key !== admin) return new NextResponse('Not found', { status: 404 });
  const name = cleanText(form.get('name'), 60);
  if (!name) return see(req, `/${form.lang}/groups/new?key=${encodeURIComponent(key)}`);
  const g = await createGroup(name, await now());
  return see(req, `/${form.lang}/groups/new?key=${encodeURIComponent(key)}&created=${g.id}`);
}
