import type { Metadata } from 'next';
import { getFaqCategoryRepository, getFaqRepository } from '@orca/content';

import { buildFaqTopics } from '@/lib/faq';

import FaqView from './view';
import './faq.css';

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
