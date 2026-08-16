import type { Metadata } from 'next';
import { describeBackend, getBuilderRepository, getRepository, getWorkRepository } from '@orca/content';

import { AdminShell } from '@/components/AdminShell';
import { getCurrentAccount } from '@/lib/session';

import './globals.css';

export const metadata: Metadata = {
  title: 'Orca Admin',
  icons: { icon: '/favicon.svg' },
  description: '콘텐츠 · SEO/GEO · 검수 대시보드',
  robots: { index: false, follow: false },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const backend = describeBackend();
  const account = await getCurrentAccount();

  // Sidebar nav badges + topbar "검수 대기" pill both need these — computed once
  // here rather than in every page, since AdminShell renders on every route.
  const [{ posts }, { builders }, { works }] = await Promise.all([
    getRepository().getAll(),
    getBuilderRepository().getAll(),
    getWorkRepository().getAll(),
  ]);
  const draftCount = posts.filter((p) => p.status === 'draft').length;
  const inReviewCount = posts.filter((p) => p.status === 'in_review').length;
  const builderPendingCount = builders.filter((b) => b.status === 'pending').length;
  const workPendingCount = works.filter((w) => w.status === 'pending_review').length;

  const pendingCounts = {
    builder: builderPendingCount,
    work: workPendingCount,
    insight: inReviewCount,
  };

  // Header 알림 벨이 보여주는 "확인이 필요한 항목" — 매 페이지에서 fetch를
  // 새로 하지 않도록 이미 불러온 배열에서 계산해 AdminShell로 내려준다.
  const attentionItems = [
    draftCount > 0 && { href: '/insight', label: 'Insight 초안', count: draftCount },
    inReviewCount > 0 && { href: '/insight', label: 'Insight 검수 대기', count: inReviewCount },
    builderPendingCount > 0 && { href: '/builder', label: 'Builder 검증 대기', count: builderPendingCount },
    workPendingCount > 0 && { href: '/work', label: 'Work 승인 대기', count: workPendingCount },
  ].filter((item): item is { href: string; label: string; count: number } => Boolean(item));

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
        <AdminShell account={account} pendingCounts={pendingCounts} attentionItems={attentionItems}>
          {children}
        </AdminShell>
      </body>
    </html>
  );
}
