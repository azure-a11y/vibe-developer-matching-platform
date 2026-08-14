import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Pure HMAC session-token math — no `next/headers`, so this file is safe to
 * import from `middleware.ts` (which can't use the Server Component cookie
 * API) as well as from Server Components/Actions.
 */

export const SESSION_COOKIE = 'admin_session';

const SECRET = process.env.ADMIN_SESSION_SECRET || 'dev-only-insecure-secret-change-in-production';
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function sign(payload: string): string {
  return createHmac('sha256', SECRET).update(payload).digest('hex');
}

/** `accountSlug` never contains `.` (SLUG_PATTERN), so it's safe as a field separator. */
export function createSessionToken(accountSlug: string): string {
  const expires = Date.now() + MAX_AGE_MS;
  const payload = `${accountSlug}.${expires}`;
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string): { accountSlug: string } | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [accountSlug, expiresRaw, signature] = parts as [string, string, string];
  const payload = `${accountSlug}.${expiresRaw}`;
  const expected = sign(payload);

  const given = Buffer.from(signature, 'hex');
  const wanted = Buffer.from(expected, 'hex');
  if (given.length !== wanted.length || !timingSafeEqual(given, wanted)) return null;

  const expires = Number(expiresRaw);
  if (!Number.isFinite(expires) || Date.now() > expires) return null;

  return { accountSlug };
}
