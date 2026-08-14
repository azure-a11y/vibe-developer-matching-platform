/** Small section heading used to break up long field groups within a card. */
export function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-ink-faint)' }}>
      {children}
    </p>
  );
}

export function CheckboxRow({
  name,
  defaultChecked,
  title,
  description,
}: {
  name: string;
  defaultChecked: boolean;
  title: string;
  description: string;
}) {
  return (
    <label
      className="flex items-start gap-2 rounded-lg p-3 text-sm"
      style={{ border: '1px solid var(--color-border)' }}
    >
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="mt-0.5 size-4 accent-[var(--color-accent)]" />
      <span>
        <span className="font-medium">{title}</span>
        <span className="block text-xs" style={{ color: 'var(--color-ink-muted)' }}>
          {description}
        </span>
      </span>
    </label>
  );
}
