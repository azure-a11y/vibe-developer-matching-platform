import { Select, type SelectOption } from '@/components/Select';

/**
 * Search + status filter for list screens. Submits as a plain GET form so the
 * server component re-renders with `searchParams` — no client state, no new
 * repository calls.
 */
export function FilterBar({
  searchPlaceholder = '검색',
  defaultQuery = '',
  statusOptions,
  defaultStatus = 'all',
}: {
  searchPlaceholder?: string;
  defaultQuery?: string;
  statusOptions?: SelectOption[];
  defaultStatus?: string;
}) {
  return (
    <form method="get" className="flex flex-wrap items-end gap-3">
      <div className="min-w-56 flex-1">
        <label className="label" htmlFor="q">
          검색
        </label>
        <input id="q" name="q" className="field" placeholder={searchPlaceholder} defaultValue={defaultQuery} />
      </div>
      {statusOptions && (
        <div className="w-44">
          <label className="label" htmlFor="status">
            상태
          </label>
          <Select id="status" name="status" defaultValue={defaultStatus} options={statusOptions} />
        </div>
      )}
      <button type="submit" className="btn-secondary">
        검색
      </button>
    </form>
  );
}

/**
 * Native `<details>` disclosure for a list screen's "등록" form — no client
 * state needed. The summary renders as a right-aligned primary button; the
 * form panel unfolds below it instead of always occupying the top of the
 * screen.
 *
 * `fullWidth` makes the trigger span the container instead of hugging the
 * right edge — for screens that stack multiple `CreatePanel`s and need their
 * buttons to line up as one clean top-to-bottom block (e.g. Accounts &
 * Permissions' "빌더 계정 생성" / "관리자 계정 생성").
 */
export function CreatePanel({
  label,
  children,
  defaultOpen = false,
  fullWidth = false,
}: {
  label: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  fullWidth?: boolean;
}) {
  return (
    <details className="group" open={defaultOpen}>
      <summary
        className={`flex list-none items-center [&::-webkit-details-marker]:hidden ${fullWidth ? 'justify-start' : 'justify-end'}`}
      >
        <span className={`btn-primary cursor-pointer ${fullWidth ? 'w-full text-center' : ''}`}>{label}</span>
      </summary>
      <div className="card mt-3">{children}</div>
    </details>
  );
}
