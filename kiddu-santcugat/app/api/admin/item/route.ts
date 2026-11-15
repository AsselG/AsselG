import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin';
import { unpublish } from '@/lib/gathering';
import { readForm, see } from '@/lib/http';
import { now as clock } from '@/lib/server-context';

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return new NextResponse('Not found', { status: 404 });
  const form = await readForm(req);
  if (form.get('action') === 'unpublish') await unpublish(form.get('id'), await clock());
  return see(req, `/${form.lang}/admin/items`);
}
