import type { Metadata } from 'next';

import { Analytics } from '@/components/Analytics';
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
        <Gnb />
        {children}
        <Footer />
        <SiteFx />
        <Analytics />
      </body>
    </html>
  );
}
