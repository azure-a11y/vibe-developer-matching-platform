import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBuilderRepository } from '@orca/content';

import { deleteBuilderAction, saveBuilderAction } from '@/app/builder/actions';
import { Select } from '@/components/Select';
import { BuilderStatusBadge } from '@/components/StatusBadge';
import { hasPermission, requireMenuPermission } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

const STATUS_OPTIONS = [
  { value: 'pending', label: '검증 대기', description: '기본값 — 신규 등록' },
  { value: 'active', label: '활성', description: '공개 사이트에 노출 가능' },
  { value: 'inactive', label: '비활성', description: '목록에서 제외' },
];

export default async function BuilderEditorPage({ params }: { params: Promise<{ slug: string }> }) {
  const account = await requireMenuPermission('builder', 'view');
  const canWrite = hasPermission(account.menuPermissions.builder, 'edit_approve');
  const canDelete = hasPermission(account.menuPermissions.builder, 'full');

  const { slug } = await params;
  const builder = await getBuilderRepository().getBySlug(decodeURIComponent(slug));
  if (!builder) notFound();

  return (
    <form action={saveBuilderAction} className="space-y-8">
      <input type="hidden" name="slug" value={builder.slug} />

      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/builder" className="text-sm text-neutral-500 hover:text-neutral-900">
            ← 목록
          </Link>
          <h1 className="text-xl font-bold tracking-tight">{builder.displayName}</h1>
          <BuilderStatusBadge status={builder.status} />
        </div>
        {canWrite && (
          <button type="submit" className="btn-primary">
            저장
          </button>
        )}
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="min-w-0 space-y-6">
          <section className="card space-y-4">
            <h2 className="font-semibold">프로필</h2>
            <div>
              <label className="label" htmlFor="displayName">이름</label>
              <input id="displayName" name="displayName" className="field" defaultValue={builder.displayName} />
            </div>
            <div>
              <label className="label" htmlFor="bio">소개</label>
              <textarea id="bio" name="bio" rows={6} className="field" defaultValue={builder.bio} placeholder="일하는 방식 한 줄 요약, 경력 등" />
            </div>
            <div>
              <label className="label" htmlFor="specialties">전문 분야 (쉼표 구분)</label>
              <input id="specialties" name="specialties" className="field" defaultValue={builder.specialties.join(', ')} />
            </div>
            <div>
              <label className="label" htmlFor="education">교육 이력 (쉼표 구분)</label>
              <input id="education" name="education" className="field" defaultValue={builder.education.join(', ')} />
            </div>
            <div>
              <label className="label" htmlFor="communityActivity">커뮤니티 활동 (쉼표 구분)</label>
              <input
                id="communityActivity"
                name="communityActivity"
                className="field"
                defaultValue={builder.communityActivity.join(', ')}
              />
            </div>
            <div>
              <label className="label" htmlFor="verifications">검증 정보 (쉼표 구분)</label>
              <input id="verifications" name="verifications" className="field" defaultValue={builder.verifications.join(', ')} />
            </div>
          </section>

          <section className="card space-y-4">
            <div>
              <h2 className="font-semibold">아바타</h2>
              <p className="mt-1 text-xs text-neutral-500">본인 업로드만 허용됩니다 — 이미지 생성 금지(하드 룰 1).</p>
            </div>
            <div>
              <label className="label" htmlFor="avatarSrc">경로</label>
              <input id="avatarSrc" name="avatarSrc" className="field" defaultValue={builder.avatar?.src ?? ''} placeholder="/images/builders/jo-yuri.png" />
            </div>
            <div>
              <label className="label" htmlFor="avatarAlt">대체 텍스트</label>
              <input id="avatarAlt" name="avatarAlt" className="field" defaultValue={builder.avatar?.alt ?? ''} />
            </div>
            <div>
              <label className="label" htmlFor="avatarSource">출처</label>
              <Select
                id="avatarSource"
                name="avatarSource"
                defaultValue={builder.avatar?.source ?? 'user-upload'}
                options={[
                  { value: 'user-upload', label: '사용자 업로드', description: '본인 또는 관리자가 첨부' },
                  { value: 'web-search', label: '웹 검색', description: '라이선스 기록 필수' },
                  { value: 'none', label: '없음' },
                ]}
              />
            </div>
          </section>
        </div>

        <div className="min-w-0 space-y-6">
          <section className="card space-y-4">
            <h2 className="font-semibold">상태</h2>
            <div>
              <label className="label" htmlFor="status">검증 상태</label>
              <Select id="status" name="status" defaultValue={builder.status} options={STATUS_OPTIONS} />
            </div>
            <div>
              <span className="label">슬러그</span>
              <p className="rounded-lg bg-neutral-50 px-3 py-2 font-mono text-xs break-all">{builder.slug}</p>
            </div>
          </section>

          <section className="card space-y-3">
            <div>
              <h2 className="font-semibold">Insight 권한</h2>
              <p className="mt-1 text-xs text-neutral-500">
                기본값은 전부 비활성입니다. 업로드한 Work·Insight는 이 권한과 무관하게 항상 검수 대기로
                등록됩니다(정책정의 §3.3).
              </p>
            </div>
            <label className="flex items-start gap-2 rounded-lg border border-neutral-200 p-3 text-sm">
              <input
                type="checkbox"
                name="permWriteInsight"
                defaultChecked={builder.permissions.canWriteInsight}
                className="mt-0.5 size-4"
              />
              <span>Insight 작성</span>
            </label>
            <label className="flex items-start gap-2 rounded-lg border border-neutral-200 p-3 text-sm">
              <input
                type="checkbox"
                name="permEditInsight"
                defaultChecked={builder.permissions.canEditInsight}
                className="mt-0.5 size-4"
              />
              <span>Insight 수정</span>
            </label>
            <label className="flex items-start gap-2 rounded-lg border border-neutral-200 p-3 text-sm">
              <input
                type="checkbox"
                name="permDeleteInsight"
                defaultChecked={builder.permissions.canDeleteInsight}
                className="mt-0.5 size-4"
              />
              <span>
                Insight 삭제 <span className="block text-xs text-neutral-400">기본 비활성 권장</span>
              </span>
            </label>
          </section>

          {canDelete && (
            <section className="card space-y-3">
              <h2 className="font-semibold text-red-700">위험 구역</h2>
              <button
                type="submit"
                formAction={deleteBuilderAction}
                className="btn w-full border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
              >
                이 빌더 삭제
              </button>
            </section>
          )}
        </div>
      </div>
    </form>
  );
}
