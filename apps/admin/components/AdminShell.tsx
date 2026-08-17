'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import type { AdminAccount, MenuKey } from '@orca/content';

import { logoutAction } from '@/lib/auth-actions';

type PendingCountKey = 'builder' | 'work' | 'insight';

interface AttentionItem {
  href: string;
  label: string;
  count: number;
}

const NAV_ITEMS: { href: string; label: string; menuKey: MenuKey; countKey?: PendingCountKey }[] = [
  { href: '/', label: 'Dashboard', menuKey: 'dashboard' },
  { href: '/work', label: 'Work', menuKey: 'work', countKey: 'work' },
  { href: '/insight', label: 'Insight', menuKey: 'insight', countKey: 'insight' },
  { href: '/faq', label: 'Faq', menuKey: 'faq' },
  { href: '/builder', label: 'Builder', menuKey: 'builder', countKey: 'builder' },
  { href: '/permissions', label: 'Accounts & Permissions', menuKey: 'accountPermission' },
  { href: '/inquiry', label: 'Inquiry', menuKey: 'inquiry' },
  { href: '/settings', label: 'Settings', menuKey: 'settings' },
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
  attentionItems: AttentionItem[];
  backend: { driver: 'file' | 'supabase'; message: string };
}

export function AdminShell({ children, account, pendingCounts, attentionItems, backend }: AdminShellProps) {
  const pathname = usePathname();

  // The login screen has no sidebar/topbar chrome — it isn't behind auth yet.
  if (pathname === '/login') return <>{children}</>;

  const current = NAV_ITEMS.find((item) => isActive(pathname, item.href));
  // Dashboard always shows; every other item hides once its permission is `none`.
  const visibleItems = NAV_ITEMS.filter(
    (item) => item.menuKey === 'dashboard' || !account || account.menuPermissions[item.menuKey] !== 'none',
  );
  const initial = account?.name.trim().charAt(0).toUpperCase() || '?';

  return (
    <div className="admin-shell flex min-h-dvh flex-col lg:flex-row" style={{ background: 'var(--color-bg)' }}>
      <aside
        className="admin-sidebar flex shrink-0 flex-col lg:w-64"
        style={{ background: 'var(--color-sidebar-bg)', borderRight: '1px solid var(--color-sidebar-border)' }}
      >
        <Link
          href="/"
          className="admin-brand flex items-center gap-3 px-4 pt-7 text-[0.9375rem] font-semibold tracking-tight"
          style={{ color: 'var(--color-sidebar-text-hover)' }}
        >
          <span className="admin-brand-chip">
            <img src="/logo-mark.png" alt="" className="admin-brand-mark" />
          </span>
          <span className="flex flex-col gap-0.5 leading-tight">
            AI Builder Group
            <small className="font-mono text-[10px] tracking-[.14em]" style={{ color: 'var(--color-sidebar-text)' }}>
              ADMIN
            </small>
          </span>
        </Link>

        <nav className="flex flex-wrap gap-0.5 px-2 lg:flex-col lg:flex-nowrap">
          {visibleItems.map((item) => {
            const active = isActive(pathname, item.href);
            const count = item.countKey ? pendingCounts[item.countKey] : 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className="admin-nav-link flex items-center gap-2 rounded-md px-3 py-2.5 font-medium transition-colors"
              >
                <span className="flex-1">{item.label}</span>
                {count > 0 && <span className="alert-badge">{count}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Site shortcut trails the nav by a fixed gap (~2 nav items tall)
            instead of being pushed to the sidebar's bottom edge, per design
            request — it reads as the nav's last entry, not an unrelated
            footer utility. */}
        <div className="mt-20 hidden px-4 pb-2 lg:block">
          <div className="mb-3 border-t" style={{ borderColor: 'var(--color-sidebar-border)' }} />
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs transition-colors hover:underline"
            style={{ color: 'var(--color-sidebar-text)' }}
          >
            View Site ↗
          </a>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header
          className="admin-topbar flex items-center justify-between gap-4 px-6 py-4 lg:px-10"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        >
          {/* 각 화면 본문의 PageHeader가 실제 타이틀을 담당한다 — 여기서는 현재
              위치를 알려주는 보조 breadcrumb 정도로만, 크게 겹치지 않게. */}
          <div className="flex min-w-0 items-center gap-1.5 text-sm">
            <Link
              href="/"
              className="shrink-0 font-medium transition-colors hover:underline"
              style={{ color: 'var(--color-ink-faint)' }}
            >
              admin home
            </Link>
            <span className="shrink-0" style={{ color: 'var(--color-ink-faint)' }}>
              ›
            </span>
            <p className="min-w-0 truncate font-medium" style={{ color: 'var(--color-ink-muted)' }}>
              {current?.label ?? 'Admin'}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-4">
            <BackendStatus backend={backend} />

            <HeaderDivider />
            <NotificationBell items={attentionItems} />

            {account && (
              <>
                <HeaderDivider />
                <div className="flex items-center gap-2.5">
                  <span
                    className="flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                    style={{ background: 'var(--color-accent-soft)', color: 'var(--color-accent-soft-text)' }}
                  >
                    {initial}
                  </span>
                  <div className="hidden leading-[1.35] sm:block">
                    <p className="truncate text-sm font-medium" style={{ color: 'var(--color-ink)' }}>
                      {account.name}
                    </p>
                    <p className="truncate text-xs" style={{ color: 'var(--color-ink-faint)' }}>
                      {account.grade}
                    </p>
                  </div>
                </div>

                <HeaderDivider />
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="shrink-0 text-xs font-medium transition-colors hover:underline"
                    style={{ color: 'var(--color-ink-muted)' }}
                  >
                    로그아웃
                  </button>
                </form>
              </>
            )}
          </div>
        </header>
        <main className="min-w-0 flex-1 px-6 py-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
}

/** Vertical rule that separates the header's right-side groups (status / notifications / profile / logout) so they read as distinct clusters instead of one run-on row. */
function HeaderDivider() {
  return <span className="h-5 w-px shrink-0" style={{ background: 'var(--color-border)' }} />;
}

/** Collapsed backend status — was a full-width banner on every page, which read as a dev debug strip rather than product UI. Detail stays one click away instead of disappearing. */
function BackendStatus({ backend }: { backend: { driver: 'file' | 'supabase'; message: string } }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const isSupabase = backend.driver === 'supabase';

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [open]);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors hover:bg-[var(--color-surface-sunken)]"
        style={{ color: 'var(--color-ink-muted)' }}
      >
        <span
          className="size-1.5 shrink-0 rounded-full"
          style={{ background: isSupabase ? 'var(--color-success)' : 'var(--color-warning)' }}
        />
        {isSupabase ? 'Supabase' : '파일 기반'}
      </button>

      {open && (
        <div
          className="absolute top-11 right-0 z-50 w-72 rounded-lg p-3 text-xs leading-relaxed"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)', color: 'var(--color-ink-muted)' }}
        >
          <p className="mb-1 font-semibold" style={{ color: 'var(--color-ink)' }}>
            {isSupabase ? 'Supabase 활성' : '파일 기반 (데모)'}
          </p>
          {backend.message}
        </div>
      )}
    </div>
  );
}

function NotificationBell({ items }: { items: AttentionItem[] }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const total = items.reduce((sum, item) => sum + item.count, 0);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [open]);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="알림"
        aria-expanded={open}
        className="relative flex size-9 items-center justify-center rounded-md transition-colors hover:bg-[var(--color-surface-sunken)]"
        style={{ color: 'var(--color-ink-muted)' }}
      >
        <BellIcon />
        {total > 0 && (
          <span className="alert-badge alert-badge-corner absolute -top-1 -right-1">{total > 9 ? '9+' : total}</span>
        )}
      </button>

      {open && (
        <div
          className="absolute top-11 right-0 z-50 w-72 rounded-lg py-1.5"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)' }}
        >
          <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--color-ink-faint)' }}>
            확인이 필요한 항목
          </p>
          {items.length === 0 ? (
            <p className="px-3 py-3 text-sm" style={{ color: 'var(--color-ink-muted)' }}>
              지금 확인이 필요한 항목이 없습니다.
            </p>
          ) : (
            <ul>
              {items.map((item) => (
                <li key={`${item.href}-${item.label}`}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between gap-3 px-3 py-2 text-sm transition-colors hover:bg-[var(--color-surface-sunken)]"
                  >
                    <span>{item.label}</span>
                    <span className="badge bg-[var(--color-warning-bg)] text-[var(--color-warning)]">{item.count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M10 2.5c-2.3 0-4.1 1.9-4.1 4.2v2.3c0 .5-.2 1.2-.5 1.6l-1.1 1.4c-.5.6-.1 1.6.7 1.6h10c.8 0 1.2-1 .7-1.6l-1.1-1.4c-.3-.4-.5-1.1-.5-1.6V6.7c0-2.3-1.9-4.2-4.1-4.2Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M8.3 16.2a1.8 1.8 0 0 0 3.4 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
