import Link from 'next/link';

/** Simple prev/next pager for list screens — 10 rows per page by convention (see callers). */
export function Pagination({
  page,
  totalPages,
  buildHref,
}: {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-4 pt-1">
      {page > 1 ? (
        <Link href={buildHref(page - 1)} className="btn-secondary">
          이전
        </Link>
      ) : (
        <span className="btn-secondary opacity-40">이전</span>
      )}
      <span className="font-mono text-xs tabular-nums" style={{ color: 'var(--color-ink-muted)' }}>
        {page} / {totalPages}
      </span>
      {page < totalPages ? (
        <Link href={buildHref(page + 1)} className="btn-secondary">
          다음
        </Link>
      ) : (
        <span className="btn-secondary opacity-40">다음</span>
      )}
    </div>
  );
}
