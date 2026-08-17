import Link from 'next/link';

interface NavTarget {
  href: string;
  label: string;
}

/**
 * 상세 화면 헤더용 [← 이전] [목록] [다음 →] 네비게이션.
 * prev/next가 없으면(첫/마지막 항목) 화살표를 비활성 표시로 렌더링한다.
 * 각 메뉴 상세 페이지에서 목록과 동일한 정렬 기준으로 계산한 이전/다음 항목을 전달한다.
 */
export function DetailNav({ listHref, prev, next }: { listHref: string; prev?: NavTarget; next?: NavTarget }) {
  return (
    <div className="flex items-center overflow-hidden rounded-lg" style={{ border: '1px solid var(--color-border)' }}>
      {prev ? (
        <Link
          href={prev.href}
          className="flex size-9 items-center justify-center transition-colors hover:bg-[var(--color-surface-sunken)]"
          aria-label={`이전: ${prev.label}`}
          title={prev.label}
        >
          ←
        </Link>
      ) : (
        <span className="flex size-9 items-center justify-center" style={{ color: 'var(--color-ink-faint)' }} aria-hidden>
          ←
        </span>
      )}
      <Link
        href={listHref}
        className="flex h-9 items-center px-3 text-sm transition-colors hover:bg-[var(--color-surface-sunken)]"
        style={{ borderLeft: '1px solid var(--color-border)', borderRight: '1px solid var(--color-border)' }}
      >
        목록
      </Link>
      {next ? (
        <Link
          href={next.href}
          className="flex size-9 items-center justify-center transition-colors hover:bg-[var(--color-surface-sunken)]"
          aria-label={`다음: ${next.label}`}
          title={next.label}
        >
          →
        </Link>
      ) : (
        <span className="flex size-9 items-center justify-center" style={{ color: 'var(--color-ink-faint)' }} aria-hidden>
          →
        </span>
      )}
    </div>
  );
}
