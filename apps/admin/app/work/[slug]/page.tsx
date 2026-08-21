import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBuilderRepository, getWorkRepository } from '@orca/content';

import { deleteWorkAction, saveWorkAction } from '@/app/work/actions';
import { BuilderStatusBadge, WorkStatusBadge } from '@/components/StatusBadge';
import { DetailNav } from '@/components/DetailNav';
import { SubHeading } from '@/components/FormPrimitives';
import { SaveButton } from '@/components/SaveButton';
import { Select } from '@/components/Select';
import { hasPermission, requireContentPermission } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

const STATUS_OPTIONS = [
  { value: 'pending_review', label: '승인 대기', description: '기본값 — 공개 목록에 노출 안 됨' },
  { value: 'published', label: '공개', description: 'Work 목록에 노출' },
  { value: 'archived', label: '보관', description: '목록에서 제외' },
];

const CATEGORY_OPTIONS = [
  { value: 'aiax', label: 'AI · AX' },
  { value: 'commerce', label: 'Commerce' },
  { value: 'platform', label: 'Platform / SaaS · Admin' },
  { value: 'finance', label: 'Finance' },
];

export default async function WorkEditorPage({ params }: { params: Promise<{ slug: string }> }) {
  const account = await requireContentPermission('work', 'view');
  const canWrite = account.role === 'builder' || hasPermission(account.menuPermissions.work, 'edit_approve');
  const canDelete = hasPermission(account.menuPermissions.work, 'full');

  const { slug } = await params;
  const [work, { works: allWorks }, { builders }] = await Promise.all([
    getWorkRepository().getBySlug(decodeURIComponent(slug)),
    getWorkRepository().getAll(),
    getBuilderRepository().getAll(),
  ]);
  if (!work) notFound();
  if (account.role === 'builder' && work.ownerBuilderId !== account.builderId) notFound();

  // 목록과 동일한 정렬(수정일 최신순) 기준으로 이전/다음을 찾는다 — Work 목록에서 보이는 순서 그대로.
  const currentIndex = allWorks.findIndex((w) => w.slug === work.slug);
  const prevWork = currentIndex > 0 ? allWorks[currentIndex - 1] : undefined;
  const nextWork = currentIndex >= 0 && currentIndex < allWorks.length - 1 ? allWorks[currentIndex + 1] : undefined;

  const selectedBuilders = new Set(work.builderIds);

  return (
    <form action={saveWorkAction} className="space-y-8">
      <input type="hidden" name="slug" value={work.slug} />

      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold tracking-tight">{work.title}</h1>
          <WorkStatusBadge status={work.status} />
        </div>
        <div className="flex items-center gap-6">
          <DetailNav
            listHref="/work"
            prev={prevWork && { href: `/work/${encodeURIComponent(prevWork.slug)}`, label: prevWork.title }}
            next={nextWork && { href: `/work/${encodeURIComponent(nextWork.slug)}`, label: nextWork.title }}
          />
          {canWrite && <SaveButton />}
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="min-w-0 space-y-6">
          <section className="card space-y-4">
            <h2 className="font-semibold">프로젝트 개요</h2>
            <div>
              <label className="label" htmlFor="title">프로젝트명</label>
              <input id="title" name="title" className="field" defaultValue={work.title} />
            </div>
            <div>
              <label className="label" htmlFor="summary">요약</label>
              <textarea id="summary" name="summary" rows={2} className="field" defaultValue={work.summary} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="scope">수행 범위</label>
                <input id="scope" name="scope" className="field" defaultValue={work.scope} />
              </div>
              <div>
                <label className="label" htmlFor="builderRole">빌더 역할</label>
                <input id="builderRole" name="builderRole" className="field" defaultValue={work.builderRole} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="period">작업 기간</label>
                <input id="period" name="period" className="field" defaultValue={work.period} placeholder="2026.05–2026.06" />
              </div>
              <div>
                <label className="label" htmlFor="techStack">사용 기술 (쉼표 구분)</label>
                <input id="techStack" name="techStack" className="field" defaultValue={work.techStack.join(', ')} />
              </div>
            </div>
          </section>

          {/* apps/web(지홍님 1안) Work 목록 필터/카드 표기용 필드 — schema.ts §Work 확장 */}
          <section className="card space-y-4">
            <h2 className="font-semibold">Work 목록 표기</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="category">필터 카테고리</label>
                <Select id="category" name="category" defaultValue={work.category} options={CATEGORY_OPTIONS} />
              </div>
              <div>
                <label className="label" htmlFor="tag">카드 표시 태그</label>
                <input id="tag" name="tag" className="field" defaultValue={work.tag} placeholder="예: SaaS · Admin, O2O" />
              </div>
              <div>
                <label className="label" htmlFor="year">연도</label>
                <input id="year" name="year" className="field" defaultValue={work.year} placeholder="2026" />
              </div>
              <div>
                <label className="label" htmlFor="partner">파트너 표기</label>
                <input id="partner" name="partner" className="field" defaultValue={work.partner} placeholder="with 똑똑한개발자 · 빌더 조쉬" />
              </div>
            </div>
          </section>

          {/* 문제 → 해결 → 결과는 순서가 곧 서사다. 세로로 번호를 매겨 읽는
              순서를 시각적으로도 강제한다 — 세 필드가 나란한 카드가 아니라
              하나의 흐름으로 읽히게. */}
          <section className="card space-y-5">
            <h2 className="font-semibold">문제 · 해결 · 결과</h2>
            {[
              { n: '1', name: 'problem', label: '문제', value: work.problem, placeholder: '클라이언트가 겪던 문제 상황' },
              { n: '2', name: 'solution', label: '해결 과정', value: work.solution, placeholder: '어떻게 접근하고 무엇을 만들었는지' },
              { n: '3', name: 'result', label: '결과', value: work.result, placeholder: '수치·정성적 성과' },
            ].map((step, i, arr) => (
              <div key={step.name} className="flex gap-3">
                <div className="flex flex-col items-center pt-1">
                  <span
                    className="flex size-6 shrink-0 items-center justify-center rounded-full font-mono text-xs font-semibold"
                    style={{ background: 'var(--color-accent-soft)', color: 'var(--color-accent-soft-text)' }}
                  >
                    {step.n}
                  </span>
                  {i < arr.length - 1 && <span className="mt-1 w-px flex-1" style={{ background: 'var(--color-border)' }} />}
                </div>
                <div className="min-w-0 flex-1 pb-1">
                  <label className="label" htmlFor={step.name}>{step.label}</label>
                  <textarea
                    id={step.name}
                    name={step.name}
                    rows={3}
                    className="field"
                    defaultValue={step.value}
                    placeholder={step.placeholder}
                  />
                </div>
              </div>
            ))}
          </section>

          <section className="card space-y-3">
            <div>
              <h2 className="font-semibold">참여 빌더</h2>
              <p className="mt-1 text-xs" style={{ color: 'var(--color-ink-muted)' }}>
                Builder 메뉴에 등록된 빌더 중에서 이 프로젝트에 참여한 사람을 선택합니다(N:M).
              </p>
            </div>
            {builders.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--color-ink-muted)' }}>
                아직 등록된 빌더가 없습니다.{' '}
                <Link href="/builder" className="hover:underline" style={{ color: 'var(--color-accent-soft-text)' }}>
                  Builder에서 먼저 추가하세요.
                </Link>
              </p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {builders.map((builder) => (
                  <label
                    key={builder.slug}
                    className="flex items-center gap-2.5 rounded-lg border border-[var(--color-border)] p-3 text-sm transition-colors has-checked:border-[var(--color-accent)] has-checked:bg-[var(--color-accent-soft)]"
                  >
                    <input
                      type="checkbox"
                      name="builderIds"
                      value={builder.slug}
                      defaultChecked={selectedBuilders.has(builder.slug)}
                      className="size-4 accent-[var(--color-accent)]"
                    />
                    <span className="min-w-0 flex-1 truncate">{builder.displayName}</span>
                    <BuilderStatusBadge status={builder.status} />
                  </label>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="min-w-0 space-y-6">
          <section className="card space-y-4">
            <h2 className="font-semibold">상태</h2>
            <div>
              <label className="label" htmlFor="status">공개 상태</label>
              <Select id="status" name="status" defaultValue={work.status} options={STATUS_OPTIONS} />
            </div>
            <div>
              <span className="label">슬러그</span>
              <p className="rounded-lg px-3 py-2 font-mono text-xs break-all" style={{ background: 'var(--color-surface-sunken)', color: 'var(--color-ink-muted)' }}>
                {work.slug}
              </p>
            </div>
          </section>

          <section className="card space-y-3">
            <SubHeading>참여 빌더 요약</SubHeading>
            {work.builderIds.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--color-ink-faint)' }}>
                아직 선택된 빌더가 없습니다.
              </p>
            ) : (
              <ul className="space-y-1.5">
                {work.builderIds.map((id) => {
                  const b = builders.find((builder) => builder.slug === id);
                  return (
                    <li key={id} className="text-sm" style={{ color: 'var(--color-ink)' }}>
                      {b?.displayName ?? id}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {canDelete && (
            <section className="card space-y-3" style={{ borderColor: 'var(--color-danger-bg)' }}>
              <h2 className="font-semibold" style={{ color: 'var(--color-danger)' }}>위험 구역</h2>
              <button
                type="submit"
                formAction={deleteWorkAction}
                className="btn w-full"
                style={{ background: 'var(--color-danger-bg)', color: 'var(--color-danger)' }}
              >
                이 Work 삭제
              </button>
            </section>
          )}
        </div>
      </div>
    </form>
  );
}
