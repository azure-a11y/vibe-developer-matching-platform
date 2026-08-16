/**
 * Site-wide configuration read from the environment.
 *
 * Every value is optional: an unset verification code or GA4 id simply means
 * that integration is off, never a crash. That keeps the template runnable
 * with an empty `.env`.
 */

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');

export const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? 'Orca Blog';

export const siteDescription =
  process.env.NEXT_PUBLIC_SITE_DESCRIPTION ?? 'AI 에이전트 팀이 기획하고, 검수하고, 발행하는 블로그.';

export const siteLocale = process.env.NEXT_PUBLIC_SITE_LOCALE ?? 'ko-KR';

/** Google Analytics 4 measurement id, e.g. `G-XXXXXXXXXX`. */
export const ga4Id = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID?.trim() || undefined;

/** Google Search Console `google-site-verification` content value. */
export const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim() || undefined;

/** Naver Search Advisor `naver-site-verification` content value. */
export const naverVerification = process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION?.trim() || undefined;

/** Bing Webmaster Tools `msvalidate.01` content value. */
export const bingVerification = process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION?.trim() || undefined;

export const twitterSite = process.env.NEXT_PUBLIC_TWITTER_SITE?.trim() || undefined;

/** 채널톡 플러그인 키. 비어 있으면 상담 위젯이 로드되지 않는다 — 연동 전에도 사이트는 그대로 동작해야 한다. */
export const channelPluginKey = process.env.NEXT_PUBLIC_CHANNEL_PLUGIN_KEY?.trim() || '';

/** pluug 폼 iframe 에 붙이는 utm_source. "우리 사이트에서 왔다"는 뜻이라 고정값이다. */
export const pluugUtmSource = process.env.NEXT_PUBLIC_PLUUG_UTM_SOURCE?.trim() || 'ai-builder-group';

export function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//.test(pathOrUrl)) return pathOrUrl;
  return `${siteUrl}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;
}

/**
 * pluug 문의 폼(관리자 Settings 의 pluugFormUrl) 주소에 유입 정보를 붙인다.
 * 클라이언트에서만 호출할 것 — 유입 utm_source 를 location 에서 읽기 때문에
 * 서버 렌더 결과와 달라져 하이드레이션이 어긋난다.
 */
export function buildPluugEmbedUrl(pluugFormUrl: string, section: string): string {
  if (!pluugFormUrl) return '';
  let u: URL;
  try {
    u = new URL(pluugFormUrl);
  } catch {
    return '';
  }
  u.searchParams.set('utm_source', pluugUtmSource);
  u.searchParams.set('utm_medium', 'website');
  u.searchParams.set('entry_section', section);
  if (typeof window !== 'undefined') {
    const inbound = new URLSearchParams(window.location.search).get('utm_source');
    if (inbound) u.searchParams.set('entry_utm_source', inbound);
  }
  return u.toString();
}
