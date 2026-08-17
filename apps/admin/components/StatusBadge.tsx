import type { AdminAccountStatus, BuilderStatus, FaqStatus, PostStatus, WorkStatus } from '@orca/content';

const STYLES: Record<PostStatus, string> = {
  draft: 'badge-muted',
  in_review: 'badge-pending',
  scheduled: 'badge-scheduled',
  published: 'badge-confirmed',
  archived: 'badge-muted',
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
  pending: 'badge-pending',
  active: 'badge-confirmed',
  inactive: 'badge-inactive',
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
  pending_review: 'badge-pending',
  published: 'badge-confirmed',
  archived: 'badge-muted',
};

const WORK_LABELS: Record<WorkStatus, string> = {
  pending_review: '승인 대기',
  published: '공개',
  archived: '보관',
};

export function WorkStatusBadge({ status }: { status: WorkStatus }) {
  return <span className={`badge ${WORK_STYLES[status]}`}>{WORK_LABELS[status]}</span>;
}

const FAQ_STYLES: Record<FaqStatus, string> = {
  archived: 'badge-muted',
  published: 'badge-confirmed',
};

const FAQ_LABELS: Record<FaqStatus, string> = {
  archived: '보관',
  published: '공개',
};

export function FaqStatusBadge({ status }: { status: FaqStatus }) {
  return <span className={`badge ${FAQ_STYLES[status]}`}>{FAQ_LABELS[status]}</span>;
}

const ACCOUNT_STYLES: Record<AdminAccountStatus, string> = {
  active: 'badge-confirmed',
  inactive: 'badge-inactive',
};

const ACCOUNT_LABELS: Record<AdminAccountStatus, string> = {
  active: '활성',
  inactive: '비활성',
};

export function AccountStatusBadge({ status }: { status: AdminAccountStatus }) {
  return <span className={`badge ${ACCOUNT_STYLES[status]}`}>{ACCOUNT_LABELS[status]}</span>;
}

/** 등급은 04_정책정의.md §4.5 기준 표시용 자유 텍스트 — 실권한과 무관하므로 항상 중립 톤. */
export function GradeBadge({ grade }: { grade: string }) {
  return <span className="badge bg-[var(--color-neutral-badge-bg)] text-[var(--color-neutral-badge)]">{grade}</span>;
}

/** 만점(100)은 파랑, 과락(60 미만)은 빨강, 그 사이는 검정 — 목록/원형 배지가 공유하는 판정 규칙. */
function scoreColor(score: number): string {
  if (score === 100) return 'var(--color-status-confirmed)';
  if (score < 60) return 'var(--color-danger)';
  return 'var(--color-ink)';
}

/** 목록(테이블·카드 리스트)에서 여러 항목을 나란히 훑어볼 때 — 배경·테두리 없이 숫자만. */
export function ScoreValue({ score }: { score: number }) {
  return (
    <span className="tabular-nums text-sm font-semibold" style={{ color: scoreColor(score) }}>
      {score}
    </span>
  );
}

/** 상세/검수 화면 상단에서 "지금 보고 있는 이 글의 점수" 하나를 강조할 때 — 원형 배지. */
export function ScoreCircle({ score }: { score: number }) {
  const color = scoreColor(score);
  const isNeutral = color === 'var(--color-ink)';
  return (
    <span
      className="flex size-9 shrink-0 items-center justify-center rounded-full border text-sm font-bold tabular-nums"
      style={{ borderColor: isNeutral ? 'var(--color-border-strong)' : color, color }}
    >
      {score}
    </span>
  );
}
