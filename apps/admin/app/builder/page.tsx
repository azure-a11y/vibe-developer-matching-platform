import Link from 'next/link';
import { getAdminAccountRepository, getBuilderRepository } from '@orca/content';
import type { BuilderStatus } from '@orca/content';

import { createBuilderAction } from '@/app/builder/actions';
import { TableHeadRow } from '@/components/AdminTable';
import { CountSummary } from '@/components/CountSummary';
import { EmptyState } from '@/components/EmptyState';
import { CreatePanel, FilterBar } from '@/components/FilterBar';
import { PageHeader } from '@/components/PageHeader';
import { AccountStatusBadge, BuilderStatusBadge } from '@/components/StatusBadge';
import { hasPermission, requireContentPermission } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: '전체 상태' },
  { value: 'pending', label: '검증 대기' },
  { value: 'active', label: '활성' },
  { value: 'inactive', label: '비활성' },
];

export default async function BuilderListPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const account = await requireContentPermission('builder', 'view');
  const canWrite = account.role === 'builder' || hasPermission(account.menuPermissions.builder, 'edit_approve');
  const canManageAccounts = account.role === 'admin' && hasPermission(account.menuPermissions.accountPermission, 'edit_approve');

  const { q = '', status = 'all' } = await searchParams;
  const ownBuilder = account.role === 'builder' ? await getBuilderRepository().getById(account.builderId!) : null;
  const { builders: allBuilders, errors } = account.role === 'builder'
    ? { builders: ownBuilder ? [ownBuilder] : [], errors: [] as string[] }
    : await getBuilderRepository().getAll();

  const accountByBuilderId = canManageAccounts
    ? new Map((await getAdminAccountRepository().getAll()).accounts.filter((a) => a.builderId).map((a) => [a.builderId!, a]))
    : null;

  const counts = {
    total: allBuilders.length,
    pending: allBuilders.filter((b) => b.status === 'pending').length,
    active: allBuilders.filter((b) => b.status === 'active').length,
    inactive: allBuilders.filter((b) => b.status === 'inactive').length,
  };

  const query = q.trim().toLowerCase();
  const builders = allBuilders.filter((builder) => {
    const matchesQuery =
      query.length === 0 ||
      builder.displayName.toLowerCase().includes(query) ||
      builder.slug.toLowerCase().includes(query);
    const matchesStatus = status === 'all' || builder.status === (status as BuilderStatus);
    return matchesQuery && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Builder"
        description={
          <CountSummary
            total={counts.total}
            items={[
              { label: '검증 대기', count: counts.pending, tone: 'pending' },
              { label: '활성', count: counts.active, tone: 'confirmed' },
              { label: '비활성', count: counts.inactive, tone: 'inactive' },
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
        <CreatePanel label="+ 빌더 추가">
          <form action={createBuilderAction} className="flex flex-wrap items-end gap-3">
            <div className="min-w-56">
              <label className="label" htmlFor="displayName">
                이름
              </label>
              <input id="displayName" name="displayName" className="field" placeholder="예: 조유리" required />
            </div>
            <div className="w-40">
              <label className="label" htmlFor="slug">
                슬러그 (선택)
              </label>
              <input id="slug" name="slug" className="field" placeholder="자동 생성" />
            </div>
            <button type="submit" className="btn-primary">
              빌더 추가
            </button>
          </form>
        </CreatePanel>
      )}

      <FilterBar
        searchPlaceholder="이름 또는 슬러그로 검색"
        defaultQuery={q}
        statusOptions={STATUS_FILTER_OPTIONS}
        defaultStatus={status}
      />

      <div className="table-shell">
        <table className="w-full text-sm">
          <thead>
            <TableHeadRow
              labels={
                canManageAccounts
                  ? ['이름', '전문 분야', '상태', 'Insight 권한', '수정일', '계정']
                  : ['이름', '전문 분야', '상태', 'Insight 권한', '수정일']
              }
              centerColumns={canManageAccounts ? [2, 5] : [2]}
            />
          </thead>
          <tbody className="divide-y">
            {builders.map((builder) => (
              <tr key={builder.slug} className="transition-colors hover:bg-[var(--color-surface-sunken)]">
                <td className="px-5 py-4">
                  <Link href={`/builder/${encodeURIComponent(builder.slug)}`} className="font-medium hover:underline">
                    {builder.displayName}
                  </Link>
                  <p className="mt-0.5 font-mono text-xs" style={{ color: 'var(--color-ink-faint)' }}>
                    {builder.slug}
                  </p>
                </td>
                <td className="px-5 py-4" style={{ color: 'var(--color-ink-muted)' }}>
                  {builder.specialties.length > 0 ? builder.specialties.join(', ') : '—'}
                </td>
                <td className="px-5 py-4 text-center">
                  <BuilderStatusBadge status={builder.status} />
                </td>
                <td className="px-5 py-4" style={{ color: 'var(--color-ink-muted)' }}>
                  {[
                    builder.permissions.canWriteInsight && '작성',
                    builder.permissions.canEditInsight && '수정',
                    builder.permissions.canDeleteInsight && '삭제',
                  ]
                    .filter(Boolean)
                    .join(' · ') || '없음'}
                </td>
                <td className="px-5 py-4 tabular-nums" style={{ color: 'var(--color-ink-faint)' }}>
                  {builder.updatedAt.slice(0, 10)}
                </td>
                {canManageAccounts && (
                  <td className="px-5 py-4 text-center">
                    {(() => {
                      const linkedAccount = accountByBuilderId?.get(builder.id);
                      return linkedAccount ? (
                        <span className="inline-flex items-center gap-2">
                          <AccountStatusBadge status={linkedAccount.status} />
                          <Link
                            href={`/permissions/${encodeURIComponent(linkedAccount.slug)}`}
                            className="text-sm whitespace-nowrap"
                            style={{ color: 'var(--color-accent-soft-text)' }}
                          >
                            계정 보기
                          </Link>
                        </span>
                      ) : (
                        <Link
                          href={`/permissions?builder=${encodeURIComponent(builder.slug)}`}
                          className="text-sm whitespace-nowrap"
                          style={{ color: 'var(--color-accent-soft-text)' }}
                        >
                          계정 생성
                        </Link>
                      );
                    })()}
                  </td>
                )}
              </tr>
            ))}
            {builders.length === 0 && (
              <tr>
                <td colSpan={canManageAccounts ? 6 : 5}>
                  <EmptyState>
                    {allBuilders.length === 0 ? '아직 등록된 빌더가 없습니다. 위에서 추가해 보세요.' : '검색 조건에 맞는 빌더가 없습니다.'}
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
