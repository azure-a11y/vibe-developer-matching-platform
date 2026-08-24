import Link from 'next/link';
import { getAdminAccountRepository, getBuilderRepository } from '@orca/content';
import type { AdminAccount, AdminAccountStatus } from '@orca/content';

import { createAdminAccountAction, createBuilderAccountAction } from '@/app/permissions/actions';
import { TableHeadRow } from '@/components/AdminTable';
import { EmptyState } from '@/components/EmptyState';
import { CreatePanel, FilterBar } from '@/components/FilterBar';
import { PageHeader } from '@/components/PageHeader';
import { PermissionMatrix } from '@/components/PermissionMatrix';
import { Select } from '@/components/Select';
import { AccountStatusBadge, GradeBadge } from '@/components/StatusBadge';
import { hasPermission, requireMenuPermission } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: '전체 상태' },
  { value: 'active', label: '활성' },
  { value: 'inactive', label: '비활성' },
];

function AccountTable({
  title,
  description,
  accounts,
  canManage,
  emptyMessage,
  builderNameById,
}: {
  title: string;
  description: string;
  accounts: AdminAccount[];
  canManage: boolean;
  emptyMessage: string;
  builderNameById?: Map<string, string>;
}) {
  const showBuilderColumn = Boolean(builderNameById);
  const labels = showBuilderColumn
    ? ['이름', '이메일', '연결된 빌더', '등급', '상태']
    : ['이름', '이메일', '등급', '상태'];
  const centerColumns = showBuilderColumn ? [3, 4] : [2, 3];

  return (
    <section className="space-y-3">
      <div>
        <h2 className="font-semibold">{title}</h2>
        <p className="mt-0.5 text-xs" style={{ color: 'var(--color-ink-muted)' }}>
          {description}
        </p>
      </div>
      <div className="table-shell">
        <table className="w-full text-sm">
          <thead>
            <TableHeadRow labels={labels} actionsColumn centerColumns={centerColumns} />
          </thead>
          <tbody className="divide-y">
            {accounts.map((a) => (
              <tr key={a.slug} className="transition-colors hover:bg-[var(--color-surface-sunken)]">
                <td className="px-5 py-4 font-medium">{a.name}</td>
                <td className="px-5 py-4" style={{ color: 'var(--color-ink-muted)' }}>{a.email}</td>
                {showBuilderColumn && (
                  <td className="px-5 py-4 text-center" style={{ color: 'var(--color-ink-muted)' }}>
                    {(a.builderId && builderNameById?.get(a.builderId)) ?? '—'}
                  </td>
                )}
                <td className="px-5 py-4 text-center">
                  <GradeBadge grade={a.grade} />
                </td>
                <td className="px-5 py-4 text-center">
                  <AccountStatusBadge status={a.status} />
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-right">
                  {canManage && (
                    <Link href={`/permissions/${encodeURIComponent(a.slug)}`} className="text-sm" style={{ color: 'var(--color-accent-soft-text)' }}>
                      편집
                    </Link>
                  )}
                </td>
              </tr>
            ))}
            {accounts.length === 0 && (
              <tr>
                <td colSpan={labels.length + 1}>
                  <EmptyState>{emptyMessage}</EmptyState>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default async function PermissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; error?: string; builder?: string }>;
}) {
  const account = await requireMenuPermission('accountPermission', 'view');
  const canManage = hasPermission(account.menuPermissions.accountPermission, 'edit_approve');

  const { q = '', status = 'all', error: createError, builder: builderParam = '' } = await searchParams;
  const { accounts: allAccounts, errors } = await getAdminAccountRepository().getAll();
  const { builders: allBuilders } = canManage ? await getBuilderRepository().getAll() : { builders: [] };

  const builderNameBySlug = new Map(allBuilders.map((b) => [b.slug, b.displayName]));
  const builderNameById = new Map(allBuilders.map((b) => [b.id, b.displayName]));
  const linkedBuilderIds = new Set(allAccounts.filter((a) => a.builderId).map((a) => a.builderId));
  const availableBuilders = allBuilders.filter((b) => !linkedBuilderIds.has(b.id));
  const preselectedBuilder = availableBuilders.find((b) => b.slug === builderParam);

  const query = q.trim().toLowerCase();
  const accounts = allAccounts.filter((a) => {
    const matchesQuery =
      query.length === 0 || a.name.toLowerCase().includes(query) || a.email.toLowerCase().includes(query);
    const matchesStatus = status === 'all' || a.status === (status as AdminAccountStatus);
    return matchesQuery && matchesStatus;
  });
  const adminAccounts = accounts.filter((a) => a.role === 'admin');
  const builderAccounts = accounts.filter((a) => a.role === 'builder');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Accounts & Permissions"
        description="등급 이름·범위는 아직 클라이언트 확인 전입니다(04_정책정의.md §4.5) — 등급은 표시용 자유 텍스트일 뿐, 실제 접근 권한은 메뉴별 권한 표로만 결정됩니다."
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

      <FilterBar
        searchPlaceholder="이름 또는 이메일로 검색"
        defaultQuery={q}
        statusOptions={STATUS_FILTER_OPTIONS}
        defaultStatus={status}
      />

      {canManage && (
        <div className="flex flex-col gap-3">
          <CreatePanel label="+ 빌더 계정 생성" defaultOpen={Boolean(preselectedBuilder)}>
            {createError && (
              <p
                className="mb-4 rounded-lg px-3 py-2 text-sm"
                style={{ background: 'var(--color-danger-bg)', color: 'var(--color-danger)' }}
              >
                {createError}
              </p>
            )}
            {availableBuilders.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--color-ink-muted)' }}>
                계정을 연결할 수 있는 빌더가 없습니다 — 모든 빌더에 이미 계정이 연결되어 있거나, 등록된 빌더가 없습니다.
              </p>
            ) : (
              <form action={createBuilderAccountAction} className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="builderId">연결할 빌더</label>
                  <Select
                    id="builderId"
                    name="builderId"
                    defaultValue={preselectedBuilder?.id}
                    placeholder="빌더 선택"
                    options={availableBuilders.map((b) => ({ value: b.id, label: `${b.displayName} (${b.slug})` }))}
                  />
                </div>
                <div>
                  <label className="label" htmlFor="builder-name">이름</label>
                  <input
                    id="builder-name"
                    name="name"
                    className="field"
                    defaultValue={preselectedBuilder?.displayName ?? builderNameBySlug.get(builderParam) ?? ''}
                    required
                  />
                </div>
                <div>
                  <label className="label" htmlFor="builder-email">이메일</label>
                  <input id="builder-email" name="email" type="email" className="field" required />
                </div>
                <div>
                  <label className="label" htmlFor="builder-password">초기 비밀번호</label>
                  <input id="builder-password" name="password" type="password" className="field" required minLength={8} />
                </div>
                <div className="sm:col-span-2">
                  <button type="submit" className="btn-primary">
                    빌더 계정 생성
                  </button>
                </div>
              </form>
            )}
          </CreatePanel>

          <CreatePanel label="+ 관리자 계정 생성">
            <form action={createAdminAccountAction} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="label" htmlFor="email">이메일</label>
                  <input id="email" name="email" type="email" className="field" required />
                </div>
                <div>
                  <label className="label" htmlFor="name">이름</label>
                  <input id="name" name="name" className="field" required />
                </div>
                <div>
                  <label className="label" htmlFor="password">초기 비밀번호</label>
                  <input id="password" name="password" type="password" className="field" required minLength={8} />
                </div>
              </div>
              <div>
                <label className="label" htmlFor="grade">등급 (표시용, 자유 텍스트)</label>
                <input id="grade" name="grade" className="field max-w-xs" placeholder="예: 콘텐츠 관리자" />
              </div>
              <div>
                <p className="label mb-2">메뉴별 권한</p>
                <PermissionMatrix />
              </div>
              <button type="submit" className="btn-primary">
                계정 생성
              </button>
            </form>
          </CreatePanel>
        </div>
      )}

      <AccountTable
        title="관리자 계정"
        description="메뉴별 권한 표로 접근 범위가 결정되는 내부 운영 계정입니다."
        accounts={adminAccounts}
        canManage={canManage}
        emptyMessage={allAccounts.length === 0 ? '아직 등록된 관리자 계정이 없습니다.' : '검색 조건에 맞는 관리자 계정이 없습니다.'}
      />

      <AccountTable
        title="빌더 계정"
        description="Builder 1명당 계정 1개 — 본인 Builder·Work·Insight만 접근할 수 있습니다."
        accounts={builderAccounts}
        canManage={canManage}
        emptyMessage="아직 연결된 빌더 계정이 없습니다."
        builderNameById={builderNameById}
      />
    </div>
  );
}
