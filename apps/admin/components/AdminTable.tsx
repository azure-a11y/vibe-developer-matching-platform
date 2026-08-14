/** Shared table header row for list screens (Insight/Builder/Work) — one visual language, not three. */
export function TableHeadRow({ labels, actionsColumn }: { labels: string[]; actionsColumn?: boolean }) {
  return (
    <tr style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface-sunken)' }}>
      {labels.map((label) => (
        <th
          key={label}
          className="whitespace-nowrap px-5 py-3 text-left font-mono text-[11px] font-semibold uppercase tracking-wide"
          style={{ color: 'var(--color-ink-faint)' }}
        >
          {label}
        </th>
      ))}
      {actionsColumn && <th className="px-5 py-3" />}
    </tr>
  );
}
