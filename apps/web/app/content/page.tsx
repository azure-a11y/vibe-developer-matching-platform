import type { Metadata } from 'next'
import { getVideoRepository } from '@orca/content'

import { absoluteUrl, siteBrandName } from '@/lib/site'

import ContentView from './view'
import './content.css'

/* admin과 web은 별도 Next.js 프로세스라 admin의 revalidatePath()가 이 페이지 캐시를
   지우지 못한다 — 60초 시간 기반 재검증으로 Supabase 변경이 재배포 없이 반영되게 한다. */
export const revalidate = 60

/* title은 핵심 검색어만 — layout.tsx의 title.template이 하위 세그먼트에 자동으로 브랜드를 붙인다.
   openGraph.title은 템플릿이 적용되지 않아 브랜드를 직접 붙인다. */
const CONTENT_TITLE = '바이브 코딩 실전 영상 콘텐츠'
const CONTENT_DESCRIPTION =
  '김이솝의 AI 가이드 · 똑똑한개발자 · AI 서대표, 세 채널의 실전 바이브 코딩 영상을 한 곳에서 확인하세요.'

export const metadata: Metadata = {
  title: CONTENT_TITLE,
  description: CONTENT_DESCRIPTION,
  alternates: { canonical: absoluteUrl('/content') },
  openGraph: {
    type: 'website',
    title: `${CONTENT_TITLE} | ${siteBrandName}`,
    description: CONTENT_DESCRIPTION,
    url: absoluteUrl('/content'),
  },
}

export default async function ContentPage() {
  const { videos: allVideos } = await getVideoRepository().getAll()
  const videos = allVideos.filter(v => v.status === 'published')

  return (
    <ContentView
      videos={videos.map(v => ({
        slug: v.slug,
        title: v.title,
        youtubeId: v.youtubeId,
        youtubeUrl: v.youtubeUrl,
        featured: v.featured,
      }))}
    />
  )
}
