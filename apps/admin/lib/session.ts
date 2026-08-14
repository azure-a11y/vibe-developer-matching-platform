import { cookies } from 'next/headers';
import { getAdminAccountRepository } from '@orca/content';

import { SESSION_COOKIE, verifySessionToken } from './session-token';

export { SESSION_COOKIE, createSessionToken, verifySessionToken } from './session-token';

/** Reads the session cookie and resolves the signed-in account, or `null`. */
export async function getCurrentAccount() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  const session = token ? verifySessionToken(token) : null;
  if (!session) return null;

  const account = await getAdminAccountRepository().getBySlug(session.accountSlug);
  if (!account || account.status !== 'active') return null;
  return account;
}
