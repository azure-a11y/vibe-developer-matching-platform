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
 */
export function CreatePanel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <details className="group">
      <summary className="flex list-none items-center justify-end [&::-webkit-details-marker]:hidden">
        <span className="btn-primary cursor-pointer">{label}</span>
      </summary>
      <div className="card mt-3">{children}</div>
    </details>
  );
}
