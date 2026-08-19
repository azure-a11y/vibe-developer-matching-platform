import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getBuilderRepository, getWorkRepository } from '@orca/content';

import { absoluteUrl } from '@/lib/site';

import BuilderProfileView from './view';
import '../builder.css';

/* admin과 web은 별도 Next.js 프로세스라 admin의 revalidatePath()가 이 페이지 캐시를
   지우지 못한다 — 60초 시간 기반 재검증으로 Supabase 변경이 재배포 없이 반영되게 한다.
   generateStaticParams에 없는 새 slug는 dynamicParams 기본값(true)에 따라 첫 방문 시
   on-demand로 렌더되고 이후 이 주기로 다시 신선해진다. */
export const revalidate = 60;

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
