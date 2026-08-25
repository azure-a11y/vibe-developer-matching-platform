import type { Metadata } from 'next';

import { absoluteUrl } from '@/lib/site';

import ContactRedirect from './redirect';

const CONTACT_TITLE = '프로젝트 문의';
const CONTACT_DESCRIPTION = '부담 없이 남겨주세요. 하루 안에 확인하고 연락드립니다.';

export const metadata: Metadata = {
  title: CONTACT_TITLE,
  description: CONTACT_DESCRIPTION,
  alternates: { canonical: absoluteUrl('/contact') },
  // 이 페이지는 서버에서 렌더할 콘텐츠 없이 클라이언트에서 즉시 홈으로 리다이렉트한다(redirect.tsx).
  // 크롤러 입장에서는 빈 페이지라 색인 대상에서 제외 — 링크 공유 시 미리보기용 OG는 유지한다.
  robots: { index: false, follow: true },
  openGraph: {
    type: 'website',
    title: CONTACT_TITLE,
    description: CONTACT_DESCRIPTION,
    url: absoluteUrl('/contact'),
  },
};

export default function ContactPage() {
  return <ContactRedirect />;
}
