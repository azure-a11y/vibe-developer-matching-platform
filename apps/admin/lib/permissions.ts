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
  if (account.role === 'builder' && !['dashboard', 'builder', 'insight', 'work'].includes(menu)) {
    redirect(`/?denied=${menu}`);
  }
  if (!hasPermission(account.menuPermissions[menu], required)) {
    redirect(`/?denied=${menu}`);
  }
  return account;
}

export async function requireAdminAccount(): Promise<AdminAccount> {
  const account = await getCurrentAccount();
  if (!account) redirect('/login');
  if (account.role !== 'admin') redirect('/?denied=admin');
  return account;
}

export async function requireBuilderAccount(): Promise<AdminAccount & { builderId: string }> {
  const account = await getCurrentAccount();
  if (!account) redirect('/login');
  if (account.role !== 'builder' || !account.builderId) redirect('/?denied=builder');
  return account as AdminAccount & { builderId: string };
}

export async function requireBuilderOrAdmin(): Promise<AdminAccount> {
  const account = await getCurrentAccount();
  if (!account) redirect('/login');
  return account;
}

export async function requireContentPermission(menu: 'builder' | 'insight' | 'work', required: PermissionLevel): Promise<AdminAccount> {
  const account = await getCurrentAccount();
  if (!account) redirect('/login');
  if (account.role === 'builder') {
    if (!account.builderId || required === 'full') redirect(`/?denied=${menu}`);
    return account;
  }
  if (!hasPermission(account.menuPermissions[menu], required)) redirect(`/?denied=${menu}`);
  return account;
}
