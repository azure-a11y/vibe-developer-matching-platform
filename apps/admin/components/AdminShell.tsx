'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { AdminAccount, MenuKey } from '@orca/content';

import { logoutAction } from '@/lib/auth-actions';
type PendingCountKey = 'builder' | 'work' | 'insight';

const NAV_ITEMS: { href: string; label: string; menuKey: MenuKey; countKey?: PendingCountKey }[] = [
  { href: '/', label: 'Dashboard', menuKey: 'dashboard' },
  { href: '/builder', label: 'Builder', menuKey: 'builder', countKey: 'builder' },
  { href: '/work', label: 'Work', menuKey: 'work', countKey: 'work' },
  { href: '/insight', label: 'Insight', menuKey: 'insight', countKey: 'insight' },
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
  pendingCounts: Record<PendingCountKey, number>;
}

export function AdminShell({ children, account, pendingCounts }: AdminShellProps) {
  const pathname = usePathname();

  // The login screen has no sidebar/topbar chrome — it isn't behind auth yet.
  if (pathname === '/login') return <>{children}</>;

  const current = NAV_ITEMS.find((item) => isActive(pathname, item.href));
  // Dashboard always shows; every other item hides once its permission is `none`.
  const visibleItems = NAV_ITEMS.filter(
    (item) => item.menuKey === 'dashboard' || !account || account.menuPermissions[item.menuKey] !== 'none',
  );
  const initial = account?.name.trim().charAt(0).toUpperCase() || '?';
  const totalPending = pendingCounts.builder + pendingCounts.work + pendingCounts.insight;

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <aside
        className="flex shrink-0 flex-col lg:w-64"
        style={{ background: 'var(--color-sidebar-bg)', borderColor: 'var(--color-sidebar-border)' }}
      >
        <Link
          href="/"
          className="flex items-center gap-2 px-6 py-5 text-sm font-semibold tracking-tight"
          style={{ color: 'var(--color-sidebar-text-hover)' }}
        >
          Orca <span style={{ color: 'var(--color-sidebar-text)' }}>Admin</span>
        </Link>

        <nav className="flex flex-1 flex-wrap gap-0.5 px-3 lg:flex-col lg:flex-nowrap">
          {visibleItems.map((item) => {
            const active = isActive(pathname, item.href);
            const count = item.countKey ? pendingCounts[item.countKey] : 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className="rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                style={
                  active
                    ? { background: 'var(--color-sidebar-active-bg)', color: 'var(--color-sidebar-active-text)' }
                    : { color: 'var(--color-sidebar-text)' }
                }
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.color = 'var(--color-sidebar-text-hover)';
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.color = 'var(--color-sidebar-text)';
                }}
              >
                <span className="flex-1">{item.label}</span>
                {count > 0 && <span className="alert-badge">{count}</span>}
              </Link>
            );
          })}
        </nav>

        <div
          className="mt-auto hidden flex-col gap-3 border-t p-4 lg:flex"
          style={{ borderColor: 'var(--color-sidebar-border)' }}
        >
          {account && (
            <div className="flex items-center gap-2.5">
              <span
                className="flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                style={{ background: 'var(--color-sidebar-active-bg)', color: 'var(--color-sidebar-active-text)' }}
              >
                {initial}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium" style={{ color: 'var(--color-sidebar-text-hover)' }}>
                  {account.name}
                </p>
                <p className="truncate text-xs" style={{ color: 'var(--color-sidebar-text)' }}>
                  {account.grade}
                </p>
              </div>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="shrink-0 text-xs font-medium transition-colors hover:underline"
                  style={{ color: 'var(--color-sidebar-text)' }}
                >
                  로그아웃
                </button>
              </form>
            </div>
          )}
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs transition-colors hover:underline"
            style={{ color: 'var(--color-sidebar-text)' }}
          >
            사이트 보기 ↗
          </a>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header
          className="flex items-center justify-between px-6 py-4 lg:px-10"
          style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)' }}
        >
          <h1 className="text-lg font-semibold tracking-tight">{current?.label ?? 'Admin'}</h1>
          {totalPending > 0 && (
            <span className="alert-badge alert-badge-wide">
              검수 대기 {totalPending}건
            </span>
          )}
        </header>
        <main className="min-w-0 flex-1 px-6 py-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
