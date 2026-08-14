import type { AdminMenuPermissions, MenuKey, PermissionLevel } from '@orca/content';

const MENU_LABELS: [MenuKey, string][] = [
  ['dashboard', 'Dashboard'],
  ['builder', 'Builder'],
  ['work', 'Work'],
  ['insight', 'Insight'],
  ['inquiry', 'Inquiry'],
  ['settings', 'Settings'],
  ['accountPermission', '계정·권한'],
];

const LEVELS: { value: PermissionLevel; label: string }[] = [
  { value: 'none', label: '접근불가' },
  { value: 'view', label: '조회' },
  { value: 'edit_approve', label: '편집·승인' },
  { value: 'full', label: '전체' },
];

/**
 * 낮은 권한(조회)은 차분한 톤, 높은 권한(전체 — 삭제 포함)은 warning/danger
 * 톤으로 갈수록 진하게 — 값을 읽지 않아도 색만으로 위계와 위험도가 보이게 한다.
 */
const LEVEL_TONE: Record<PermissionLevel, string> = {
  none: 'has-checked:border-transparent has-checked:bg-[var(--color-neutral-badge-bg)] has-checked:text-[var(--color-neutral-badge)]',
  view: 'has-checked:border-transparent has-checked:bg-[var(--color-accent-soft)] has-checked:text-[var(--color-accent-soft-text)]',
  edit_approve: 'has-checked:border-transparent has-checked:bg-[var(--color-warning-bg)] has-checked:text-[var(--color-warning)]',
  full: 'has-checked:border-transparent has-checked:bg-[var(--color-danger-bg)] has-checked:text-[var(--color-danger)]',
};

/**
 * 계정 생성/편집 폼에서 `perm_<menu>` 라디오 그룹 7개를 하나의 표로 묶는다.
 * 각 셀은 `name="perm_${menu}"` radio라 `actions.ts`의 `menuPermissionsFromForm`이
 * 그대로 읽는다 — 필드 이름·값은 기존 select와 동일하게 유지.
 */
export function PermissionMatrix({ defaultValues }: { defaultValues?: Partial<AdminMenuPermissions> }) {
  return (
    <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid var(--color-border)' }}>
      <table className="w-full min-w-[560px] border-collapse text-sm">
        <thead>
          <tr style={{ background: 'var(--color-surface-sunken)', borderBottom: '1px solid var(--color-border)' }}>
            <th
              className="px-4 py-2.5 text-left font-mono text-[11px] font-semibold uppercase tracking-wide"
              style={{ color: 'var(--color-ink-faint)' }}
            >
              메뉴
            </th>
            {LEVELS.map((level) => (
              <th
                key={level.value}
                className="px-2 py-2.5 text-center font-mono text-[11px] font-semibold uppercase tracking-wide"
                style={{ color: 'var(--color-ink-faint)' }}
              >
                {level.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
          {MENU_LABELS.map(([key, label]) => {
            const current = defaultValues?.[key] ?? (key === 'dashboard' ? 'view' : 'none');
            return (
              <tr key={key} className="transition-colors hover:bg-[var(--color-surface-sunken)]">
                <td className="px-4 py-2.5 font-medium">{label}</td>
                {LEVELS.map((level) => (
                  <td key={level.value} className="px-2 py-2.5">
                    <label
                      className={`flex w-full cursor-pointer items-center justify-center rounded-md border py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${LEVEL_TONE[level.value]}`}
                      style={{ borderColor: 'var(--color-border)', color: 'var(--color-ink-faint)' }}
                    >
                      <input
                        type="radio"
                        name={`perm_${key}`}
                        value={level.value}
                        defaultChecked={current === level.value}
                        className="sr-only"
                      />
                      {level.label}
                    </label>
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
