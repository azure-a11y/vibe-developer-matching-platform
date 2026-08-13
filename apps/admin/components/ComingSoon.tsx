export function ComingSoon({ title, description, reference }: { title: string; description: string; reference: string }) {
  return (
    <div className="card max-w-2xl space-y-3">
      <h2 className="font-semibold">{title} — 준비 중</h2>
      <p className="text-sm leading-6 text-neutral-600">{description}</p>
      <p className="text-xs text-neutral-400">
        참고: <code className="font-mono">{reference}</code>
      </p>
    </div>
  );
}
