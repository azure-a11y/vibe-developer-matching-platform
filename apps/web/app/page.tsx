import type { Metadata } from 'next';
import { getFaqCategoryRepository, getFaqRepository, getRepository, getWorkRepository } from '@orca/content';

import { buildFaqTopics } from '@/lib/faq';

import HomeView from './home-view';
import './home.css';

export const metadata: Metadata = {
  title: 'AI 빌더 그룹 — 바이브 코딩 외주',
  description:
    'AI 시대에 최적화된 개발자가 바이브 코딩으로 외주를 해드립니다. 기획부터 개발, 검수까지 검증된 빌더가 끝까지 맡습니다.',
};

export default async function HomePage() {
  const [{ works }, posts, faqs, faqCategories] = await Promise.all([
    getWorkRepository().getPublished().then((works) => ({ works })),
    getRepository().getPublished(),
    getFaqRepository().getPublished(),
    getFaqCategoryRepository().getActive(),
  ]);

  const workPreviews = works.slice(0, 2).map((w) => ({
    slug: w.slug,
    tag: w.tag || w.category,
    meta: w.year,
    title: w.title,
    desc: w.summary,
    note: w.partner || undefined,
    shotUrl: w.slug,
    shotImg: w.assets[0]?.src ?? '/assets/img/ref-toktokhan.jpg',
  }));

  const insightPreviews = posts.slice(0, 3).map((p) => ({
    slug: p.slug,
    title: p.title,
    tag: p.category,
    date: (p.publishedAt ?? p.updatedAt).slice(0, 10).replace(/-/g, '.'),
  }));

  // 홈은 기존 s9 섹션과 같은 모양(카테고리 2개 x 항목 3개)만 미리보기로 보여주고,
  // 전체 목록은 "전체 보기" → /faq 에서 확인한다.
  const faqTopics = buildFaqTopics(faqs, faqCategories, { maxTopics: 2, maxItemsPerTopic: 3 });

  return <HomeView workPreviews={workPreviews} insightPreviews={insightPreviews} faqTopics={faqTopics} />;
}
