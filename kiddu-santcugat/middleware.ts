import { NextResponse, type NextRequest } from 'next/server';
import { pickLang } from './lib/i18n';

/** "/" → "/ca" | "/es" | "/en" from the browser language (features/08). */
export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  url.pathname = `/${pickLang(req.headers.get('accept-language'))}`;
  return NextResponse.redirect(url);
}

export const config = { matcher: ['/'] };
