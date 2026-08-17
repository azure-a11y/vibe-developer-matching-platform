import Link from 'next/link';
import { auditPost, getRepository } from '@orca/content';
import type { PostStatus } from '@orca/content';

import { createPostAction } from '@/app/actions';
import { TableHeadRow } from '@/components/AdminTable';
import { CountSummary } from '@/components/CountSummary';
import { EmptyState } from '@/components/EmptyState';
import { CreatePanel, FilterBar } from '@/components/FilterBar';
import { PageHeader } from '@/components/PageHeader';
import { ScoreValue, StatusBadge } from '@/components/StatusBadge';
import { hasPermission, requireMenuPermission } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: '전체 상태' },
  { value: 'draft', label: '초안' },
  { value: 'in_review', label: '검수 중' },
  { value: 'scheduled', label: '예약' },
  { value: 'published', label: '발행됨' },
  { value: 'archived', label: '보관' },
];

export default async function InsightListPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const account = await requireMenuPermission('insight', 'view');
  const canWrite = hasPermission(account.menuPermissions.insight, 'edit_approve');

  const { q = '', status = 'all' } = await searchParams;
  const { posts: allPosts, errors } = await getRepository().getAll();
  const audits = new Map(allPosts.map((post) => [post.slug, auditPost(post)]));

  const counts = {
    total: allPosts.length,
    draft: allPosts.filter((p) => p.status === 'draft').length,
    inReview: allPosts.filter((p) => p.status === 'in_review').length,
    scheduled: allPosts.filter((p) => p.status === 'scheduled').length,
    published: allPosts.filter((p) => p.status === 'published').length,
    archived: allPosts.filter((p) => p.status === 'archived').length,
  };

  const query = q.trim().toLowerCase();
  const posts = allPosts.filter((post) => {
    const matchesQuery =
      query.length === 0 || post.title.toLowerCase().includes(query) || post.slug.toLowerCase().includes(query);
    const matchesStatus = status === 'all' || post.status === (status as PostStatus);
    return matchesQuery && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Insight"
        description={
          <CountSummary
            total={counts.total}
            items={[
              { label: '초안', count: counts.draft, tone: 'muted' },
              { label: '검수 중', count: counts.inReview, tone: 'pending' },
              { label: '예약', count: counts.scheduled, tone: 'scheduled' },
              { label: '발행', count: counts.published, tone: 'confirmed' },
              { label: '보관', count: counts.archived, tone: 'muted' },
            ]}
          />
        }
        actions={
          <Link href="/seo" className="text-sm" style={{ color: 'var(--color-accent-soft-text)' }}>
            SEO/GEO 현황 ↗
          </Link>
        }
      />

      {errors.length > 0 && (
        <div className="rounded-lg p-4 text-sm" style={{ background: 'var(--color-danger-bg)', color: 'var(--color-danger)' }}>
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

      {canWrite && (
        <CreatePanel label="+ Insight 작성">
          <form action={createPostAction} className="flex flex-wrap items-end gap-3">
            <div className="min-w-56">
              <label className="label" htmlFor="title">
                새 글 제목
              </label>
              <input id="title" name="title" className="field" placeholder="예: Next.js 16 캐시 컴포넌트 완전 정복" required />
            </div>
            <div className="w-40">
              <label className="label" htmlFor="slug">
                슬러그 (선택)
              </label>
              <input id="slug" name="slug" className="field" placeholder="자동 생성" />
            </div>
            <div className="w-40">
              <label className="label" htmlFor="author">
                작성자
              </label>
              <input id="author" name="author" className="field" defaultValue="blog-writer" />
            </div>
            <button type="submit" className="btn-primary">
              초안 만들기
            </button>
          </form>
        </CreatePanel>
      )}

      <FilterBar
        searchPlaceholder="제목 또는 슬러그로 검색"
        defaultQuery={q}
        statusOptions={STATUS_FILTER_OPTIONS}
        defaultStatus={status}
      />

      {/* `overflow-x-auto`, not `overflow-hidden`: a wide table should scroll
          inside its container rather than have columns silently clipped. */}
      <div className="table-shell">
        <table className="w-full text-sm">
          <thead>
            <TableHeadRow labels={['제목', '상태', '점수', '작성자', '수정일']} actionsColumn centerColumns={[1, 2]} />
          </thead>
          <tbody className="divide-y">
            {posts.map((post) => {
              const audit = audits.get(post.slug)!;
              return (
                <tr key={post.slug} className="transition-colors hover:bg-[var(--color-surface-sunken)]">
                  <td className="px-5 py-4">
                    <Link href={`/insight/${encodeURIComponent(post.slug)}`} className="font-medium hover:underline">
                      {post.title}
                    </Link>
                    <p className="mt-0.5 font-mono text-xs" style={{ color: 'var(--color-ink-faint)' }}>
                      {post.slug}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <StatusBadge status={post.status} />
                  </td>
                  <td className="px-5 py-4 text-center">
                    <ScoreValue score={audit.score} />
                  </td>
                  <td className="px-5 py-4" style={{ color: 'var(--color-ink-muted)' }}>
                    {post.author}
                  </td>
                  <td className="px-5 py-4 tabular-nums" style={{ color: 'var(--color-ink-faint)' }}>
                    {post.updatedAt.slice(0, 10)}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-right">
                    <Link href={`/insight/${encodeURIComponent(post.slug)}/review`} className="text-sm" style={{ color: 'var(--color-accent-soft-text)' }}>
                      검수
                    </Link>
                  </td>
                </tr>
              );
            })}
            {posts.length === 0 && (
              <tr>
                <td colSpan={6}>
                  <EmptyState>
                    {allPosts.length === 0 ? '아직 글이 없습니다. 위에서 초안을 만들어 보세요.' : '검색 조건에 맞는 글이 없습니다.'}
                  </EmptyState>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
