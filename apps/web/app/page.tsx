import type { Metadata } from 'next';
import { getRepository, getWorkRepository } from '@orca/content';

import HomeView from './home-view';
import './home.css';

export const metadata: Metadata = {
  title: 'AI 빌더 그룹 — 바이브 코딩 외주',
  description:
    'AI 시대에 최적화된 개발자가 바이브 코딩으로 외주를 해드립니다. 기획부터 개발, 검수까지 검증된 빌더가 끝까지 맡습니다.',
};

export default async function HomePage() {
  const [{ works }, posts] = await Promise.all([
    getWorkRepository().getPublished().then((works) => ({ works })),
    getRepository().getPublished(),
  ]);

  const workPreviews = works.slice(0, 3).map((w) => ({
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

  return <HomeView workPreviews={workPreviews} insightPreviews={insightPreviews} />;
}
