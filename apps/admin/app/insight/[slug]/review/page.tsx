import Link from 'next/link';
import { notFound } from 'next/navigation';
import { auditPost, blogPostingJsonLd, faqJsonLd, getRepository } from '@orca/content';

import { saveReviewAction } from '@/app/actions';
import { DetailNav } from '@/components/DetailNav';
import { SaveButton } from '@/components/SaveButton';
import { Select } from '@/components/Select';
import { ScoreCircle, StatusBadge } from '@/components/StatusBadge';
import { hasPermission, requireAdminAccount } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

const CHECKLIST = [
  { name: 'checkFactual', label: '사실 확인 — 수치·인용·주장이 출처와 일치' },
  { name: 'checkTone', label: '톤앤매너 — wiki/03-content-guidelines.md 준수' },
  { name: 'checkSeo', label: 'SEO — 타이틀/메타/키워드/canonical 확인' },
  { name: 'checkGeo', label: 'GEO — 요약·FAQ·엔티티·인용 확인' },
  { name: 'checkImages', label: '이미지 — 출처가 codex-imagegen 또는 사람이 명시한 값' },
  { name: 'checkLinks', label: '링크 — 내부/외부 링크 동작 확인' },
] as const;

/* 상태 배지와 동일한 톤 체계 재사용 — error는 승인 대기와 같은 빨강, warn은 예약과 같은 검정, info는 보관·초안과 같은 회색. */
const SEVERITY_STYLE: Record<'error' | 'warn' | 'info', string> = {
  error: 'badge-pending',
  warn: 'badge-scheduled',
  info: 'badge-muted',
};

