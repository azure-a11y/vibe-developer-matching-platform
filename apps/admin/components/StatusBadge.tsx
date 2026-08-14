import type { BuilderStatus, PostStatus, WorkStatus } from '@orca/content';

const STYLES: Record<PostStatus, string> = {
  draft: 'bg-[var(--color-neutral-badge-bg)] text-[var(--color-neutral-badge)]',
  in_review: 'bg-[var(--color-warning-bg)] text-[var(--color-warning)]',
  scheduled: 'bg-[var(--color-accent-soft)] text-[var(--color-accent-soft-text)]',
  published: 'bg-[var(--color-success-bg)] text-[var(--color-success)]',
  archived: 'bg-[var(--color-surface-sunken)] text-[var(--color-ink-faint)]',
};

const LABELS: Record<PostStatus, string> = {
  draft: '초안',
  in_review: '검수 중',
  scheduled: '예약',
  published: '발행됨',
  archived: '보관',
};

export function StatusBadge({ status }: { status: PostStatus }) {
  return <span className={`badge ${STYLES[status]}`}>{LABELS[status]}</span>;
}

const BUILDER_STYLES: Record<BuilderStatus, string> = {
  pending: 'bg-[var(--color-warning-bg)] text-[var(--color-warning)]',
  active: 'bg-[var(--color-success-bg)] text-[var(--color-success)]',
  inactive: 'bg-[var(--color-surface-sunken)] text-[var(--color-ink-faint)]',
};

const BUILDER_LABELS: Record<BuilderStatus, string> = {
  pending: '검증 대기',
  active: '활성',
  inactive: '비활성',
};

export function BuilderStatusBadge({ status }: { status: BuilderStatus }) {
  return <span className={`badge ${BUILDER_STYLES[status]}`}>{BUILDER_LABELS[status]}</span>;
}

const WORK_STYLES: Record<WorkStatus, string> = {
  pending_review: 'bg-[var(--color-warning-bg)] text-[var(--color-warning)]',
  published: 'bg-[var(--color-success-bg)] text-[var(--color-success)]',
  archived: 'bg-[var(--color-surface-sunken)] text-[var(--color-ink-faint)]',
};

const WORK_LABELS: Record<WorkStatus, string> = {
  pending_review: '승인 대기',
  published: '공개',
  archived: '보관',
};

export function WorkStatusBadge({ status }: { status: WorkStatus }) {
  return <span className={`badge ${WORK_STYLES[status]}`}>{WORK_LABELS[status]}</span>;
}

export function ScoreBadge({ score }: { score: number }) {
  const tone =
    score >= 85
      ? 'bg-[var(--color-success-bg)] text-[var(--color-success)]'
      : score >= 60
        ? 'bg-[var(--color-warning-bg)] text-[var(--color-warning)]'
        : 'bg-[var(--color-danger-bg)] text-[var(--color-danger)]';
  return <span className={`badge tabular-nums ${tone}`}>{score}</span>;
}
