import type { Metadata } from 'next';
import { getFaqCategoryRepository, getFaqRepository } from '@orca/content';

import { buildFaqTopics } from '@/lib/faq';

import FaqView from './view';
import './faq.css';

/* admin과 web은 별도 Next.js 프로세스라 admin의 revalidatePath()가 이 페이지 캐시를
   지우지 못한다 — 60초 시간 기반 재검증으로 Supabase 변경이 재배포 없이 반영되게 한다. */
export const revalidate = 60;

export const metadata: Metadata = {
  title: 'FAQ — 자주 묻는 질문',
  description: '외주 문의부터 진행 방식까지, 가장 많이 받는 질문을 모았습니다.',
};

export default async function FaqPage() {
  const [faqs, categories] = await Promise.all([
    getFaqRepository().getPublished(),
    getFaqCategoryRepository().getActive(),
  ]);

  return <FaqView topics={buildFaqTopics(faqs, categories)} />;
}
