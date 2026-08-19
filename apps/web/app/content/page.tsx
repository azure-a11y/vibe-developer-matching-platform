import type { Metadata } from 'next'
import { getVideoRepository } from '@orca/content'

import ContentView from './view'
import './content.css'

/* admin과 web은 별도 Next.js 프로세스라 admin의 revalidatePath()가 이 페이지 캐시를
   지우지 못한다 — 60초 시간 기반 재검증으로 Supabase 변경이 재배포 없이 반영되게 한다. */
export const revalidate = 60

export const metadata: Metadata = {
  title: '콘텐츠 — 영상으로 보는 우리의 작업',
  description: '세 채널에서 매주 실전 바이브 코딩 콘텐츠가 올라옵니다.',
}

export default async function ContentPage() {
  const { videos } = await getVideoRepository().getAll()

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
