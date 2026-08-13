import Link from 'next/link';
import { getRepository } from '@orca/content';

import { StatusBadge } from '@/components/StatusBadge';

export const dynamic = 'force-dynamic';

/** Sections without a data model yet (see docs/project/06_데이터모델.md) — placeholder counts only. */
const PENDING_DOMAINS = [
  { href: '/builder', label: 'Builder' },
  { href: '/work', label: 'Work' },
  { href: '/inquiry', label: 'Inquiry' },
] as const;

export default async function DashboardPage() {
  const { posts, errors } = await getRepository().getAll();

  const counts = {
    total: posts.length,
    draft: posts.filter((p) => p.status === 'draft').length,
    inReview: posts.filter((p) => p.status === 'in_review').length,
    published: posts.filter((p) => p.status === 'published').length,
  };

  const recent = [...posts].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5);

  return (
    <div className="space-y-8">
      <header>
        <p className="mt-1 text-sm text-neutral-500">
          운영 현황 개요. Builder · Work · Inquiry는 데이터 모델이 아직 없어 준비 중입니다
          (<code className="font-mono text-xs">docs/project/06_데이터모델.md</code> 참조).
        </p>
      </header>

      {errors.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/insight" className="card block transition-colors hover:border-neutral-300">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Insight</p>
          <p className="mt-2 text-3xl font-bold tabular-nums">{counts.total}</p>
          <p className="mt-1 text-xs text-neutral-500">
            초안 {counts.draft} · 검수 중 {counts.inReview} · 발행 {counts.published}
          </p>
        </Link>
        {PENDING_DOMAINS.map((domain) => (
          <Link key={domain.href} href={domain.href} className="card block transition-colors hover:border-neutral-300">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{domain.label}</p>
            <p className="mt-2 text-3xl font-bold text-neutral-300">—</p>
            <p className="mt-1 text-xs text-neutral-500">준비 중</p>
          </Link>
        ))}
      </div>

      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">최근 수정된 Insight</h2>
          <Link href="/insight" className="text-sm text-[var(--color-accent)] hover:underline">
            전체 보기
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="text-sm text-neutral-500">아직 글이 없습니다.</p>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {recent.map((post) => (
              <li key={post.slug} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <Link
                    href={`/insight/${encodeURIComponent(post.slug)}`}
                    className="font-medium hover:text-[var(--color-accent)]"
                  >
                    {post.title}
                  </Link>
                  <p className="mt-0.5 text-xs text-neutral-400">{post.updatedAt.slice(0, 10)}</p>
                </div>
                <StatusBadge status={post.status} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
