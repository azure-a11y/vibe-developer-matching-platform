import type { Metadata } from 'next';
import { describeBackend } from '@orca/content';

import { AdminShell } from '@/components/AdminShell';
import { getCurrentAccount } from '@/lib/session';

import './globals.css';

export const metadata: Metadata = {
  title: 'Orca Admin',
  description: '콘텐츠 · SEO/GEO · 검수 대시보드',
  robots: { index: false, follow: false },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const backend = describeBackend();
  const account = await getCurrentAccount();

  return (
    <html lang="ko">
      <body className="min-h-dvh">
        {/* The demo state is a supported state, not a warning — but it must be
            visible so nobody assumes writes are hitting a database. */}
        <div
          className="px-6 py-2 text-center font-mono text-[11px] tracking-wide"
          style={
            backend.driver === 'supabase'
              ? { background: 'var(--color-success-bg)', color: 'var(--color-success)' }
              : { background: 'var(--color-warning-bg)', color: 'var(--color-warning)' }
          }
        >
          <strong>{backend.driver === 'supabase' ? 'Supabase' : '파일 기반'}</strong> · {backend.message}
        </div>
        <AdminShell account={account}>{children}</AdminShell>
      </body>
    </html>
  );
}
