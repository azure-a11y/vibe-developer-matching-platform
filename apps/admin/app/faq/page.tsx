import Link from 'next/link';
import { getFaqCategoryRepository, getFaqRepository } from '@orca/content';
import type { FaqStatus } from '@orca/content';

import { createFaqAction } from '@/app/faq/actions';
import { CategoryManager } from '@/app/faq/CategoryManager';
import { TableHeadRow } from '@/components/AdminTable';
import { CountSummary } from '@/components/CountSummary';
import { EmptyState } from '@/components/EmptyState';
import { CreatePanel } from '@/components/FilterBar';
import { PageHeader } from '@/components/PageHeader';
import { Pagination } from '@/components/Pagination';
import { Select } from '@/components/Select';
import { FaqStatusBadge } from '@/components/StatusBadge';
import { hasPermission, requireMenuPermission } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 10;

const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: '전체 상태' },
  { value: 'archived', label: '보관' },
  { value: 'published', label: '공개' },
];

export default async function FaqListPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; category?: string; page?: string }>;
}) {
  const account = await requireMenuPermission('faq', 'view');
  const canWrite = hasPermission(account.menuPermissions.faq, 'edit_approve');
  const canDelete = hasPermission(account.menuPermissions.faq, 'full');

  const { q = '', status = 'all', category = 'all', page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const [{ faqs: allFaqs, errors }, { categories, errors: categoryErrors }] = await Promise.all([
    getFaqRepository().getAll(),
    getFaqCategoryRepository().getAll(),
  ]);

  const categoryById = new Map(categories.map((c) => [c.slug, c]));
  const faqCountByCategory: Record<string, number> = {};
  for (const faq of allFaqs) {
    faqCountByCategory[faq.categoryId] = (faqCountByCategory[faq.categoryId] ?? 0) + 1;
  }

  const counts = {
    total: allFaqs.length,
    archived: allFaqs.filter((f) => f.status === 'archived').length,
    published: allFaqs.filter((f) => f.status === 'published').length,
  };

  const query = q.trim().toLowerCase();
  const faqs = allFaqs.filter((faq) => {
    const matchesQuery =
      query.length === 0 ||
      faq.question.toLowerCase().includes(query) ||
      faq.answer.toLowerCase().includes(query);
    const matchesStatus = status === 'all' || faq.status === (status as FaqStatus);
    const matchesCategory = category === 'all' || faq.categoryId === category;
    return matchesQuery && matchesStatus && matchesCategory;
  });

  const categoryOptions = categories.map((c) => ({ value: c.slug, label: c.isActive ? c.name : `${c.name} (비활성)` }));

  const totalPages = Math.max(1, Math.ceil(faqs.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedFaqs = faqs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const buildPageHref = (targetPage: number) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (status !== 'all') params.set('status', status);
    if (category !== 'all') params.set('category', category);
    if (targetPage > 1) params.set('page', String(targetPage));
    const qs = params.toString();
    return qs ? `/faq?${qs}` : '/faq';
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Faq"
        description={
          <CountSummary
            total={counts.total}
            items={[
              { label: '보관', count: counts.archived, tone: 'muted' },
              { label: '공개', count: counts.published, tone: 'confirmed' },
            ]}
          />
        }
      />

      {(errors.length > 0 || categoryErrors.length > 0) && (
        <div className="rounded-lg p-4 text-sm" style={{ background: 'var(--color-danger-bg)', color: 'var(--color-danger)' }}>
          <p className="font-semibold">프론트매터 오류가 있는 파일이 있습니다:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {[...errors, ...categoryErrors].map((error) => (
              <li key={error} className="whitespace-pre-wrap font-mono text-xs">
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      <section className="card space-y-4">
        <div>
          <h2 className="font-semibold">카테고리 관리</h2>
          <p className="mt-1 text-xs" style={{ color: 'var(--color-ink-muted)' }}>
            FAQ가 걸려 있는 카테고리는 삭제할 수 없습니다 — 먼저 다른 카테고리로 옮기세요.
          </p>
        </div>
        <CategoryManager categories={categories} faqCountByCategory={faqCountByCategory} canWrite={canWrite} canDelete={canDelete} />
      </section>

      {canWrite && (
        <CreatePanel label="+ FAQ 추가">
          <form action={createFaqAction} className="space-y-3">
            <div className="flex flex-wrap items-end gap-3">
              <div className="min-w-72 flex-1">
                <label className="label" htmlFor="question">
                  질문
                </label>
                <input id="question" name="question" className="field" placeholder="예: 결제는 어떻게 하나요?" required />
              </div>
              <div className="w-52">
                <label className="label" htmlFor="categoryId">
                  카테고리
                </label>
                {categoryOptions.length > 0 ? (
                  <Select id="categoryId" name="categoryId" options={categoryOptions} placeholder="카테고리 선택" required />
                ) : (
                  <p className="rounded-lg px-3 py-2.5 text-xs" style={{ background: 'var(--color-surface-sunken)', color: 'var(--color-ink-muted)' }}>
                    먼저 위에서 카테고리를 추가하세요.
                  </p>
                )}
              </div>
              <div className="w-28">
                <label className="label" htmlFor="order">
                  정렬 순서
                </label>
                <input id="order" name="order" type="number" defaultValue={0} className="field" />
              </div>
            </div>
            <div>
              <label className="label" htmlFor="answer">
                답변 (선택 — 나중에 채워도 됩니다)
              </label>
              <textarea id="answer" name="answer" rows={3} className="field" placeholder="답변 내용" />
            </div>
            <button type="submit" className="btn-primary" disabled={categoryOptions.length === 0}>
              FAQ 추가
            </button>
          </form>
        </CreatePanel>
      )}

      <form method="get" className="flex flex-wrap items-end gap-3">
        <div className="min-w-56 flex-1">
          <label className="label" htmlFor="q">
            검색
          </label>
          <input id="q" name="q" className="field" placeholder="질문 또는 답변으로 검색" defaultValue={q} />
        </div>
        <div className="w-44">
          <label className="label" htmlFor="status">
            상태
          </label>
          <Select id="status" name="status" defaultValue={status} options={STATUS_FILTER_OPTIONS} />
        </div>
        <div className="w-44">
          <label className="label" htmlFor="category-filter">
            카테고리
          </label>
          <Select
            id="category-filter"
            name="category"
            defaultValue={category}
            options={[{ value: 'all', label: '전체 카테고리' }, ...categoryOptions]}
          />
        </div>
        <button type="submit" className="btn-secondary">
          검색
        </button>
      </form>

      <div className="table-shell">
        <table className="w-full text-sm">
          <thead>
            <TableHeadRow labels={['질문', '카테고리', '순서', '상태', '수정일']} centerColumns={[2, 3]} />
          </thead>
          <tbody className="divide-y">
            {pagedFaqs.map((faq) => (
              <tr key={faq.slug} className="transition-colors hover:bg-[var(--color-surface-sunken)]">
                <td className="px-5 py-4">
                  <Link href={`/faq/${encodeURIComponent(faq.slug)}`} className="font-medium hover:underline">
                    {faq.question}
                  </Link>
                  <p className="mt-0.5 font-mono text-xs" style={{ color: 'var(--color-ink-faint)' }}>
                    {faq.slug}
                  </p>
                </td>
                <td className="px-5 py-4" style={{ color: 'var(--color-ink-muted)' }}>
                  {categoryById.get(faq.categoryId)?.name ?? faq.categoryId}
                </td>
                <td className="px-5 py-4 text-center tabular-nums" style={{ color: 'var(--color-ink-muted)' }}>
                  {faq.order}
                </td>
                <td className="px-5 py-4 text-center">
                  <FaqStatusBadge status={faq.status} />
                </td>
                <td className="px-5 py-4 tabular-nums" style={{ color: 'var(--color-ink-faint)' }}>
                  {faq.updatedAt.slice(0, 10)}
                </td>
              </tr>
            ))}
            {faqs.length === 0 && (
              <tr>
                <td colSpan={5}>
                  <EmptyState>
                    {allFaqs.length === 0 ? '아직 등록된 FAQ가 없습니다. 위에서 추가해 보세요.' : '검색 조건에 맞는 FAQ가 없습니다.'}
                  </EmptyState>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={currentPage} totalPages={totalPages} buildHref={buildPageHref} />
    </div>
  );
}
