import { notFound } from 'next/navigation';
import { getBuilderRepository } from '@orca/content';

import { deleteBuilderAction, saveBuilderAction } from '@/app/builder/actions';
import { DetailNav } from '@/components/DetailNav';
import { CheckboxRow, SubHeading } from '@/components/FormPrimitives';
import { SaveButton } from '@/components/SaveButton';
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
  const [builder, { builders: allBuilders }] = await Promise.all([
    getBuilderRepository().getBySlug(decodeURIComponent(slug)),
    getBuilderRepository().getAll(),
  ]);
  if (!builder) notFound();

  // 목록과 동일한 정렬(수정일 최신순) 기준으로 이전/다음을 찾는다.
  const currentIndex = allBuilders.findIndex((b) => b.slug === builder.slug);
  const prevBuilder = currentIndex > 0 ? allBuilders[currentIndex - 1] : undefined;
  const nextBuilder = currentIndex >= 0 && currentIndex < allBuilders.length - 1 ? allBuilders[currentIndex + 1] : undefined;

  return (
    <form action={saveBuilderAction} className="space-y-8">
      <input type="hidden" name="slug" value={builder.slug} />

      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold tracking-tight">{builder.displayName}</h1>
          <BuilderStatusBadge status={builder.status} />
        </div>
        <div className="flex items-center gap-6">
          <DetailNav
            listHref="/builder"
            prev={prevBuilder && { href: `/builder/${encodeURIComponent(prevBuilder.slug)}`, label: prevBuilder.displayName }}
            next={nextBuilder && { href: `/builder/${encodeURIComponent(nextBuilder.slug)}`, label: nextBuilder.displayName }}
          />
          {canWrite && <SaveButton />}
        </div>
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

            <div className="grid gap-4 sm:grid-cols-2 pt-2" style={{ borderTop: '1px solid var(--color-border)' }}>
              <div>
                <label className="label" htmlFor="role">프로필 타이틀 (role)</label>
                <input id="role" name="role" className="field" defaultValue={builder.role} placeholder="프로덕트 빌더 · 기획+개발" />
              </div>
              <div>
                <label className="label" htmlFor="focus">전문 분야 한 줄 (focus)</label>
                <input id="focus" name="focus" className="field" defaultValue={builder.focus} placeholder="프로덕트 전체 · MVP · 검증" />
              </div>
            </div>

            <div className="space-y-4 pt-2" style={{ borderTop: '1px solid var(--color-border)' }}>
              <SubHeading>이력</SubHeading>
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
            </div>
          </section>

          <section className="card space-y-4">
            <div>
              <h2 className="font-semibold">아바타</h2>
              <p className="mt-1 text-xs" style={{ color: 'var(--color-ink-muted)' }}>
                본인 업로드만 허용됩니다 — 이미지 생성 금지(하드 룰 1).
              </p>
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

          <section className="card space-y-4">
            <div>
              <h2 className="font-semibold">일하는 원칙 (프로필 카드, 최대 3개)</h2>
              <p className="mt-1 text-xs" style={{ color: 'var(--color-ink-muted)' }}>
                제목·설명이 모두 채워진 항목만 apps/web 프로필 페이지에 노출됩니다.
              </p>
            </div>
            {[0, 1, 2].map((i) => {
              const p = builder.principles[i];
              return (
                <div className="grid gap-2 sm:grid-cols-[200px_1fr]" key={i}>
                  <input name={`principleTitle${i}`} className="field" defaultValue={p?.title ?? ''} placeholder={`원칙 ${i + 1} 제목`} />
                  <input name={`principleDesc${i}`} className="field" defaultValue={p?.description ?? ''} placeholder={`원칙 ${i + 1} 설명`} />
                </div>
              );
            })}
          </section>
        </div>

        <div className="min-w-0 space-y-6">
          <section className="card space-y-4">
            <h2 className="font-semibold">Work 목록 · 프로필 뱃지</h2>
            <div>
              <label className="label" htmlFor="badgeLabel">뱃지 텍스트</label>
              <input id="badgeLabel" name="badgeLabel" className="field" defaultValue={builder.badgeLabel} placeholder="✳ 이달의 빌더 / NEW" />
            </div>
            <CheckboxRow
              name="isLead"
              defaultChecked={builder.isLead}
              title="리드 스타일 뱃지"
              description="켜면 라임 색 '이달의 빌더' 스타일, 끄면 플레인 'NEW' 스타일로 표시됩니다."
            />
          </section>

          <section className="card space-y-4">
            <h2 className="font-semibold">상태</h2>
            <div>
              <label className="label" htmlFor="status">검증 상태</label>
              <Select id="status" name="status" defaultValue={builder.status} options={STATUS_OPTIONS} />
            </div>
            <div>
              <span className="label">슬러그</span>
              <p className="rounded-lg px-3 py-2 font-mono text-xs break-all" style={{ background: 'var(--color-surface-sunken)', color: 'var(--color-ink-muted)' }}>
                {builder.slug}
              </p>
            </div>
          </section>

          <section className="card space-y-3">
            <div>
              <h2 className="font-semibold">Insight 권한</h2>
              <p className="mt-1 text-xs" style={{ color: 'var(--color-ink-muted)' }}>
                기본값은 전부 비활성입니다. 업로드한 Work·Insight는 이 권한과 무관하게 항상 검수 대기로
                등록됩니다(정책정의 §3.3).
              </p>
            </div>
            <CheckboxRow
              name="permWriteInsight"
              defaultChecked={builder.permissions.canWriteInsight}
              title="Insight 작성"
              description="새 글 초안을 만들 수 있습니다."
            />
            <CheckboxRow
              name="permEditInsight"
              defaultChecked={builder.permissions.canEditInsight}
              title="Insight 수정"
              description="기존 글을 편집할 수 있습니다."
            />
            <CheckboxRow
              name="permDeleteInsight"
              defaultChecked={builder.permissions.canDeleteInsight}
              title="Insight 삭제"
              description="기본 비활성 권장."
            />
          </section>

          {canDelete && (
            <section className="card space-y-3" style={{ borderColor: 'var(--color-danger-bg)' }}>
              <h2 className="font-semibold" style={{ color: 'var(--color-danger)' }}>위험 구역</h2>
              <button
                type="submit"
                formAction={deleteBuilderAction}
                className="btn w-full"
                style={{ background: 'var(--color-danger-bg)', color: 'var(--color-danger)' }}
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
