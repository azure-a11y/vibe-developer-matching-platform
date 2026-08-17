import type { Faq, FaqCategory } from '@orca/content'

export type FaqTopic = {
  key: string
  label: string
  items: { id: string; question: string; answer: string }[]
}

/**
 * Groups published FAQ entries under their (already active + `order`-sorted)
 * categories. Shared by the home page's FAQ preview and the standalone
 * `/faq` page so both read the same grouping from the same repositories.
 *
 * Categories with zero matching entries are dropped — no point rendering an
 * empty tab. `limit` caps the home preview to the same shape the hardcoded
 * section used to have (first N categories, first M items each); omit it for
 * the full `/faq` page.
 */
export function buildFaqTopics(
  faqs: Faq[],
  categories: FaqCategory[],
  limit?: { maxTopics: number; maxItemsPerTopic: number },
): FaqTopic[] {
  const itemsByCategory = new Map<string, FaqTopic['items']>()
  for (const faq of faqs) {
    const list = itemsByCategory.get(faq.categoryId) ?? []
    list.push({ id: faq.slug, question: faq.question, answer: faq.answer })
    itemsByCategory.set(faq.categoryId, list)
  }

  const topics = categories
    .map((category) => ({
      key: category.slug,
      label: category.name,
      items: itemsByCategory.get(category.slug) ?? [],
    }))
    .filter((topic) => topic.items.length > 0)

  if (!limit) return topics
  return topics.slice(0, limit.maxTopics).map((topic) => ({ ...topic, items: topic.items.slice(0, limit.maxItemsPerTopic) }))
}
