import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAdminAccountRepository } from '@orca/content';

import { SESSION_COOKIE, verifySessionToken } from './lib/session-token';

/**
 * Blocks unauthenticated access to the entire admin app (04_정책정의.md §4.3,
 * §4.4 — WO-3 absorbed into this). Verifies the HMAC signature, not just
 * cookie presence, so a forged cookie value doesn't get through — and then
 * resolves the account it points at, since a signature stays valid after the
 * account itself is deleted and must not keep access alive. Proxy always
 * runs on the Node.js runtime, so both `node:crypto` and the file-based
 * content repository are available here.
 */
export async function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? verifySessionToken(token) : null;
  const account = session ? await getAdminAccountRepository().getBySlug(session.accountSlug) : null;
  const isValidSession = Boolean(account && account.status === 'active');
  const isLoginPage = request.nextUrl.pathname === '/login';

  if (!isValidSession && !isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    const response = NextResponse.redirect(url);
    if (session) response.cookies.delete(SESSION_COOKIE);
    return response;
  }

  if (isValidSession && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
