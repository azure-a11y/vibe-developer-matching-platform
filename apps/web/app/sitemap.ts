import type { MetadataRoute } from 'next';
import { getBuilderRepository, getRepository, getWorkRepository } from '@orca/content';

import { siteUrl } from '@/lib/site';

/* admin과 web은 별도 Next.js 프로세스라 admin의 revalidatePath()가 이 캐시를 지우지
   못한다 — 60초 재검증으로 새로 발행된 Work/Insight/Builder가 재배포 없이 사이트맵에
   반영되게 한다. */
export const revalidate = 60;

/**
 * Sitemap driven by per-post frontmatter.
 *
 * `changefreq` and `priority` are editorial decisions (set in the admin
 * technical SEO panel), not constants — cornerstone content should outrank
 * an archive note in the crawl budget.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, { works }, { builders }] = await Promise.all([
    getRepository().getPublished(),
    getWorkRepository().getAll(),
    getBuilderRepository().getAll(),
  ]);

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${siteUrl}/insight/${encodeURIComponent(post.slug)}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: post.seo.changefreq,
    priority: post.seo.priority,
    ...(post.seo.alternates.length > 0
      ? {
          alternates: {
            languages: Object.fromEntries(
              post.seo.alternates.map((alternate) => [alternate.hreflang, alternate.href]),
            ),
          },
        }
      : {}),
  }));

  const workEntries: MetadataRoute.Sitemap = works
    .filter((w) => w.status === 'published')
    .map((w) => ({
      url: `${siteUrl}/work/${encodeURIComponent(w.slug)}`,
      lastModified: new Date(w.updatedAt),
      changeFrequency: 'monthly',
      priority: 0.7,
    }));

  const builderEntries: MetadataRoute.Sitemap = builders
    .filter((b) => b.status === 'active')
    .map((b) => ({
      url: `${siteUrl}/builder/${encodeURIComponent(b.slug)}`,
      lastModified: new Date(b.updatedAt),
      changeFrequency: 'monthly',
      priority: 0.6,
    }));

  return [
    { url: siteUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${siteUrl}/work`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${siteUrl}/builder`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/insight`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteUrl}/content`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.5 },
    { url: `${siteUrl}/contact`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.6 },
    { url: `${siteUrl}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
    ...workEntries,
    ...builderEntries,
    ...postEntries,
  ];
}
