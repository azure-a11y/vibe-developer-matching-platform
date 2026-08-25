import type { Metadata } from 'next';
import { getRepository, insightCategoryLabel } from '@orca/content';

import { absoluteUrl, siteBrandName } from '@/lib/site';

import InsightView, { CATEGORY_LABEL, type InsightRow } from './view';
import './insight.css';

/* admin과 web은 별도 Next.js 프로세스라 admin의 revalidatePath()가 이 페이지 캐시를
   지우지 못한다 — 60초 시간 기반 재검증으로 Supabase 변경이 재배포 없이 반영되게 한다. */
// Admin and web are separate deployments, so the admin save cannot invalidate
// this page's ISR cache. Read the published rows on each request so cover
// changes appear without a web redeploy.
export const revalidate = 0;

/* title은 핵심 검색어만 — layout.tsx의 title.template이 하위 세그먼트에 자동으로 브랜드를 붙인다.
   openGraph.title은 템플릿이 적용되지 않아 브랜드를 직접 붙인다. */
const INSIGHT_TITLE = '외주 발주 가이드 · AI 인사이트';
const INSIGHT_DESCRIPTION = '외주 발주 가이드부터 AI 도입, 일하는 방식까지 — 파트너 똑똑한개발자와 함께 쓰는 실무 인사이트입니다.';

export const metadata: Metadata = {
  title: INSIGHT_TITLE,
  description: INSIGHT_DESCRIPTION,
  alternates: { canonical: absoluteUrl('/insight') },
  openGraph: {
    type: 'website',
    title: `${INSIGHT_TITLE} | ${siteBrandName}`,
    description: INSIGHT_DESCRIPTION,
    url: absoluteUrl('/insight'),
  },
};

export default async function InsightIndexPage() {
  const posts = await getRepository().getPublished();

  const articles: InsightRow[] = posts.map((post) => ({
    slug: post.slug,
    category: post.category,
    categoryLabel: insightCategoryLabel(post.category),
    img: post.cover?.src ?? '/assets/img/ins/ins-poc.jpg',
    title: post.title,
    desc: post.description,
    meta: `${post.author} · ${(post.publishedAt ?? post.updatedAt).slice(0, 10).replace(/-/g, '.')}`,
  }));

  return <InsightView articles={articles} />;
}
