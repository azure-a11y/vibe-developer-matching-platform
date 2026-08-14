import Link from 'next/link';
import { getAdminAccountRepository } from '@orca/content';

import { createAdminAccountAction } from '@/app/permissions/actions';
import { hasPermission, requireMenuPermission } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

const MENU_LABELS = [
  ['dashboard', 'Dashboard'],
  ['builder', 'Builder'],
  ['work', 'Work'],
  ['insight', 'Insight'],
  ['inquiry', 'Inquiry'],
  ['settings', 'Settings'],
  ['accountPermission', '계정·권한'],
] as const;

const PERMISSION_OPTIONS = [
  { value: 'none', label: '접근불가' },
  { value: 'view', label: '조회' },
  { value: 'edit_approve', label: '편집·승인' },
  { value: 'full', label: '전체' },
];

export default async function PermissionsPage() {
  const account = await requireMenuPermission('accountPermission', 'view');
  const canManage = hasPermission(account.menuPermissions.accountPermission, 'edit_approve');

  const { accounts, errors } = await getAdminAccountRepository().getAll();

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">계정 · 권한</h1>
        <p className="mt-1 text-sm text-neutral-500">
          등급 이름·범위는 아직 클라이언트 확인 전입니다(04_정책정의.md §4.5) — 등급은 표시용 자유
          텍스트일 뿐, 실제 접근 권한은 아래 메뉴별 값으로만 결정됩니다.
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

      {canManage && (
        <form action={createAdminAccountAction} className="card space-y-4">
          <h2 className="font-semibold">관리자 계정 생성</h2>
          <div className="grid gap-3 sm:grid-cols-3">
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
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {MENU_LABELS.map(([key, label]) => (
                <div key={key} className="flex items-center justify-between gap-2 rounded-lg border border-neutral-200 p-2.5">
                  <span className="text-sm">{label}</span>
                  <select
                    name={`perm_${key}`}
                    defaultValue={key === 'dashboard' ? 'view' : 'none'}
                    className="rounded border border-neutral-300 px-2 py-1 text-xs"
                  >
                    {PERMISSION_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
          <button type="submit" className="btn-primary">
            계정 생성
          </button>
        </form>
      )}

      <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-5 py-3 font-semibold">이름</th>
              <th className="px-5 py-3 font-semibold">이메일</th>
              <th className="px-5 py-3 font-semibold">등급</th>
              <th className="px-5 py-3 font-semibold">상태</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {accounts.map((a) => (
              <tr key={a.slug} className="hover:bg-neutral-50">
                <td className="px-5 py-4 font-medium">{a.name}</td>
                <td className="px-5 py-4 text-neutral-600">{a.email}</td>
                <td className="px-5 py-4 text-neutral-600">{a.grade}</td>
                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      a.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-200 text-neutral-500'
                    }`}
                  >
                    {a.status === 'active' ? '활성' : '비활성'}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  {canManage && (
                    <Link href={`/permissions/${encodeURIComponent(a.slug)}`} className="text-[var(--color-accent)] hover:underline">
                      편집
                    </Link>
                  )}
                </td>
              </tr>
            ))}
            {accounts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-neutral-500">
                  아직 등록된 관리자 계정이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
