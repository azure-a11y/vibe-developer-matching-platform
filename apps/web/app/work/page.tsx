import type { Metadata } from 'next';
import { getBuilderRepository, getWorkRepository } from '@orca/content';

import WorkView, { type BuilderCard, type WorkCard } from './view';
import './work.css';

/* admin과 web은 별도 Next.js 프로세스라 admin의 revalidatePath()가 이 페이지 캐시를
   지우지 못한다 — 60초 시간 기반 재검증으로 Supabase 변경이 재배포 없이 반영되게 한다. */
export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Work — 만드는 사람과, 만든 것들',
  description: '실제로 수행한 프로젝트와 검증된 빌더를 확인하세요. 30초 매칭으로 맞는 빌더를 추천받을 수도 있습니다.',
};

export default async function WorkPage() {
  const [{ works }, { builders }] = await Promise.all([
    getWorkRepository().getAll(),
    getBuilderRepository().getActive().then((builders) => ({ builders })),
  ]);

  const published = works.filter((w) => w.status === 'published');

  const doneCountBySlug = new Map<string, number>();
  for (const w of published) {
    for (const id of w.builderIds) doneCountBySlug.set(id, (doneCountBySlug.get(id) ?? 0) + 1);
  }

  const workCards: WorkCard[] = published.map((w) => ({
    slug: w.slug,
    category: w.category,
    tag: w.tag || w.category,
    year: w.year,
    title: w.title,
    desc: w.summary,
    partner: w.partner,
    stack: w.techStack,
    img: w.assets[0]?.src ?? '/assets/img/ref-toktokhan.jpg',
    alt: w.assets[0]?.alt ?? `${w.title} 화면`,
  }));

  const builderCards: BuilderCard[] = builders.map((b) => ({
    slug: b.slug,
    name: b.displayName,
    role: b.role,
    desc: b.bio,
    stack: b.specialties,
    done: doneCountBySlug.get(b.slug) ?? 0,
    badgeLabel: b.badgeLabel,
    isLead: b.isLead,
    avatar: b.avatar?.src ?? '/assets/img/avatar-placeholder.png',
  }));

  return <WorkView works={workCards} builders={builderCards} />;
}
