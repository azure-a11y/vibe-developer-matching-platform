import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAdminAccountRepository } from '@orca/content';

import { saveAdminAccountAction } from '@/app/permissions/actions';
import { requireMenuPermission } from '@/lib/permissions';

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

export default async function AdminAccountEditorPage({ params }: { params: Promise<{ slug: string }> }) {
  await requireMenuPermission('accountPermission', 'edit_approve');

  const { slug } = await params;
  const account = await getAdminAccountRepository().getBySlug(decodeURIComponent(slug));
  if (!account) notFound();

  return (
    <form action={saveAdminAccountAction} className="max-w-2xl space-y-8">
      <input type="hidden" name="slug" value={account.slug} />

      <header className="flex items-center gap-3">
        <Link href="/permissions" className="text-sm text-neutral-500 hover:text-neutral-900">
          ← 목록
        </Link>
        <h1 className="text-xl font-bold tracking-tight">{account.name}</h1>
      </header>

      <section className="card space-y-4">
        <h2 className="font-semibold">계정 정보</h2>
        <div>
          <span className="label">이메일</span>
          <p className="rounded-lg bg-neutral-50 px-3 py-2 text-sm">{account.email}</p>
          <p className="mt-1 text-xs text-neutral-500">이메일은 변경할 수 없습니다 — 바꾸려면 새 계정을 만드세요.</p>
        </div>
        <div>
          <label className="label" htmlFor="name">이름</label>
          <input id="name" name="name" className="field" defaultValue={account.name} />
        </div>
        <div>
          <label className="label" htmlFor="grade">등급 (표시용, 자유 텍스트)</label>
          <input id="grade" name="grade" className="field max-w-xs" defaultValue={account.grade} />
        </div>
        <div>
          <label className="label" htmlFor="status">상태</label>
          <select id="status" name="status" defaultValue={account.status} className="field max-w-xs">
            <option value="active">활성</option>
            <option value="inactive">비활성 — 로그인 차단</option>
          </select>
        </div>
      </section>

      <section className="card space-y-3">
        <div>
          <h2 className="font-semibold">메뉴별 권한</h2>
          <p className="mt-1 text-xs text-neutral-500">
            전체 &gt; 편집·승인 &gt; 조회 &gt; 접근불가. 삭제는 전체 권한만 수행할 수 있습니다.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {MENU_LABELS.map(([key, label]) => (
            <div key={key} className="flex items-center justify-between gap-2 rounded-lg border border-neutral-200 p-3">
              <span className="text-sm">{label}</span>
              <select
                name={`perm_${key}`}
                defaultValue={account.menuPermissions[key]}
                className="rounded border border-neutral-300 px-2 py-1 text-sm"
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
      </section>

      <button type="submit" className="btn-primary">
        저장
      </button>
    </form>
  );
}
