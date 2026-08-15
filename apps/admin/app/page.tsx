import Link from 'next/link';
import { getBuilderRepository, getRepository, getWorkRepository } from '@orca/content';
import type { MenuKey } from '@orca/content';

import { StatusBadge } from '@/components/StatusBadge';

export const dynamic = 'force-dynamic';

const MENU_LABELS: Record<MenuKey, string> = {
  dashboard: 'Dashboard',
  builder: 'Builder',
  work: 'Work',
  insight: 'Insight',
  inquiry: 'Inquiry',
  settings: 'Settings',
  accountPermission: '계정 · 권한',
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ denied?: string }>;
}) {
  const { denied } = await searchParams;
  const [{ posts, errors }, { builders }, { works }] = await Promise.all([
    getRepository().getAll(),
    getBuilderRepository().getAll(),
    getWorkRepository().getAll(),
  ]);

  const counts = {
    total: posts.length,
    draft: posts.filter((p) => p.status === 'draft').length,
    inReview: posts.filter((p) => p.status === 'in_review').length,
    published: posts.filter((p) => p.status === 'published').length,
  };

  const builderCounts = {
    total: builders.length,
    pending: builders.filter((b) => b.status === 'pending').length,
    active: builders.filter((b) => b.status === 'active').length,
  };

  const workCounts = {
    total: works.length,
    pendingReview: works.filter((w) => w.status === 'pending_review').length,
    published: works.filter((w) => w.status === 'published').length,
  };

  const recent = [...posts].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5);

  // "확인이 필요한 항목" — only surfaces work that actually needs a decision,
  // not every count on the dashboard.
  const attentionItems = [
    counts.draft > 0 && { href: '/insight', label: 'Insight 초안', count: counts.draft },
    counts.inReview > 0 && { href: '/insight', label: 'Insight 검수 대기', count: counts.inReview },
    builderCounts.pending > 0 && { href: '/builder', label: 'Builder 검증 대기', count: builderCounts.pending },
    workCounts.pendingReview > 0 && { href: '/work', label: 'Work 승인 대기', count: workCounts.pendingReview },
  ].filter((item): item is { href: string; label: string; count: number } => Boolean(item));

  return (
    <div className="space-y-8">
      {denied && (
        <div
          className="rounded-xl p-4 text-sm"
          style={{ background: 'var(--color-warning-bg)', color: 'var(--color-warning)' }}
        >
          <strong>{MENU_LABELS[denied as MenuKey] ?? denied}</strong> 메뉴에 접근할 권한이 없습니다. 필요하면
          계정·권한 관리자에게 요청하세요.
        </div>
      )}

      {errors.length > 0 && (
        <div
          className="rounded-xl p-4 text-sm"
          style={{ background: 'var(--color-danger-bg)', color: 'var(--color-danger)' }}
        >
          <p className="font-semibold">프론트매터 오류가 있는 파일이 있습니다:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {errors.map((error) => (
              <li key={error} className="whitespace-pre-wrap font-mono text-xs">
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 핵심 통계 — 카드 3개를 나열하는 대신 하나의 요약 바에 구분선으로 묶는다. */}
      <div className="card grid grid-cols-1 divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0" style={{ borderColor: 'var(--color-border)' }}>
        {[
          { href: '/insight', label: 'Insight', total: counts.total, detail: `초안 ${counts.draft} · 검수 중 ${counts.inReview} · 발행 ${counts.published}` },
          { href: '/builder', label: 'Builder', total: builderCounts.total, detail: `검증 대기 ${builderCounts.pending} · 활성 ${builderCounts.active}` },
          { href: '/work', label: 'Work', total: workCounts.total, detail: `승인 대기 ${workCounts.pendingReview} · 공개 ${workCounts.published}` },
        ].map((item, i) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block px-1 py-2 transition-colors hover:opacity-80 ${i > 0 ? 'sm:pl-6' : ''} ${i < 2 ? 'sm:pr-6' : ''}`}
          >
            <p className="label mb-0">{item.label}</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums">{item.total}</p>
            <p className="mt-1 text-xs" style={{ color: 'var(--color-ink-muted)' }}>
              {item.detail}
            </p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        {/* 빠른 업무 파악 — 확인이 필요한 항목만 리스트로. */}
        <section className="card space-y-1">
          <h2 className="mb-3 font-semibold">확인이 필요한 항목</h2>
          {attentionItems.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--color-ink-muted)' }}>
              지금 확인이 필요한 항목이 없습니다.
            </p>
          ) : (
            <ul className="-mx-2">
              {attentionItems.map((item) => (
                <li key={`${item.href}-${item.label}`}>
                  <Link
                    href={item.href}
                    className="flex items-center justify-between gap-3 rounded-lg px-2 py-2.5 text-sm transition-colors hover:bg-[var(--color-surface-sunken)]"
                  >
                    <span className="flex items-center gap-2.5">
                      <span
                        className="size-1.5 shrink-0 rounded-full"
                        style={{ background: 'var(--color-warning)' }}
                      />
                      {item.label}
                    </span>
                    <span className="badge bg-[var(--color-warning-bg)] text-[var(--color-warning)]">
                      {item.count}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* 최근 콘텐츠 현황 */}
        <section className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">최근 수정된 Insight</h2>
            <Link href="/insight" className="text-sm" style={{ color: 'var(--color-accent-soft-text)' }}>
              전체 보기
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--color-ink-muted)' }}>
              아직 글이 없습니다.
            </p>
          ) : (
            <ul className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
              {recent.map((post) => (
                <li key={post.slug} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <Link href={`/insight/${encodeURIComponent(post.slug)}`} className="font-medium hover:underline">
                      {post.title}
                    </Link>
                    <p className="mt-0.5 text-xs" style={{ color: 'var(--color-ink-faint)' }}>
                      {post.updatedAt.slice(0, 10)}
                    </p>
                  </div>
                  <StatusBadge status={post.status} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
