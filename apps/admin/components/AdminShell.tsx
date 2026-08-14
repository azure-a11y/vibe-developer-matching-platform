'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { AdminAccount, MenuKey } from '@orca/content';

import { logoutAction } from '@/lib/auth-actions';

const NAV_ITEMS: { href: string; label: string; menuKey: MenuKey }[] = [
  { href: '/', label: 'Dashboard', menuKey: 'dashboard' },
  { href: '/builder', label: 'Builder', menuKey: 'builder' },
  { href: '/work', label: 'Work', menuKey: 'work' },
  { href: '/insight', label: 'Insight', menuKey: 'insight' },
  { href: '/inquiry', label: 'Inquiry', menuKey: 'inquiry' },
  { href: '/settings', label: 'Settings', menuKey: 'settings' },
  { href: '/permissions', label: '계정 · 권한', menuKey: 'accountPermission' },
];

/** `/` only matches the dashboard itself; every other item matches its subtree. */
function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

interface AdminShellProps {
  children: React.ReactNode;
  /** `null` when nobody is signed in (only reachable on `/login` — middleware blocks everywhere else). */
  account: AdminAccount | null;
}

export function AdminShell({ children, account }: AdminShellProps) {
  const pathname = usePathname();

  // The login screen has no sidebar/topbar chrome — it isn't behind auth yet.
  if (pathname === '/login') return <>{children}</>;

  const current = NAV_ITEMS.find((item) => isActive(pathname, item.href));
  // Dashboard always shows; every other item hides once its permission is `none`.
  const visibleItems = NAV_ITEMS.filter(
    (item) => item.menuKey === 'dashboard' || !account || account.menuPermissions[item.menuKey] !== 'none',
  );

  return (
    <div className="flex min-h-dvh">
      <aside className="flex w-60 shrink-0 flex-col border-r border-neutral-200 bg-white">
        <Link href="/" className="flex items-center gap-2 px-6 py-5 font-semibold tracking-tight">
          Orca <span className="text-neutral-400">Admin</span>
        </Link>
        <nav className="flex flex-1 flex-col gap-0.5 px-3">
          {visibleItems.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="space-y-3 border-t border-neutral-200 p-4">
          {account && (
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{account.name}</p>
                <p className="truncate text-xs text-neutral-400">{account.grade}</p>
              </div>
              <form action={logoutAction}>
                <button type="submit" className="shrink-0 text-xs text-neutral-500 hover:text-neutral-900">
                  로그아웃
                </button>
              </form>
            </div>
          )}
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-xs text-neutral-500 hover:text-neutral-900"
          >
            사이트 보기 ↗
          </a>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-neutral-200 bg-white px-8 py-4">
          <h1 className="text-lg font-semibold tracking-tight">{current?.label ?? 'Admin'}</h1>
        </header>
        <main className="min-w-0 flex-1 px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
