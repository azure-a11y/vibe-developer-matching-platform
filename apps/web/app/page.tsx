import type { Metadata } from 'next';
import { getBuilderRepository, getFaqCategoryRepository, getFaqRepository, getRepository, getWorkRepository } from '@orca/content';

import { buildFaqTopics } from '@/lib/faq';

import HomeView from './home-view';
import './home.css';

/* admin과 web은 별도 Next.js 프로세스라 admin의 revalidatePath()가 이 페이지 캐시를
   지우지 못한다 — 60초 시간 기반 재검증으로 Supabase 변경이 재배포 없이 반영되게 한다. */
export const revalidate = 60;

export const metadata: Metadata = {
  title: 'AI 빌더 그룹 — 바이브 코딩 외주',
  description:
    'AI 시대에 최적화된 개발자가 바이브 코딩으로 외주를 해드립니다. 기획부터 개발, 검수까지 검증된 빌더가 끝까지 맡습니다.',
};

// 홈 미리보기 개수 — 디자인 정책값(레이아웃이 이 개수를 전제로 짜여 있음). 늘리려면 홈 레이아웃도 같이 봐야 한다.
const HOME_WORK_LIMIT = 2;
const HOME_INSIGHT_LIMIT = 3;

export default async function HomePage() {
  const [{ works }, posts, faqs, faqCategories, { builders }] = await Promise.all([
    getWorkRepository().getPublished().then((works) => ({ works })),
    getRepository().getPublished(),
    getFaqRepository().getPublished(),
    getFaqCategoryRepository().getActive(),
    getBuilderRepository().getActive().then((builders) => ({ builders })),
  ]);

  const workPreviews = works.slice(0, HOME_WORK_LIMIT).map((w) => ({
    slug: w.slug,
    tag: w.tag || w.category,
    meta: w.year,
    title: w.title,
    desc: w.summary,
    note: w.partner || undefined,
    shotUrl: w.slug,
    shotImg: w.assets[0]?.src ?? '/assets/img/ref-toktokhan.jpg',
  }));

  const insightPreviews = posts.slice(0, HOME_INSIGHT_LIMIT).map((p) => ({
    slug: p.slug,
    title: p.title,
    tag: p.category,
    date: (p.publishedAt ?? p.updatedAt).slice(0, 10).replace(/-/g, '.'),
  }));

  // 홈은 기존 s9 섹션과 같은 모양(카테고리 2개 x 항목 3개)만 미리보기로 보여주고,
  // 전체 목록은 "전체 보기" → /faq 에서 확인한다.
  const faqTopics = buildFaqTopics(faqs, faqCategories, { maxTopics: 2, maxItemsPerTopic: 3 });

  return (
    <HomeView
      workPreviews={workPreviews}
      insightPreviews={insightPreviews}
      faqTopics={faqTopics}
      activeBuilderCount={builders.length}
    />
  );
}