export default async function ReviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const account = await requireAdminAccount();
  const canWrite = hasPermission(account.menuPermissions.insight, 'edit_approve');

  const { slug } = await params;
  const [post, { posts: allPosts }] = await Promise.all([
    getRepository().getBySlug(decodeURIComponent(slug)),
    getRepository().getAll(),
  ]);
  if (!post) notFound();

  // 목록과 동일한 정렬(발행일·수정일 최신순) 기준으로 이전/다음을 찾는다.
  const currentIndex = allPosts.findIndex((p) => p.slug === post.slug);
  const prevPost = currentIndex > 0 ? allPosts[currentIndex - 1] : undefined;
  const nextPost = currentIndex >= 0 && currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : undefined;

  const audit = auditPost(post);
  const checks = post.review.checks;
  const faq = faqJsonLd(post);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold tracking-tight">검수: {post.title}</h1>
          <StatusBadge status={post.status} />
          <ScoreCircle score={audit.score} />
        </div>
        <div className="flex items-center gap-6">
          <DetailNav
            listHref="/insight"
            prev={prevPost && { href: `/insight/${encodeURIComponent(prevPost.slug)}/review`, label: prevPost.title }}
            next={nextPost && { href: `/insight/${encodeURIComponent(nextPost.slug)}/review`, label: nextPost.title }}
          />
          <Link href={`/insight/${encodeURIComponent(post.slug)}`} className="btn-secondary">
            편집으로
          </Link>
        </div>
      </header>

      {/* `min-w-0` is load-bearing: a grid item defaults to `min-width: auto`,
          so the JSON-LD <pre> below (single lines of 200+ chars) would stretch
          the 1fr track past the page container instead of scrolling itself. */}
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0 space-y-6">
          <section className="card space-y-3">
            <h2 className="font-semibold">자동 검사</h2>
            <p className="text-xs" style={{ color: 'var(--color-ink-muted)' }}>
              결정적 규칙 기반입니다. 사람과 <code className="font-mono">content-reviewer</code> 에이전트가 동일한
              결과를 봅니다.
            </p>
            {audit.issues.length === 0 ? (
              <p className="text-sm font-medium" style={{ color: 'var(--color-success)' }}>
                통과 — 발견된 문제 없음.
              </p>
            ) : (
              <ul className="space-y-2 text-sm">
                {audit.issues.map((issue) => (
                  <li key={`${issue.field}-${issue.message}`} className="flex gap-2">
                    <span className={`badge shrink-0 ${SEVERITY_STYLE[issue.severity]}`}>{issue.severity}</span>
                    <span style={{ color: 'var(--color-ink)' }}>
                      <code className="font-mono text-xs" style={{ color: 'var(--color-ink-faint)' }}>
                        {issue.field}
                      </code>{' '}
                      — {issue.message}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <p
              className="rounded-lg px-3 py-2 text-sm font-medium"
              style={{ background: 'var(--color-surface-sunken)', color: 'var(--color-ink)' }}
            >
              {audit.publishable ? '발행 가능 (error 없음)' : '발행 불가 — error를 먼저 해결하세요.'}
            </p>
          </section>

          <section className="card space-y-3">
            <h2 className="font-semibold">구조화 데이터 미리보기</h2>
            <pre className="max-h-72 max-w-full overflow-auto rounded-lg bg-neutral-900 p-4 text-xs text-neutral-100">
              {JSON.stringify(blogPostingJsonLd(post), null, 2)}
            </pre>
            {faq && (
              <pre className="max-h-72 max-w-full overflow-auto rounded-lg bg-neutral-900 p-4 text-xs text-neutral-100">
                {JSON.stringify(faq, null, 2)}
              </pre>
            )}
          </section>

          <section className="card space-y-3">
            <h2 className="font-semibold">본문 미리보기</h2>
            <pre
              className="max-h-96 max-w-full overflow-auto whitespace-pre-wrap break-words rounded-lg p-4 text-sm leading-6"
              style={{ background: 'var(--color-surface-sunken)' }}
            >
              {post.body}
            </pre>
          </section>
        </div>

        {canWrite ? (
          <form action={saveReviewAction} className="card h-fit min-w-0 space-y-5">
            <input type="hidden" name="slug" value={post.slug} />
            <h2 className="font-semibold">사람 검수</h2>

            <div className="space-y-2.5">
              {CHECKLIST.map((item) => (
                <label key={item.name} className="flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    name={item.name}
                    defaultChecked={checks[item.name.replace('check', '').toLowerCase() as keyof typeof checks]}
                    className="mt-0.5 size-4 shrink-0 accent-[var(--color-accent)]"
                  />
                  <span style={{ color: 'var(--color-ink)' }}>{item.label}</span>
                </label>
              ))}
            </div>

            <div>
              <label className="label" htmlFor="reviewer">검수자</label>
              <input id="reviewer" name="reviewer" className="field" defaultValue={post.review.reviewer ?? ''} />
            </div>

            <div>
              <label className="label" htmlFor="notes">메모</label>
              <textarea id="notes" name="notes" rows={4} className="field" defaultValue={post.review.notes ?? ''} />
            </div>

            <div>
              <label className="label" htmlFor="status">상태 변경</label>
              <Select
                id="status"
                name="status"
                defaultValue={post.status}
                options={[
                  { value: 'draft', label: '초안으로 되돌리기' },
                  { value: 'in_review', label: '검수 중' },
                  { value: 'scheduled', label: '예약' },
                  {
                    value: 'published',
                    label: '발행',
                    description: audit.publishable ? '공개 사이트에 노출' : 'error 해결 필요',
                    disabled: !audit.publishable,
                  },
                  { value: 'archived', label: '보관' },
                ]}
              />
            </div>

            {post.review.reviewedAt && (
              <p className="text-xs" style={{ color: 'var(--color-ink-faint)' }}>
                마지막 검수: {post.review.reviewedAt.slice(0, 16).replace('T', ' ')}
              </p>
            )}

            <SaveButton className="w-full">검수 저장</SaveButton>
          </form>
        ) : (
          <section className="card h-fit min-w-0 space-y-3">
            <h2 className="font-semibold">사람 검수</h2>
            <p className="text-xs" style={{ color: 'var(--color-ink-muted)' }}>
              조회 권한만 있어 검수 결과를 편집할 수 없습니다.
            </p>
            <p className="text-sm">
              검수자: <span style={{ color: 'var(--color-ink)' }}>{post.review.reviewer || '—'}</span>
            </p>
            <p className="text-sm whitespace-pre-wrap">
              메모: <span style={{ color: 'var(--color-ink)' }}>{post.review.notes || '—'}</span>
            </p>
            {post.review.reviewedAt && (
              <p className="text-xs" style={{ color: 'var(--color-ink-faint)' }}>
                마지막 검수: {post.review.reviewedAt.slice(0, 16).replace('T', ' ')}
              </p>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
