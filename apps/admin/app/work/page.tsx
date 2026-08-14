import Link from 'next/link';
import { getBuilderRepository, getWorkRepository } from '@orca/content';

import { createWorkAction } from '@/app/work/actions';
import { TableHeadRow } from '@/components/AdminTable';
import { WorkStatusBadge } from '@/components/StatusBadge';
import { hasPermission, requireMenuPermission } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

export default async function WorkListPage() {
  const account = await requireMenuPermission('work', 'view');
  const canWrite = hasPermission(account.menuPermissions.work, 'edit_approve');

  const [{ works, errors }, { builders }] = await Promise.all([
    getWorkRepository().getAll(),
    getBuilderRepository().getAll(),
  ]);
  const builderNames = new Map(builders.map((b) => [b.slug, b.displayName]));

  const counts = {
    total: works.length,
    pendingReview: works.filter((w) => w.status === 'pending_review').length,
    published: works.filter((w) => w.status === 'published').length,
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Work</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-ink-muted)' }}>
          전체 {counts.total} · 승인 대기 {counts.pendingReview} · 공개 {counts.published}
        </p>
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
        <form action={createWorkAction} className="card flex flex-wrap items-end gap-3">
          <div className="min-w-64 flex-1">
            <label className="label" htmlFor="title">
              프로젝트명
            </label>
            <input id="title" name="title" className="field" placeholder="예: Flowdesk" required />
          </div>
          <div className="w-48">
            <label className="label" htmlFor="slug">
              슬러그 (선택)
            </label>
            <input id="slug" name="slug" className="field" placeholder="자동 생성" />
          </div>
          <button type="submit" className="btn-primary">
            Work 추가
          </button>
        </form>
      )}

      <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
        <table className="w-full text-sm">
          <thead>
            <TableHeadRow labels={['프로젝트명', '참여 빌더', '작업 기간', '상태', '수정일']} />
          </thead>
          <tbody className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
            {works.map((work) => (
              <tr key={work.slug} className="transition-colors hover:bg-[var(--color-surface-sunken)]">
                <td className="px-5 py-4">
                  <Link href={`/work/${encodeURIComponent(work.slug)}`} className="font-medium hover:underline">
                    {work.title}
                  </Link>
                  <p className="mt-0.5 font-mono text-xs" style={{ color: 'var(--color-ink-faint)' }}>
                    {work.slug}
                  </p>
                </td>
                <td className="px-5 py-4" style={{ color: 'var(--color-ink-muted)' }}>
                  {work.builderIds.length > 0
                    ? work.builderIds.map((id) => builderNames.get(id) ?? id).join(', ')
                    : '—'}
                </td>
                <td className="px-5 py-4" style={{ color: 'var(--color-ink-muted)' }}>
                  {work.period || '—'}
                </td>
                <td className="px-5 py-4">
                  <WorkStatusBadge status={work.status} />
                </td>
                <td className="px-5 py-4 tabular-nums" style={{ color: 'var(--color-ink-faint)' }}>
                  {work.updatedAt.slice(0, 10)}
                </td>
              </tr>
            ))}
            {works.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-sm" style={{ color: 'var(--color-ink-muted)' }}>
                  아직 등록된 Work가 없습니다. 위에서 추가해 보세요.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
