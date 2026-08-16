import type { Metadata } from 'next';
import { getRepository } from '@orca/content';

import InsightView, { CATEGORY_LABEL, type InsightRow } from './view';
import './insight.css';

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
