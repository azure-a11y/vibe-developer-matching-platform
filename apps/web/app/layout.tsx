import type { Metadata } from 'next';
import { getSiteSettingsRepository } from '@orca/content';

import { Analytics } from '@/components/Analytics';
import ChannelTalk from '@/components/ChannelTalk';
import Footer from '@/components/Footer';
import Gnb from '@/components/Gnb';
import SiteFx from '@/components/SiteFx';
import {
  bingVerification,
  googleVerification,
  naverVerification,
  siteDescription,
  siteLocale,
  siteName,
  siteUrl,
  twitterSite,
} from '@/lib/site';

import './globals.css';
// 지홍님 1안(artifact/ai-builder-group/05-서비스-nextjs) 디자인 토큰 + 공용 컴포넌트 스타일.
// 원본 파일명은 style.css — Tailwind 기반 globals.css 와 공존시키기 위해 이름만 바꿔 그대로 이식했다.
import './builder-group-design.css';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  applicationName: siteName,
  icons: { icon: '/favicon.svg' },
  openGraph: {
    type: 'website',
    siteName,
    locale: siteLocale.replace('-', '_'),
    url: siteUrl,
  },
  twitter: {
    card: 'summary_large_image',
    ...(twitterSite ? { site: twitterSite } : {}),
  },
  // Search Console / Search Advisor ownership. Each is emitted only when the
  // corresponding env var is set, so an empty .env ships no stray meta tags.
  verification: {
    ...(googleVerification ? { google: googleVerification } : {}),
    ...(bingVerification ? { other: { 'msvalidate.01': bingVerification } } : {}),
  },
  alternates: {
    canonical: siteUrl,
    types: { 'application/rss+xml': `${siteUrl}/rss.xml` },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // 관리자 Settings에서 저장한 값. 미확정(빈 문자열)이면 각 컴포넌트가 기존 기본 표기를 그대로 쓴다.
  const { settings } = await getSiteSettingsRepository().get();

  return (
    <html lang={siteLocale.split('-')[0]}>
      <head>
        {/* Naver Search Advisor has no first-class slot in Next's metadata API. */}
        {naverVerification && <meta name="naver-site-verification" content={naverVerification} />}
        {/* Points LLM crawlers at the machine-readable site summary. */}
        <link rel="llms" href={`${siteUrl}/llms.txt`} />
      </head>
      <body>
        <a className="skip" href="#main">본문 바로가기</a>
        <Gnb brandName={settings.brandName} />
        {children}
        <Footer
          brandName={settings.brandName}
          companyName={settings.companyName}
          ceoName={settings.ceoName}
          businessRegistrationNumber={settings.businessRegistrationNumber}
          operatedBy={settings.operatedBy}
        />
        <SiteFx />
        <Analytics />
        {/* 플러그인 키가 없으면 아무것도 하지 않는다 */}
        <ChannelTalk />
      </body>
    </html>
  );
}
