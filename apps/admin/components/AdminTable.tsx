/**
 * Shared table header row for list screens (Insight/Builder/Work/Accounts) — one visual language, not three.
 * `centerColumns` marks label indexes whose header + cell content (badges: 상태·점수·등급) is
 * horizontally centered in its column instead of the default left alignment.
 */
export function TableHeadRow({
  labels,
  actionsColumn,
  centerColumns = [],
}: {
  labels: string[];
  actionsColumn?: boolean;
  centerColumns?: number[];
}) {
  return (
    <tr style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface-sunken)' }}>
      {labels.map((label, i) => (
        <th
          key={label}
          className={`whitespace-nowrap px-5 py-3.5 text-[12px] font-semibold uppercase tracking-wide ${centerColumns.includes(i) ? 'text-center' : 'text-left'}`}
          style={{ color: 'var(--color-ink-muted)' }}
        >
          {label}
        </th>
      ))}
      {actionsColumn && <th className="px-5 py-3" />}
    </tr>
  );
}
