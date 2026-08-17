/** Status badge 4단계 톤과 동일한 클래스를 재사용한다 — components/StatusBadge.tsx 참고. */
export type CountTone = 'pending' | 'confirmed' | 'scheduled' | 'inactive' | 'muted';

interface CountItem {
  label: string;
  count: number;
  tone: CountTone;
}

/**
 * 목록/대시보드 헤더의 "전체 N · 상태 M" 집계 표시를 상태 배지와 동일한
 * 색상·타입으로 렌더링한다. 인라인 요소만 사용 — PageHeader/KpiCard가
 * 이 컴포넌트를 <p> 안에 그대로 끼워 넣으므로 블록 요소를 반환하면 안 된다.
 */
export function CountSummary({ total, items }: { total?: number; items: CountItem[] }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-2 align-middle">
      {total !== undefined && <span>전체 {total}</span>}
      {items.map((item) => (
        <span className={`badge badge-${item.tone}`} key={item.label}>
          {item.label} {item.count}
        </span>
      ))}
    </span>
  );
}
