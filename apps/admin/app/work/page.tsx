import Link from 'next/link';
import { getBuilderRepository, getWorkRepository } from '@orca/content';
import type { WorkStatus } from '@orca/content';

import { createWorkAction } from '@/app/work/actions';
import { TableHeadRow } from '@/components/AdminTable';
import { CountSummary } from '@/components/CountSummary';
import { EmptyState } from '@/components/EmptyState';
import { CreatePanel, FilterBar } from '@/components/FilterBar';
import { PageHeader } from '@/components/PageHeader';
import { WorkStatusBadge } from '@/components/StatusBadge';
import { hasPermission, requireContentPermission } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: '전체 상태' },
  { value: 'pending_review', label: '승인 대기' },
  { value: 'published', label: '공개' },
  { value: 'archived', label: '보관' },
];

export default async function WorkListPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const account = await requireContentPermission('work', 'view');
  const canWrite = account.role === 'builder' || hasPermission(account.menuPermissions.work, 'edit_approve');

  const { q = '', status = 'all' } = await searchParams;
  const [{ works: allWorks, errors }, { builders }] = await Promise.all([
    account.role === 'builder' ? getWorkRepository().getOwnedByBuilder(account.builderId!).then((works) => ({ works, errors: [] as string[] })) : getWorkRepository().getAll(),
    getBuilderRepository().getAll(),
  ]);
  const builderNames = new Map(builders.map((b) => [b.slug, b.displayName]));

  const counts = {
    total: allWorks.length,
    pendingReview: allWorks.filter((w) => w.status === 'pending_review').length,
    published: allWorks.filter((w) => w.status === 'published').length,
    archived: allWorks.filter((w) => w.status === 'archived').length,
  };

  const query = q.trim().toLowerCase();
  const works = allWorks.filter((work) => {
    const matchesQuery =
      query.length === 0 || work.title.toLowerCase().includes(query) || work.slug.toLowerCase().includes(query);
    const matchesStatus = status === 'all' || work.status === (status as WorkStatus);
    return matchesQuery && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Work"
        description={
          <CountSummary
            total={counts.total}
            items={[
              { label: '승인 대기', count: counts.pendingReview, tone: 'pending' },
              { label: '공개', count: counts.published, tone: 'confirmed' },
              { label: '보관', count: counts.archived, tone: 'muted' },
            ]}
          />
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
        <CreatePanel label="+ Work 추가">
          <form action={createWorkAction} className="flex flex-wrap items-end gap-3">
            <div className="min-w-56">
              <label className="label" htmlFor="title">
                프로젝트명
              </label>
              <input id="title" name="title" className="field" placeholder="예: Flowdesk" required />
            </div>
            <div className="w-40">
              <label className="label" htmlFor="slug">
                슬러그 (선택)
              </label>
              <input id="slug" name="slug" className="field" placeholder="자동 생성" />
            </div>
            <button type="submit" className="btn-primary">
              Work 추가
            </button>
          </form>
        </CreatePanel>
      )}

      <FilterBar
        searchPlaceholder="프로젝트명 또는 슬러그로 검색"
        defaultQuery={q}
        statusOptions={STATUS_FILTER_OPTIONS}
        defaultStatus={status}
      />

      <div className="table-shell">
        <table className="w-full text-sm">
          <thead>
            <TableHeadRow labels={['프로젝트명', '참여 빌더', '작업 기간', '상태', '수정일']} centerColumns={[3]} />
          </thead>
          <tbody className="divide-y">
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
                <td className="px-5 py-4 text-center">
                  <WorkStatusBadge status={work.status} />
                </td>
                <td className="px-5 py-4 tabular-nums" style={{ color: 'var(--color-ink-faint)' }}>
                  {work.updatedAt.slice(0, 10)}
                </td>
              </tr>
            ))}
            {works.length === 0 && (
              <tr>
                <td colSpan={5}>
                  <EmptyState>
                    {allWorks.length === 0 ? '아직 등록된 Work가 없습니다. 위에서 추가해 보세요.' : '검색 조건에 맞는 Work가 없습니다.'}
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
