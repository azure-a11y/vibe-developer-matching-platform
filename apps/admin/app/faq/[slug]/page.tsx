import { notFound } from 'next/navigation';
import { getFaqCategoryRepository, getFaqRepository } from '@orca/content';

import { deleteFaqAction, saveFaqAction } from '@/app/faq/actions';
import { DetailNav } from '@/components/DetailNav';
import { SaveButton } from '@/components/SaveButton';
import { Select } from '@/components/Select';
import { FaqStatusBadge } from '@/components/StatusBadge';
import { hasPermission, requireMenuPermission } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

const STATUS_OPTIONS = [
  { value: 'archived', label: '보관', description: '관리자에게만 보입니다' },
  { value: 'published', label: '공개', description: '공개 사이트 FAQ에 노출됩니다' },
];

export default async function FaqEditorPage({ params }: { params: Promise<{ slug: string }> }) {
  const account = await requireMenuPermission('faq', 'view');
  const canWrite = hasPermission(account.menuPermissions.faq, 'edit_approve');
  const canDelete = hasPermission(account.menuPermissions.faq, 'full');

  const { slug } = await params;
  const [faq, { faqs: allFaqs }, { categories }] = await Promise.all([
    getFaqRepository().getBySlug(decodeURIComponent(slug)),
    getFaqRepository().getAll(),
    getFaqCategoryRepository().getAll(),
  ]);
  if (!faq) notFound();

  // 목록과 동일한 정렬(카테고리 내 순서) 기준으로 이전/다음을 찾는다.
  const currentIndex = allFaqs.findIndex((f) => f.slug === faq.slug);
  const prevFaq = currentIndex > 0 ? allFaqs[currentIndex - 1] : undefined;
  const nextFaq = currentIndex >= 0 && currentIndex < allFaqs.length - 1 ? allFaqs[currentIndex + 1] : undefined;

  const categoryOptions = categories.map((c) => ({ value: c.slug, label: c.isActive ? c.name : `${c.name} (비활성)` }));

  return (
    <form action={saveFaqAction} className="space-y-8">
      <input type="hidden" name="slug" value={faq.slug} />

      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold tracking-tight">{faq.question}</h1>
          <FaqStatusBadge status={faq.status} />
        </div>
        <div className="flex items-center gap-6">
          <DetailNav
            listHref="/faq"
            prev={prevFaq && { href: `/faq/${encodeURIComponent(prevFaq.slug)}`, label: prevFaq.question }}
            next={nextFaq && { href: `/faq/${encodeURIComponent(nextFaq.slug)}`, label: nextFaq.question }}
          />
          {canWrite && <SaveButton />}
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-6">
          <section className="card space-y-4">
            <h2 className="font-semibold">질문 · 답변</h2>
            <div>
              <label className="label" htmlFor="question">
                질문
              </label>
              <input id="question" name="question" className="field" defaultValue={faq.question} />
            </div>
            <div>
              <label className="label" htmlFor="answer">
                답변
              </label>
              <textarea id="answer" name="answer" rows={8} className="field" defaultValue={faq.answer} />
            </div>
          </section>
        </div>

        <div className="min-w-0 space-y-6">
          <section className="card space-y-4">
            <h2 className="font-semibold">분류 · 정렬</h2>
            <div>
              <label className="label" htmlFor="categoryId">
                카테고리
              </label>
              <Select id="categoryId" name="categoryId" defaultValue={faq.categoryId} options={categoryOptions} />
            </div>
            <div>
              <label className="label" htmlFor="order">
                카테고리 내 정렬 순서 (낮을수록 먼저)
              </label>
              <input id="order" name="order" type="number" className="field" defaultValue={faq.order} />
            </div>
          </section>

          <section className="card space-y-4">
            <h2 className="font-semibold">상태</h2>
            <div>
              <label className="label" htmlFor="status">
                공개 상태
              </label>
              <Select id="status" name="status" defaultValue={faq.status} options={STATUS_OPTIONS} />
            </div>
            <div>
              <span className="label">슬러그</span>
              <p className="rounded-lg px-3 py-2 font-mono text-xs break-all" style={{ background: 'var(--color-surface-sunken)', color: 'var(--color-ink-muted)' }}>
                {faq.slug}
              </p>
            </div>
          </section>

          {canDelete && (
            <section className="card space-y-3" style={{ borderColor: 'var(--color-danger-bg)' }}>
              <h2 className="font-semibold" style={{ color: 'var(--color-danger)' }}>
                위험 구역
              </h2>
              <button
                type="submit"
                formAction={deleteFaqAction}
                className="btn w-full"
                style={{ background: 'var(--color-danger-bg)', color: 'var(--color-danger)' }}
              >
                이 FAQ 삭제
              </button>
            </section>
          )}
        </div>
      </div>
    </form>
  );
}
