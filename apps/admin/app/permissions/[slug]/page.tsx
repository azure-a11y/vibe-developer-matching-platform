import { notFound } from 'next/navigation';
import { getAdminAccountRepository } from '@orca/content';

import { saveAdminAccountAction } from '@/app/permissions/actions';
import { DetailNav } from '@/components/DetailNav';
import { PermissionMatrix } from '@/components/PermissionMatrix';
import { SaveButton } from '@/components/SaveButton';
import { Select } from '@/components/Select';
import { AccountStatusBadge, GradeBadge } from '@/components/StatusBadge';
import { requireMenuPermission } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

export default async function AdminAccountEditorPage({ params }: { params: Promise<{ slug: string }> }) {
  await requireMenuPermission('accountPermission', 'edit_approve');

  const { slug } = await params;
  const [account, { accounts: allAccounts }] = await Promise.all([
    getAdminAccountRepository().getBySlug(decodeURIComponent(slug)),
    getAdminAccountRepository().getAll(),
  ]);
  if (!account) notFound();

  // 목록과 동일한 정렬(이메일순) 기준으로 이전/다음을 찾는다.
  const currentIndex = allAccounts.findIndex((a) => a.slug === account.slug);
  const prevAccount = currentIndex > 0 ? allAccounts[currentIndex - 1] : undefined;
  const nextAccount = currentIndex >= 0 && currentIndex < allAccounts.length - 1 ? allAccounts[currentIndex + 1] : undefined;

  return (
    <form action={saveAdminAccountAction} className="max-w-2xl space-y-8">
      <input type="hidden" name="slug" value={account.slug} />

      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold tracking-tight">{account.name}</h1>
          <GradeBadge grade={account.grade} />
          <AccountStatusBadge status={account.status} />
        </div>
        <div className="flex items-center gap-6">
          <DetailNav
            listHref="/permissions"
            prev={prevAccount && { href: `/permissions/${encodeURIComponent(prevAccount.slug)}`, label: prevAccount.name }}
            next={nextAccount && { href: `/permissions/${encodeURIComponent(nextAccount.slug)}`, label: nextAccount.name }}
          />
          <SaveButton />
        </div>
      </header>

      <section className="card space-y-4">
        <h2 className="font-semibold">계정 정보</h2>
        <div>
          <span className="label">이메일</span>
          <p className="rounded-lg px-3 py-2 text-sm" style={{ background: 'var(--color-surface-sunken)', color: 'var(--color-ink-muted)' }}>
            {account.email}
          </p>
          <p className="mt-1 text-xs" style={{ color: 'var(--color-ink-faint)' }}>
            이메일은 변경할 수 없습니다 — 바꾸려면 새 계정을 만드세요.
          </p>
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
          <Select
            id="status"
            name="status"
            defaultValue={account.status}
            options={[
              { value: 'active', label: '활성' },
              { value: 'inactive', label: '비활성', description: '로그인 차단' },
            ]}
          />
        </div>
      </section>

      <section className="card space-y-3">
        <div>
          <h2 className="font-semibold">메뉴별 권한</h2>
          <p className="mt-1 text-xs" style={{ color: 'var(--color-ink-muted)' }}>
            전체 &gt; 편집·승인 &gt; 조회 &gt; 접근불가. 삭제는 전체 권한만 수행할 수 있습니다.
          </p>
        </div>
        <PermissionMatrix defaultValues={account.menuPermissions} />
      </section>
    </form>
  );
}
