import Link from 'next/link';
import { getBuilderRepository } from '@orca/content';

import { createBuilderAction } from '@/app/builder/actions';
import { TableHeadRow } from '@/components/AdminTable';
import { BuilderStatusBadge } from '@/components/StatusBadge';
import { hasPermission, requireMenuPermission } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

export default async function BuilderListPage() {
  const account = await requireMenuPermission('builder', 'view');
  const canWrite = hasPermission(account.menuPermissions.builder, 'edit_approve');

  const { builders, errors } = await getBuilderRepository().getAll();

  const counts = {
    total: builders.length,
    pending: builders.filter((b) => b.status === 'pending').length,
    active: builders.filter((b) => b.status === 'active').length,
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Builder</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-ink-muted)' }}>
          전체 {counts.total} · 검증 대기 {counts.pending} · 활성 {counts.active}
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
        <form action={createBuilderAction} className="card flex flex-wrap items-end gap-3">
          <div className="min-w-64 flex-1">
            <label className="label" htmlFor="displayName">
              이름
            </label>
            <input id="displayName" name="displayName" className="field" placeholder="예: 조유리" required />
          </div>
          <div className="w-48">
            <label className="label" htmlFor="slug">
              슬러그 (선택)
            </label>
            <input id="slug" name="slug" className="field" placeholder="자동 생성" />
          </div>
          <button type="submit" className="btn-primary">
            빌더 추가
          </button>
        </form>
      )}

      <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
        <table className="w-full text-sm">
          <thead>
            <TableHeadRow labels={['이름', '전문 분야', '상태', 'Insight 권한', '수정일']} />
          </thead>
          <tbody className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
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
                <td className="px-5 py-4">
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
              </tr>
            ))}
            {builders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-sm" style={{ color: 'var(--color-ink-muted)' }}>
                  아직 등록된 빌더가 없습니다. 위에서 추가해 보세요.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
