import type { Metadata } from 'next';
import { getFaqCategoryRepository, getFaqRepository } from '@orca/content';

import { buildFaqTopics } from '@/lib/faq';
import { absoluteUrl, siteBrandName } from '@/lib/site';

import FaqView from './view';
import './faq.css';

/* admin과 web은 별도 Next.js 프로세스라 admin의 revalidatePath()가 이 페이지 캐시를
   지우지 못한다 — 60초 시간 기반 재검증으로 Supabase 변경이 재배포 없이 반영되게 한다. */
export const revalidate = 60;

/* title은 핵심 검색어만 — layout.tsx의 title.template이 하위 세그먼트에 자동으로 브랜드를 붙인다.
   openGraph.title은 템플릿이 적용되지 않아 브랜드를 직접 붙인다. */
const FAQ_TITLE = '바이브 코딩 외주 자주 묻는 질문';
const FAQ_DESCRIPTION = '외주 문의부터 진행 방식까지, 가장 많이 받는 질문을 모았습니다.';

export const metadata: Metadata = {
  title: FAQ_TITLE,
  description: FAQ_DESCRIPTION,
  alternates: { canonical: absoluteUrl('/faq') },
  openGraph: {
    type: 'website',
    title: `${FAQ_TITLE} | ${siteBrandName}`,
    description: FAQ_DESCRIPTION,
    url: absoluteUrl('/faq'),
  },
};

export default async function FaqPage() {
  const [faqs, categories] = await Promise.all([
    getFaqRepository().getPublished(),
    getFaqCategoryRepository().getActive(),
  ]);

  const topics = buildFaqTopics(faqs, categories);
  const allItems = topics.flatMap((topic) => topic.items);
  // 실제 발행된 FAQ 데이터로만 구성 — 항목이 없으면 스크립트를 아예 렌더하지 않는다.
  const faqJsonLd =
    allItems.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: allItems.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: { '@type': 'Answer', text: item.answer },
          })),
        }
      : null;

  return (
    <>
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      <FaqView topics={topics} />
    </>
  );
}
