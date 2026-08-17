import Link from 'next/link';
import { getBuilderRepository, getRepository, getWorkRepository } from '@orca/content';
import type { MenuKey } from '@orca/content';

import type { CountTone } from '@/components/CountSummary';
import { CountSummary } from '@/components/CountSummary';
import { KpiCard } from '@/components/KpiCard';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';

export const dynamic = 'force-dynamic';

const PLUUG_ADMIN_URL = process.env.PLUUG_ADMIN_URL?.trim() || '';

const MENU_LABELS: Record<MenuKey, string> = {
  dashboard: 'Dashboard',
  builder: 'Builder',
  work: 'Work',
  insight: 'Insight',
  faq: 'Faq',
  inquiry: 'Inquiry',
  settings: 'Settings',
  accountPermission: 'Accounts & Permissions',
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
    scheduled: posts.filter((p) => p.status === 'scheduled').length,
    published: posts.filter((p) => p.status === 'published').length,
    archived: posts.filter((p) => p.status === 'archived').length,
  };

  const builderCounts = {
    total: builders.length,
    pending: builders.filter((b) => b.status === 'pending').length,
    active: builders.filter((b) => b.status === 'active').length,
    inactive: builders.filter((b) => b.status === 'inactive').length,
  };

  const workCounts = {
    total: works.length,
    pendingReview: works.filter((w) => w.status === 'pending_review').length,
    published: works.filter((w) => w.status === 'published').length,
    archived: works.filter((w) => w.status === 'archived').length,
  };

  const recent = [...posts].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5);

  // "확인이 필요한 항목" — only surfaces work that actually needs a decision,
  // not every count on the dashboard. tone은 KPI 카드(CountSummary)와 동일한 상태 색상을 쓴다.
  const attentionItems = [
    counts.draft > 0 && { href: '/insight', menu: 'Insight', title: '초안', count: counts.draft, tone: 'muted' as CountTone },
    counts.inReview > 0 && { href: '/insight', menu: 'Insight', title: '검수 대기', count: counts.inReview, tone: 'pending' as CountTone },
    builderCounts.pending > 0 && { href: '/builder', menu: 'Builder', title: '검증 대기', count: builderCounts.pending, tone: 'pending' as CountTone },
    workCounts.pendingReview > 0 && { href: '/work', menu: 'Work', title: '승인 대기', count: workCounts.pendingReview, tone: 'pending' as CountTone },
  ].filter((item): item is { href: string; menu: string; title: string; count: number; tone: CountTone } => Boolean(item));

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="운영 현황을 한눈에 확인합니다" />

      {denied && (
        <div
          className="rounded-lg p-4 text-sm"
          style={{ background: 'var(--color-warning-bg)', color: 'var(--color-warning)' }}
        >
          <strong>{MENU_LABELS[denied as MenuKey] ?? denied}</strong> 메뉴에 접근할 권한이 없습니다. 필요하면
          계정·권한 관리자에게 요청하세요.
        </div>
      )}

      {errors.length > 0 && (
        <div
          className="rounded-lg p-4 text-sm"
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

      {/* 핵심 KPI — 항목마다 독립 카드로, 클릭하면 해당 관리 화면으로 이동한다. */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          href="/builder"
          label="Builder"
          value={builderCounts.total}
          detail={
            <CountSummary
              items={[
                { label: '검증 대기', count: builderCounts.pending, tone: 'pending' },
                { label: '활성', count: builderCounts.active, tone: 'confirmed' },
                { label: '비활성', count: builderCounts.inactive, tone: 'inactive' },
              ]}
            />
          }
        />
        <KpiCard
          href="/inquiry"
          label="Inquiry"
          value={PLUUG_ADMIN_URL ? '연동됨' : '—'}
          detail={PLUUG_ADMIN_URL ? 'pluug에서 문의를 확인하세요' : 'pluug 관리 URL 미설정'}
        />
        <KpiCard
          href="/insight"
          label="Insight"
          value={counts.total}
          detail={
            <CountSummary
              items={[
                { label: '초안', count: counts.draft, tone: 'muted' },
                { label: '검수 중', count: counts.inReview, tone: 'pending' },
                { label: '예약', count: counts.scheduled, tone: 'scheduled' },
                { label: '발행', count: counts.published, tone: 'confirmed' },
              ]}
            />
          }
        />
        <KpiCard
          href="/work"
          label="Work"
          value={workCounts.total}
          detail={
            <CountSummary
              items={[
                { label: '승인 대기', count: workCounts.pendingReview, tone: 'pending' },
                { label: '공개', count: workCounts.published, tone: 'confirmed' },
                { label: '보관', count: workCounts.archived, tone: 'muted' },
              ]}
            />
          }
        />
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
                <li key={`${item.href}-${item.menu}-${item.title}`}>
                  <Link
                    href={item.href}
                    className="flex items-center justify-between gap-3 rounded-lg px-2 py-2.5 text-sm transition-colors hover:bg-[var(--color-surface-sunken)]"
                  >
                    <span className="flex items-baseline gap-3">
                      <span className="flex items-center gap-2.5">
                        <span
                          className="size-1.5 shrink-0 rounded-full"
                          style={{ background: 'var(--color-danger)' }}
                        />
                        <span
                          className="text-xs font-semibold tracking-wide"
                          style={{ color: 'var(--color-ink-faint)' }}
                        >
                          [{item.menu}]
                        </span>
                      </span>
                      <span>{item.title}</span>
                    </span>
                    <span className={`badge badge-${item.tone}`}>{item.count}</span>
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
