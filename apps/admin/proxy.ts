import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { SESSION_COOKIE, verifySessionToken } from './lib/session-token';

/**
 * Blocks unauthenticated access to the entire admin app (04_정책정의.md §4.3,
 * §4.4 — WO-3 absorbed into this). Verifies the HMAC signature, not just
 * cookie presence, so a forged cookie value doesn't get through. Proxy
 * always runs on the Node.js runtime, so `node:crypto` is available.
 */
export function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? verifySessionToken(token) : null;
  const isLoginPage = request.nextUrl.pathname === '/login';

  if (!session && !isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (session && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
