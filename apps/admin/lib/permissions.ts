import { redirect } from 'next/navigation';
import type { AdminAccount, MenuKey, PermissionLevel } from '@orca/content';

import { getCurrentAccount } from './session';

const RANK: Record<PermissionLevel, number> = { none: 0, view: 1, edit_approve: 2, full: 3 };

export function hasPermission(level: PermissionLevel, required: PermissionLevel): boolean {
  return RANK[level] >= RANK[required];
}

/**
 * Server Component / Server Action guard.
 *
 * Redirects to `/login` when nobody is signed in, or to `/?denied=<menu>`
 * when the signed-in account's level for `menu` is below `required`. Returns
 * the account so callers don't have to fetch it twice.
 */
export async function requireMenuPermission(menu: MenuKey, required: PermissionLevel): Promise<AdminAccount> {
  const account = await getCurrentAccount();
  if (!account) redirect('/login');
  if (!hasPermission(account.menuPermissions[menu], required)) {
    redirect(`/?denied=${menu}`);
  }
  return account;
}
