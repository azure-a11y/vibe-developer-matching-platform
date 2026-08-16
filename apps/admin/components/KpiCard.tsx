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
      className="card flex flex-col gap-2 transition-colors hover:border-[var(--color-border-strong)]"
    >
      <p className="label mb-0">{label}</p>
      <p className="text-3xl font-semibold tabular-nums">{value}</p>
      <p className="text-xs" style={{ color: 'var(--color-ink-muted)' }}>
        {detail}
      </p>
    </Link>
  );
}
