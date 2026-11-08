import { NextResponse, type NextRequest } from 'next/server';
import { pickLang } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

/** "/" → "/ca" | "/es" | "/en" from the browser language (features/08). */
export function GET(req: NextRequest) {
  const url = new URL(`/${pickLang(req.headers.get('accept-language'))}`, req.url);
  url.search = new URL(req.url).search;
  return NextResponse.redirect(url, 307);
}
