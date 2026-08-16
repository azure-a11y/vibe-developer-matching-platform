/** Consistent "nothing here yet" copy for list tables — used inside a `<td colSpan>`. */
export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-5 py-12 text-center text-sm" style={{ color: 'var(--color-ink-muted)' }}>
      {children}
    </div>
  );
}
