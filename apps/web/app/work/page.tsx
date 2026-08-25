import type { Metadata } from 'next';
import { getBuilderRepository, getWorkRepository } from '@orca/content';

import { absoluteUrl, siteBrandName } from '@/lib/site';

import WorkView, { type BuilderCard, type WorkCard } from './view';
import './work.css';

/* admin과 web은 별도 Next.js 프로세스라 admin의 revalidatePath()가 이 페이지 캐시를
   지우지 못한다 — 60초 시간 기반 재검증으로 Supabase 변경이 재배포 없이 반영되게 한다. */
export const revalidate = 60;

/* title은 핵심 검색어만 — layout.tsx의 title.template(`%s | 브랜드`)이 하위 세그먼트에는
   자동 적용되어 최종 <title>이 "바이브 코딩 외주 포트폴리오 | AI 빌더 그룹"이 된다.
   반면 openGraph.title은 템플릿이 적용되지 않아 브랜드를 직접 붙인다. */
const WORK_TITLE = '바이브 코딩 외주 포트폴리오';
const WORK_DESCRIPTION = '실제로 수행한 프로젝트와 검증된 빌더를 확인하세요. 30초 매칭으로 맞는 빌더를 추천받을 수도 있습니다.';

export const metadata: Metadata = {
  title: WORK_TITLE,
  description: WORK_DESCRIPTION,
  alternates: { canonical: absoluteUrl('/work') },
  openGraph: {
    type: 'website',
    title: `${WORK_TITLE} | ${siteBrandName}`,
    description: WORK_DESCRIPTION,
    url: absoluteUrl('/work'),
  },
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
