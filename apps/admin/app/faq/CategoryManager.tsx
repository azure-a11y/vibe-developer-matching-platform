import type { FaqCategory } from '@orca/content';

import { createFaqCategoryAction, deleteFaqCategoryAction, saveFaqCategoryAction } from '@/app/faq/category-actions';

/**
 * FAQ 화면 안에서 카테고리를 자연스럽게 관리하는 패널. 각 행의 입력을
 * `form="faq-category-<slug>"` 로 테이블 밖의 `<form>` 하나에 연결한다
 * (HTML5 표준 — `<tr>`는 `<form>`을 직접 감쌀 수 없어서). 관리자에
 * 클라이언트 상태 라이브러리를 들이지 않는 기존 관례(폼 = 서버 액션) 그대로.
 */
export function CategoryManager({
  categories,
  faqCountByCategory,
  canWrite,
  canDelete,
}: {
  categories: FaqCategory[];
  faqCountByCategory: Record<string, number>;
  canWrite: boolean;
  canDelete: boolean;
}) {
  return (
    <div className="space-y-4">
      {canWrite &&
        categories.map((category) => (
          <form
            key={category.slug}
            id={`faq-category-${category.slug}`}
            action={saveFaqCategoryAction}
            className="hidden"
            aria-hidden="true"
          >
            <input type="hidden" name="slug" value={category.slug} />
          </form>
        ))}

      <div className="table-shell">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface-sunken)' }}>
              <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide" style={{ color: 'var(--color-ink-muted)' }}>
                이름
              </th>
              <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide" style={{ color: 'var(--color-ink-muted)' }}>
                순서
              </th>
              <th className="px-4 py-3 text-center text-[12px] font-semibold uppercase tracking-wide" style={{ color: 'var(--color-ink-muted)' }}>
                노출
              </th>
              <th className="px-4 py-3 text-center text-[12px] font-semibold uppercase tracking-wide" style={{ color: 'var(--color-ink-muted)' }}>
                FAQ 수
              </th>
              {canWrite && <th className="px-4 py-3" />}
            </tr>
          </thead>
          <tbody className="divide-y">
            {categories.map((category) => {
              const formId = `faq-category-${category.slug}`;
              return (
                <tr key={category.slug}>
                  <td className="px-4 py-2.5">
                    {canWrite ? (
                      <input name="name" form={formId} className="field" defaultValue={category.name} />
                    ) : (
                      category.name
                    )}
                    <p className="mt-0.5 font-mono text-xs" style={{ color: 'var(--color-ink-faint)' }}>
                      {category.slug}
                    </p>
                  </td>
                  <td className="px-4 py-2.5">
                    {canWrite ? (
                      <input name="order" form={formId} type="number" className="field w-20" defaultValue={category.order} />
                    ) : (
                      category.order
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    {canWrite ? (
                      <input
                        type="checkbox"
                        name="isActive"
                        form={formId}
                        defaultChecked={category.isActive}
                        className="size-4 accent-[var(--color-accent)]"
                      />
                    ) : (
                      <span className={`badge ${category.isActive ? 'badge-confirmed' : 'badge-inactive'}`}>
                        {category.isActive ? '노출' : '비노출'}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-center tabular-nums" style={{ color: 'var(--color-ink-muted)' }}>
                    {faqCountByCategory[category.slug] ?? 0}
                  </td>
                  {canWrite && (
                    <td className="px-4 py-2.5 text-right whitespace-nowrap">
                      <button type="submit" form={formId} className="btn-secondary">
                        저장
                      </button>
                      {canDelete && (
                        <form action={deleteFaqCategoryAction} className="inline">
                          <input type="hidden" name="slug" value={category.slug} />
                          <button
                            type="submit"
                            className="ml-2 rounded-md px-2.5 py-1.5 text-xs font-medium"
                            style={{ color: 'var(--color-danger)' }}
                          >
                            삭제
                          </button>
                        </form>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
            {categories.length === 0 && (
              <tr>
                <td colSpan={canWrite ? 5 : 4} className="px-5 py-8 text-center text-sm" style={{ color: 'var(--color-ink-muted)' }}>
                  아직 등록된 카테고리가 없습니다. 아래에서 추가해 보세요.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {canWrite && (
        <form action={createFaqCategoryAction} className="flex flex-wrap items-end gap-3">
          <div className="min-w-56">
            <label className="label" htmlFor="new-category-name">
              새 카테고리 이름
            </label>
            <input id="new-category-name" name="name" className="field" placeholder="예: 견적·비용" required />
          </div>
          <div className="w-28">
            <label className="label" htmlFor="new-category-order">
              순서
            </label>
            <input id="new-category-order" name="order" type="number" defaultValue={categories.length} className="field" />
          </div>
          <button type="submit" className="btn-primary">
            카테고리 추가
          </button>
        </form>
      )}
    </div>
  );
}
