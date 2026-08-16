import Link from 'next/link';
import { getAdminAccountRepository } from '@orca/content';
import type { AdminAccountStatus } from '@orca/content';

import { createAdminAccountAction } from '@/app/permissions/actions';
import { TableHeadRow } from '@/components/AdminTable';
import { EmptyState } from '@/components/EmptyState';
import { FilterBar } from '@/components/FilterBar';
import { PageHeader } from '@/components/PageHeader';
import { PermissionMatrix } from '@/components/PermissionMatrix';
import { AccountStatusBadge, GradeBadge } from '@/components/StatusBadge';
import { hasPermission, requireMenuPermission } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: '전체 상태' },
  { value: 'active', label: '활성' },
  { value: 'inactive', label: '비활성' },
];

export default async function PermissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const account = await requireMenuPermission('accountPermission', 'view');
  const canManage = hasPermission(account.menuPermissions.accountPermission, 'edit_approve');

  const { q = '', status = 'all' } = await searchParams;
  const { accounts: allAccounts, errors } = await getAdminAccountRepository().getAll();

  const query = q.trim().toLowerCase();
  const accounts = allAccounts.filter((a) => {
    const matchesQuery =
      query.length === 0 || a.name.toLowerCase().includes(query) || a.email.toLowerCase().includes(query);
    const matchesStatus = status === 'all' || a.status === (status as AdminAccountStatus);
    return matchesQuery && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="계정 · 권한"
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
        <form action={createAdminAccountAction} className="card space-y-5">
          <h2 className="font-semibold">관리자 계정 생성</h2>
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
      )}

      <div className="overflow-x-auto rounded-lg" style={{ border: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
        <table className="w-full text-sm">
          <thead>
            <TableHeadRow labels={['이름', '이메일', '등급', '상태']} actionsColumn />
          </thead>
          <tbody className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
            {accounts.map((a) => (
              <tr key={a.slug} className="transition-colors hover:bg-[var(--color-surface-sunken)]">
                <td className="px-5 py-4 font-medium">{a.name}</td>
                <td className="px-5 py-4" style={{ color: 'var(--color-ink-muted)' }}>{a.email}</td>
                <td className="px-5 py-4">
                  <GradeBadge grade={a.grade} />
                </td>
                <td className="px-5 py-4">
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
                <td colSpan={5}>
                  <EmptyState>
                    {allAccounts.length === 0 ? '아직 등록된 관리자 계정이 없습니다.' : '검색 조건에 맞는 계정이 없습니다.'}
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
