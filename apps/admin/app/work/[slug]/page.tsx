import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBuilderRepository, getWorkRepository } from '@orca/content';

import { deleteWorkAction, saveWorkAction } from '@/app/work/actions';
import { Select } from '@/components/Select';
import { WorkStatusBadge } from '@/components/StatusBadge';
import { requireMenuPermission } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

const STATUS_OPTIONS = [
  { value: 'pending_review', label: '승인 대기', description: '기본값 — 공개 목록에 노출 안 됨' },
  { value: 'published', label: '공개', description: 'Work 목록에 노출' },
  { value: 'archived', label: '보관', description: '목록에서 제외' },
];

export default async function WorkEditorPage({ params }: { params: Promise<{ slug: string }> }) {
  await requireMenuPermission('work', 'view');

  const { slug } = await params;
  const [work, { builders }] = await Promise.all([
    getWorkRepository().getBySlug(decodeURIComponent(slug)),
    getBuilderRepository().getAll(),
  ]);
  if (!work) notFound();

  const selectedBuilders = new Set(work.builderIds);

  return (
    <form action={saveWorkAction} className="space-y-8">
      <input type="hidden" name="slug" value={work.slug} />

      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/work" className="text-sm text-neutral-500 hover:text-neutral-900">
            ← 목록
          </Link>
          <h1 className="text-xl font-bold tracking-tight">{work.title}</h1>
          <WorkStatusBadge status={work.status} />
        </div>
        <button type="submit" className="btn-primary">
          저장
        </button>
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

          <section className="card space-y-4">
            <h2 className="font-semibold">문제 · 해결 · 결과</h2>
            <div>
              <label className="label" htmlFor="problem">문제</label>
              <textarea id="problem" name="problem" rows={3} className="field" defaultValue={work.problem} />
            </div>
            <div>
              <label className="label" htmlFor="solution">해결 과정</label>
              <textarea id="solution" name="solution" rows={3} className="field" defaultValue={work.solution} />
            </div>
            <div>
              <label className="label" htmlFor="result">결과</label>
              <textarea id="result" name="result" rows={3} className="field" defaultValue={work.result} />
            </div>
          </section>

          <section className="card space-y-3">
            <div>
              <h2 className="font-semibold">참여 빌더</h2>
              <p className="mt-1 text-xs text-neutral-500">
                Builder 메뉴에 등록된 빌더 중에서 이 프로젝트에 참여한 사람을 선택합니다(N:M).
              </p>
            </div>
            {builders.length === 0 ? (
              <p className="text-sm text-neutral-500">
                아직 등록된 빌더가 없습니다.{' '}
                <Link href="/builder" className="text-[var(--color-accent)] hover:underline">
                  Builder에서 먼저 추가하세요.
                </Link>
              </p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {builders.map((builder) => (
                  <label
                    key={builder.slug}
                    className="flex items-center gap-2 rounded-lg border border-neutral-200 p-3 text-sm"
                  >
                    <input
                      type="checkbox"
                      name="builderIds"
                      value={builder.slug}
                      defaultChecked={selectedBuilders.has(builder.slug)}
                      className="size-4"
                    />
                    <span>{builder.displayName}</span>
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
              <p className="rounded-lg bg-neutral-50 px-3 py-2 font-mono text-xs break-all">{work.slug}</p>
            </div>
          </section>

          <section className="card space-y-3">
            <h2 className="font-semibold text-red-700">위험 구역</h2>
            <button
              type="submit"
              formAction={deleteWorkAction}
              className="btn w-full border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
            >
              이 Work 삭제
            </button>
          </section>
        </div>
      </div>
    </form>
  );
}
