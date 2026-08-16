import { Select, type SelectOption } from '@/components/Select';

/**
 * Search + status filter for list screens. Submits as a plain GET form so the
 * server component re-renders with `searchParams` — no client state, no new
 * repository calls. `actions` (e.g. the "등록" create-form) always renders as
 * its own row below, separated by a divider — stacking unconditionally avoids
 * the two forms competing for space and wrapping unpredictably at odd widths.
 */
export function FilterBar({
  searchPlaceholder = '검색',
  defaultQuery = '',
  statusOptions,
  defaultStatus = 'all',
  actions,
}: {
  searchPlaceholder?: string;
  defaultQuery?: string;
  statusOptions?: SelectOption[];
  defaultStatus?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="card space-y-4">
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
      {actions && (
        <div className="pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
          {actions}
        </div>
      )}
    </div>
  );
}
