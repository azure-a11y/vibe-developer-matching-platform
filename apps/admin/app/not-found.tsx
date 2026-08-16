import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="space-y-4 py-16 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">찾을 수 없음</h1>
      <p style={{ color: 'var(--color-ink-muted)' }}>해당 페이지 또는 항목이 존재하지 않습니다.</p>
      <Link href="/" className="text-sm underline underline-offset-4" style={{ color: 'var(--color-accent-soft-text)' }}>
        대시보드로
      </Link>
    </div>
  );
}
