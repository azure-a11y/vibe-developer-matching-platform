/** Small section heading used to break up long field groups within a card. */
export function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-ink-faint)' }}>
      {children}
    </p>
  );
}

/**
 * 미확정(TBD) 값 안내 — 에러 배너(`--color-danger-bg` 풀박스)와 다른 시각 언어를
 * 써서 "아직 안 정했다"와 "뭔가 잘못됐다"가 섞여 보이지 않게 한다.
 */
export function TbdNote({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-lg p-4 text-sm"
      style={{ background: 'var(--color-surface-sunken)', border: '1px dashed var(--color-border-strong)' }}
    >
      <div className="mb-1.5 flex items-center gap-2">
        <span className="badge bg-[var(--color-warning-bg)] text-[var(--color-warning)]">TBD</span>
        <p className="font-medium" style={{ color: 'var(--color-ink)' }}>{title}</p>
      </div>
      <div className="text-xs leading-5" style={{ color: 'var(--color-ink-muted)' }}>{children}</div>
    </div>
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
