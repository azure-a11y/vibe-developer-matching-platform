import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getBuilderRepository, getWorkRepository } from '@orca/content';

import { absoluteUrl } from '@/lib/site';

import WorkDetailView from './view';
import './work-detail.css';

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
