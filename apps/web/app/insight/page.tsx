import type { Metadata } from 'next';
import { getRepository } from '@orca/content';

import InsightView, { CATEGORY_LABEL, type InsightRow } from './view';
import './insight.css';

/* admin과 web은 별도 Next.js 프로세스라 admin의 revalidatePath()가 이 페이지 캐시를
   지우지 못한다 — 60초 시간 기반 재검증으로 Supabase 변경이 재배포 없이 반영되게 한다. */
export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Insight — 우리의 생각',
  description: '파트너 똑똑한개발자의 실제 인사이트를 함께 발행합니다.',
};

export default async function InsightIndexPage() {
  const posts = await getRepository().getPublished();

  const articles: InsightRow[] = posts.map((post) => ({
    slug: post.slug,
    category: post.category,
    categoryLabel: CATEGORY_LABEL[post.category] ?? post.category,
    img: post.cover?.src ?? '/assets/img/ins/ins-poc.jpg',
    title: post.title,
    desc: post.description,
    meta: `${post.author} · ${(post.publishedAt ?? post.updatedAt).slice(0, 10).replace(/-/g, '.')}`,
  }));

  return <InsightView articles={articles} />;
}
