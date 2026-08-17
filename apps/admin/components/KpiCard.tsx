import Link from 'next/link';

/** Dashboard summary tile — title, headline number, one line of secondary status. */
export function KpiCard({
  href,
  label,
  value,
  detail,
}: {
  href: string;
  label: string;
  value: React.ReactNode;
  detail: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="card flex flex-col gap-3 transition-colors hover:border-[var(--color-border-strong)]"
    >
      <p className="label mb-0">{label}</p>
      <p className="text-[2.25rem] leading-none font-semibold tracking-tight tabular-nums">{value}</p>
      <p
        className="text-[0.8125rem]"
        style={{ color: 'var(--color-ink-muted)', borderTop: '1px solid var(--color-border-subtle)', paddingTop: '0.625rem' }}
      >
        {detail}
      </p>
    </Link>
  );
}
