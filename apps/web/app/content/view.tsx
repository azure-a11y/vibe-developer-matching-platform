'use client'

import { useEffect, useMemo, useState } from 'react'

import ContactTrigger from '@/components/ContactTrigger'
import { RibbonSep } from '@/components/RibbonSep'

type PublicVideo = { slug: string; title: string; youtubeId: string; youtubeUrl: string; featured: boolean }

const PAGE_SIZE = 9

export default function ContentView({ videos }: { videos: PublicVideo[] }) {
  const featured = useMemo(() => videos.find(v => v.featured) ?? videos[0], [videos])
  const rest = useMemo(() => videos.filter(v => v.slug !== featured?.slug), [videos, featured])

  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [openVideo, setOpenVideo] = useState<PublicVideo | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q.length === 0 ? rest : rest.filter(v => v.title.toLowerCase().includes(q))
  }, [rest, query])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  useEffect(() => {
    setPage(1)
  }, [query])

  useEffect(() => {
    if (!openVideo) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenVideo(null)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [openVideo])

  const openModal = (video: PublicVideo) => {
    window.track?.('video_modal_open', { slug: video.slug })
    setOpenVideo(video)
  }

  return (
    <main id="main">
      <div className="page-head">
        <div className="wrap">
          <h1><span className="w300">영상으로 보는</span> 우리의 작업</h1>
          <p>김이솝의 AI 가이드 · 똑똑한개발자 · AI 서대표 — 세 채널의 실전 콘텐츠</p>
        </div>
      </div>
      <RibbonSep
        id="rsepContent"
        phrases={[
          '유튜브 워크숍 ✳ AI 튜토리얼 ✳ 라이브 코딩 ✳ 실전 강의 ✳ ',
          'WATCH & LEARN ✳ REAL BUILDS ✳ NO FLUFF ✳ ',
          '김이솝의 AI 가이드 ✳ 똑똑한개발자 ✳ AI 서대표 ✳ ',
        ]}
      />
      <div className="wrap" style={{ padding: '20px 32px 100px' }}>
        {videos.length === 0 ? (
          <p style={{ color: 'var(--muted)' }}>아직 등록된 영상이 없습니다.</p>
        ) : (
          <>
            {featured && (
              <div className="vhero">
                <button type="button" className="vcell feat slot vhero__cell" onClick={() => openModal(featured)}>
                  <img className="vimg" src={`https://i.ytimg.com/vi/${featured.youtubeId}/hqdefault.jpg`} alt={featured.title} fetchPriority="high" decoding="async" />
                  <div className="vshade"></div>
                  <span className="chbadge">대표영상</span>
                  <div className="play"><i>▶</i></div>
                </button>
                <h2 className="vhero__title">{featured.title}</h2>
              </div>
            )}

            {paged.length > 0 && (
              <div className="vg" style={{ marginTop: 20 }}>
                {paged.map(v => (
                  <button type="button" className="vcell slot" onClick={() => openModal(v)} key={v.slug}>
                    <img className="vimg" src={`https://i.ytimg.com/vi/${v.youtubeId}/hqdefault.jpg`} alt={v.title} loading="lazy" decoding="async" />
                    <div className="vshade"></div>
                    <div className="play"><i>▶</i></div>
                    <div className="cap"><b>{v.title}</b></div>
                  </button>
                ))}
              </div>
            )}

            {rest.length > 0 && filtered.length === 0 && (
              <p className="vempty">&ldquo;{query}&rdquo;와(과) 일치하는 영상이 없습니다.</p>
            )}

            {totalPages > 1 && (
              <div className="vpager">
                <button type="button" className="btn btn--ghost" disabled={currentPage === 1} onClick={() => setPage(p => p - 1)}>이전</button>
                <span className="vpager__status">{currentPage} / {totalPages}</span>
                <button type="button" className="btn btn--ghost" disabled={currentPage === totalPages} onClick={() => setPage(p => p + 1)}>다음</button>
              </div>
            )}

            <div className="vsearch-row">
              <input
                type="search"
                className="vsearch"
                placeholder="영상 제목으로 검색"
                aria-label="영상 검색"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>
          </>
        )}

        <div className="cta-banner" style={{ marginTop: 60 }}>
          <div>
            <h3>비슷한 프로젝트를 계획 중이신가요?</h3>
            <p>프로젝트 이야기를 들려주세요.</p>
          </div>
          <ContactTrigger className="btn btn--lime" data-track="cta_click" data-location="content">프로젝트 문의 <span className="arr">→</span></ContactTrigger>
        </div>
      </div>

      {openVideo && (
        <div className="vmodal-backdrop" onClick={() => setOpenVideo(null)}>
          <div className="vmodal" onClick={e => e.stopPropagation()}>
            <button type="button" className="vmodal__close" aria-label="닫기" onClick={() => setOpenVideo(null)}>✕</button>
            <div className="vmodal__frame">
              <iframe
                src={`https://www.youtube.com/embed/${openVideo.youtubeId}?autoplay=1&rel=0`}
                title={openVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="vmodal__foot">
              <b>{openVideo.title}</b>
              <a
                href={openVideo.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => window.track?.('youtube_outbound', { slug: openVideo.slug })}
              >
                유튜브에서 보기 ↗
              </a>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
