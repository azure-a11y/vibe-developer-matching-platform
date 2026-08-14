import Link from 'next/link';
import { auditPost, getRepository } from '@orca/content';

import { createPostAction } from '@/app/actions';
import { TableHeadRow } from '@/components/AdminTable';
import { ScoreBadge, StatusBadge } from '@/components/StatusBadge';
import { hasPermission, requireMenuPermission } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

export default async function InsightListPage() {
  const account = await requireMenuPermission('insight', 'view');
  const canWrite = hasPermission(account.menuPermissions.insight, 'edit_approve');

  const { posts, errors } = await getRepository().getAll();
  const audits = new Map(posts.map((post) => [post.slug, auditPost(post)]));

  const counts = {
    total: posts.length,
    draft: posts.filter((p) => p.status === 'draft').length,
    inReview: posts.filter((p) => p.status === 'in_review').length,
    published: posts.filter((p) => p.status === 'published').length,
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Insight</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-ink-muted)' }}>
            전체 {counts.total} · 초안 {counts.draft} · 검수 중 {counts.inReview} · 발행 {counts.published}
          </p>
        </div>
        <Link href="/seo" className="text-sm" style={{ color: 'var(--color-accent)' }}>
          SEO/GEO 현황 ↗
        </Link>
      </header>

      {errors.length > 0 && (
        <div className="rounded-xl p-4 text-sm" style={{ background: 'var(--color-danger-bg)', color: 'var(--color-danger)' }}>
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
        <form action={createPostAction} className="card flex flex-wrap items-end gap-3">
          <div className="min-w-64 flex-1">
            <label className="label" htmlFor="title">
              새 글 제목
            </label>
            <input id="title" name="title" className="field" placeholder="예: Next.js 16 캐시 컴포넌트 완전 정복" required />
          </div>
          <div className="w-48">
            <label className="label" htmlFor="slug">
              슬러그 (선택)
            </label>
            <input id="slug" name="slug" className="field" placeholder="자동 생성" />
          </div>
          <div className="w-48">
            <label className="label" htmlFor="author">
              작성자
            </label>
            <input id="author" name="author" className="field" defaultValue="blog-writer" />
          </div>
          <button type="submit" className="btn-primary">
            초안 만들기
          </button>
        </form>
      )}

      {/* `overflow-x-auto`, not `overflow-hidden`: a wide table should scroll
          inside its container rather than have columns silently clipped. */}
      <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
        <table className="w-full text-sm">
          <thead>
            <TableHeadRow labels={['제목', '상태', '점수', '작성자', '수정일']} actionsColumn />
          </thead>
          <tbody className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
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
                  <td className="px-5 py-4">
                    <StatusBadge status={post.status} />
                  </td>
                  <td className="px-5 py-4">
                    <ScoreBadge score={audit.score} />
                  </td>
                  <td className="px-5 py-4" style={{ color: 'var(--color-ink-muted)' }}>
                    {post.author}
                  </td>
                  <td className="px-5 py-4 tabular-nums" style={{ color: 'var(--color-ink-faint)' }}>
                    {post.updatedAt.slice(0, 10)}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-right">
                    <Link href={`/insight/${encodeURIComponent(post.slug)}/review`} className="text-sm" style={{ color: 'var(--color-accent)' }}>
                      검수
                    </Link>
                  </td>
                </tr>
              );
            })}
            {posts.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-sm" style={{ color: 'var(--color-ink-muted)' }}>
                  아직 글이 없습니다. 위에서 초안을 만들어 보세요.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
