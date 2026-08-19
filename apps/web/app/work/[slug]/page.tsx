import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getBuilderRepository, getWorkRepository } from '@orca/content';

import { absoluteUrl } from '@/lib/site';

import WorkDetailView from './view';
import './work-detail.css';

/* admin과 web은 별도 Next.js 프로세스라 admin의 revalidatePath()가 이 페이지 캐시를
   지우지 못한다 — 60초 시간 기반 재검증으로 Supabase 변경이 재배포 없이 반영되게 한다.
   generateStaticParams에 없는 새 slug는 dynamicParams 기본값(true)에 따라 첫 방문 시
   on-demand로 렌더되고 이후 이 주기로 다시 신선해진다 — 그래서 새로 발행한 Work도
   재배포 없이 바로 접근 가능하다. */
export const revalidate = 60;

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const { works } = await getWorkRepository().getAll();
  return works.filter((w) => w.status === 'published').map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const work = await getWorkRepository().getBySlug(decodeURIComponent(slug));
  if (!work || work.status !== 'published') return {};

  return {
    title: work.title,
    description: work.summary,
    alternates: { canonical: absoluteUrl(`/work/${work.slug}`) },
    openGraph: {
      type: 'article',
      title: work.title,
      description: work.summary,
      url: absoluteUrl(`/work/${work.slug}`),
      ...(work.assets[0] ? { images: [{ url: absoluteUrl(work.assets[0].src), alt: work.assets[0].alt }] } : {}),
    },
  };
}

export default async function WorkDetailPage({ params }: Params) {
  const { slug } = await params;
  const work = await getWorkRepository().getBySlug(decodeURIComponent(slug));
  if (!work || work.status !== 'published') notFound();

  const { builders } = await getBuilderRepository().getAll();
  const resolvedBuilders = work.builderIds
    .map((id) => builders.find((b) => b.slug === id))
    .filter((b): b is NonNullable<typeof b> => !!b)
    .map((b) => ({ slug: b.slug, name: b.displayName, role: b.role, avatar: b.avatar?.src ?? '/assets/img/avatar-placeholder.png' }));

  return (
    <WorkDetailView
      work={{
        title: work.title,
        summary: work.summary,
        tag: work.tag || work.category,
        year: work.year,
        period: work.period,
        techStack: work.techStack,
        scope: work.scope,
        problem: work.problem,
        solution: work.solution,
        result: work.result,
        cover: { src: work.assets[0]?.src ?? '/assets/img/ref-toktokhan.jpg', alt: work.assets[0]?.alt ?? work.title },
        builders: resolvedBuilders,
      }}
    />
  );
}
