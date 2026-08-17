/** Shared title + description + action-slot header for every list/detail screen. */
export function PageHeader({
  title,
  description,
  actions,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="admin-page-title">{title}</h1>
        {description && (
          <p className="mt-1.5 text-[0.9375rem]" style={{ color: 'var(--color-ink-muted)' }}>
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
}
