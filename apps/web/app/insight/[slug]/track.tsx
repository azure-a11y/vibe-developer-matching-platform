'use client'

import { useEffect } from 'react'

/** insight-detail 진입 시 GA4 스텁 발화 — 원본 insight-detail/view.tsx 의 useEffect 이식. */
export default function InsightDetailTrack({ slug, category }: { slug: string; category: string }) {
  useEffect(() => {
    window.track?.('insight_detail_view', { slug, category, author_type: 'team' })
  }, [slug, category])
  return null
}
