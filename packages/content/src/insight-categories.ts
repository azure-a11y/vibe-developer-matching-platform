export const INSIGHT_CATEGORIES = [
  { value: 'ai-ax', label: 'AI·AX' },
  { value: 'guide', label: '발주 가이드' },
  { value: 'how', label: '일하는 방식' },
  { value: 'project', label: '프로젝트' },
] as const;

export type InsightCategory = (typeof INSIGHT_CATEGORIES)[number]['value'];

const LEGACY_CATEGORY_MAP: Record<string, InsightCategory> = {
  'ai-ax': 'ai-ax', guide: 'guide', how: 'how', project: 'project',
  product: 'project', general: 'guide', engineering: 'how',
};

export function normalizeInsightCategory(value: string): InsightCategory {
  return LEGACY_CATEGORY_MAP[value] ?? 'guide';
}

export function insightCategoryLabel(value: string): string {
  return INSIGHT_CATEGORIES.find(({ value: key }) => key === normalizeInsightCategory(value))?.label ?? value;
}
