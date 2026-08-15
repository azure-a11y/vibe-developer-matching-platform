import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getBuilderRepository, getWorkRepository } from '@orca/content';

import { absoluteUrl } from '@/lib/site';

import BuilderProfileView from './view';
import '../builder.css';

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const { builders } = await getBuilderRepository().getAll();
  return builders.filter((b) => b.status === 'active').map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const builder = await getBuilderRepository().getBySlug(decodeURIComponent(slug));
  if (!builder || builder.status !== 'active') return {};

  return {
    title: `${builder.displayName} — 빌더 프로필`,
    description: builder.bio,
    alternates: { canonical: absoluteUrl(`/builder/${builder.slug}`) },
    openGraph: {
      type: 'profile',
      title: `${builder.displayName} — 빌더 프로필`,
      description: builder.bio,
      url: absoluteUrl(`/builder/${builder.slug}`),
      ...(builder.avatar ? { images: [{ url: absoluteUrl(builder.avatar.src), alt: builder.avatar.alt }] } : {}),
    },
  };
}

export default async function BuilderProfilePage({ params }: Params) {
  const { slug } = await params;
  const builder = await getBuilderRepository().getBySlug(decodeURIComponent(slug));
  if (!builder || builder.status !== 'active') notFound();

  const [{ builders }, { works }] = await Promise.all([getBuilderRepository().getAll(), getWorkRepository().getAll()]);
  const published = works.filter((w) => w.status === 'published');
  const own = published.filter((w) => w.builderIds.includes(builder.slug));
  const done = own.length;

  const idx = builders.filter((b) => b.status === 'active').findIndex((b) => b.slug === builder.slug);

  return (
    <BuilderProfileView
      b={{
        no: `B—${String(idx + 1).padStart(3, '0')}`,
        name: builder.displayName,
        fname: builder.displayName.replace(/^빌더\s*/, ''),
        role: builder.role,
        bio: builder.bio,
        focus: builder.focus,
        stack: builder.specialties,
        done,
        badgeLabel: builder.badgeLabel,
        isLead: builder.isLead,
        avatar: builder.avatar?.src ?? '/assets/img/avatar-placeholder.png',
        principles: builder.principles,
        projects: own.map((w) => ({
          slug: w.slug,
          title: w.title,
          desc: w.summary,
          tag: w.tag || w.category,
          year: w.year,
          img: w.assets[0]?.src ?? '/assets/img/ref-toktokhan.jpg',
          withTeam: w.partner,
        })),
        others: builders
          .filter((b) => b.status === 'active' && b.slug !== builder.slug)
          .map((b) => ({ slug: b.slug, name: b.displayName, role: b.role, avatar: b.avatar?.src ?? '/assets/img/avatar-placeholder.png' })),
      }}
    />
  );
}
