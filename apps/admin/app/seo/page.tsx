import Link from 'next/link';
import { auditPost, getRepository } from '@orca/content';

import { PageHeader } from '@/components/PageHeader';
import { ScoreValue } from '@/components/StatusBadge';
import { requireMenuPermission } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

const LANE_LABEL = {
  seo: 'SEO',
  geo: 'GEO',
  images: '이미지',
  editorial: '에디토리얼',
} as const;

const SEVERITY_STYLE: Record<'error' | 'warn' | 'info', string> = {
  error: 'bg-[var(--color-danger-bg)] text-[var(--color-danger)]',
  warn: 'bg-[var(--color-warning-bg)] text-[var(--color-warning)]',
  info: 'bg-[var(--color-neutral-badge-bg)] text-[var(--color-neutral-badge)]',
};

export default async function SeoOverviewPage() {
  await requireMenuPermission('insight', 'view');

  const { posts } = await getRepository().getAll();
  const audits = posts.map((post) => ({ post, audit: auditPost(post) }));

  const byLane = new Map<string, number>();
  for (const { audit } of audits) {
    for (const issue of audit.issues) {
      if (issue.severity === 'info') continue;
      byLane.set(issue.lane, (byLane.get(issue.lane) ?? 0) + 1);
    }
  }

  return (
    <div className="space-y-6">
      <Link href="/insight" className="text-sm" style={{ color: 'var(--color-ink-muted)' }}>
        ← Insight 목록
      </Link>
      <PageHeader
        title="SEO / GEO 상태"
        description="GEO는 Generative Engine Optimization — 답변 엔진이 인용할 수 있는 구조화 신호를 뜻합니다."
      />

      <div className="card grid grid-cols-2 divide-x divide-y-0 sm:grid-cols-4" style={{ borderColor: 'var(--color-border)' }}>
        {(Object.keys(LANE_LABEL) as (keyof typeof LANE_LABEL)[]).map((lane, i) => (
          <div key={lane} className={i > 0 ? 'pl-4' : ''}>
            <p className="label mb-0">{LANE_LABEL[lane]}</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums">{byLane.get(lane) ?? 0}</p>
            <p className="mt-1 text-xs" style={{ color: 'var(--color-ink-faint)' }}>
              해결해야 할 항목
            </p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {audits.map(({ post, audit }) => (
          <div key={post.slug} className="card space-y-3">
            <div className="flex items-center justify-between gap-4">
              <Link href={`/insight/${encodeURIComponent(post.slug)}`} className="font-semibold hover:underline">
                {post.title}
              </Link>
              <div className="flex items-center gap-3">
                <span className="text-xs" style={{ color: 'var(--color-ink-faint)' }}>
                  FAQ {post.geo.faq.length} · 인용 {post.geo.citations.length} · 키워드 {post.seo.keywords.length}
                </span>
                <ScoreValue score={audit.score} />
              </div>
            </div>
            {audit.issues.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--color-success)' }}>
                문제 없음.
              </p>
            ) : (
              <ul className="space-y-1.5 text-sm">
                {audit.issues.map((issue) => (
                  <li key={`${issue.field}-${issue.message}`} className="flex gap-2">
                    <span className={`badge shrink-0 ${SEVERITY_STYLE[issue.severity]}`}>{LANE_LABEL[issue.lane]}</span>
                    <span style={{ color: 'var(--color-ink)' }}>
                      <code className="font-mono text-xs" style={{ color: 'var(--color-ink-faint)' }}>
                        {issue.field}
                      </code>{' '}
                      — {issue.message}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
        {audits.length === 0 && (
          <p className="text-sm" style={{ color: 'var(--color-ink-muted)' }}>
            분석할 글이 없습니다.
          </p>
        )}
      </div>
    </div>
  );
}
