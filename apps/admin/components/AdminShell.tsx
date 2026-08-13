'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard' },
  { href: '/builder', label: 'Builder' },
  { href: '/work', label: 'Work' },
  { href: '/insight', label: 'Insight' },
  { href: '/inquiry', label: 'Inquiry' },
  { href: '/settings', label: 'Settings' },
  { href: '/permissions', label: '계정 · 권한' },
] as const;

/** `/` only matches the dashboard itself; every other item matches its subtree. */
function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const current = NAV_ITEMS.find((item) => isActive(pathname, item.href));

  return (
    <div className="flex min-h-dvh">
      <aside className="flex w-60 shrink-0 flex-col border-r border-neutral-200 bg-white">
        <Link href="/" className="flex items-center gap-2 px-6 py-5 font-semibold tracking-tight">
          Orca <span className="text-neutral-400">Admin</span>
        </Link>
        <nav className="flex flex-1 flex-col gap-0.5 px-3">
          {NAV_ITEMS.map((item) => {
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
        <div className="space-y-2 border-t border-neutral-200 p-4">
          <p className="text-xs text-neutral-400">인증 미구현 — 계정·권한(FR-10)은 다음 단계</p>
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
