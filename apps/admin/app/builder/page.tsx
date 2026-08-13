import Link from 'next/link';
import { getBuilderRepository } from '@orca/content';

import { createBuilderAction } from '@/app/builder/actions';
import { BuilderStatusBadge } from '@/components/StatusBadge';

export const dynamic = 'force-dynamic';

export default async function BuilderListPage() {
  const { builders, errors } = await getBuilderRepository().getAll();

  const counts = {
    total: builders.length,
    pending: builders.filter((b) => b.status === 'pending').length,
    active: builders.filter((b) => b.status === 'active').length,
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Builder</h1>
        <p className="mt-1 text-sm text-neutral-500">
          전체 {counts.total} · 검증 대기 {counts.pending} · 활성 {counts.active}
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

      <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-5 py-3 font-semibold">이름</th>
              <th className="px-5 py-3 font-semibold">전문 분야</th>
              <th className="px-5 py-3 font-semibold">상태</th>
              <th className="px-5 py-3 font-semibold">Insight 권한</th>
              <th className="px-5 py-3 font-semibold">수정일</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {builders.map((builder) => (
              <tr key={builder.slug} className="hover:bg-neutral-50">
                <td className="px-5 py-4">
                  <Link
                    href={`/builder/${encodeURIComponent(builder.slug)}`}
                    className="font-medium hover:text-[var(--color-accent)]"
                  >
                    {builder.displayName}
                  </Link>
                  <p className="mt-0.5 font-mono text-xs text-neutral-400">{builder.slug}</p>
                </td>
                <td className="px-5 py-4 text-neutral-600">
                  {builder.specialties.length > 0 ? builder.specialties.join(', ') : '—'}
                </td>
                <td className="px-5 py-4">
                  <BuilderStatusBadge status={builder.status} />
                </td>
                <td className="px-5 py-4 text-neutral-600">
                  {[
                    builder.permissions.canWriteInsight && '작성',
                    builder.permissions.canEditInsight && '수정',
                    builder.permissions.canDeleteInsight && '삭제',
                  ]
                    .filter(Boolean)
                    .join(' · ') || '없음'}
                </td>
                <td className="px-5 py-4 text-neutral-500 tabular-nums">{builder.updatedAt.slice(0, 10)}</td>
              </tr>
            ))}
            {builders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-neutral-500">
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
