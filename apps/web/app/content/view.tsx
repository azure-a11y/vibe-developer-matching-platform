'use client'

import Link from 'next/link'
import { useEffect } from 'react'

type Video = { yt: string; dur: string; title: string; sub: string }

const FEATURED: Video = { yt: '0dBSo3eDE-E', dur: '15:47', title: '2025 똑똑한개발자 상반기 워크샵', sub: '똑똑한개발자 · 오피셜' }
const VIDEOS: Video[] = [
  { yt: 'ZIn53VIic14', dur: '7:57', title: 'AI 동물 인터뷰 쇼츠 만들기 7분만에 끝!', sub: '김이솝의 AI 가이드' },
  { yt: 'TP6ArUCnt8c', dur: '17:36', title: '잘봐 이게 컨퍼런스다 — 똑똑한개발자 × 원티드', sub: '똑똑한개발자' },
  { yt: 'kkbtjKvnS-Q', dur: '11:11', title: '미친 무료기능 총집합! 제미나이 10분만에 마스터', sub: '김이솝의 AI 가이드' },
  { yt: '8uif-Wf65SI', dur: '18:38', title: '12시간씩 클로드 코드 쓰고 깨달은 핵심 꿀팁 20가지', sub: '김이솝의 AI 가이드' },
  { yt: 'LjrO4urq5gI', dur: '23:40', title: '10년차 IT 에이전시 대표가 푸는 개발 외주의 모든 것', sub: 'AI 서대표' },
]

export default function ContentView() {
  /* 유튜브 직행 + UTM (목업: 이동 대신 클릭 트래킹만 남긴다) */
  useEffect(() => {
    document.querySelectorAll<HTMLElement>('[data-yt]').forEach(v => {
      v.addEventListener('click', e => {
        e.preventDefault()
        const utm = '?utm_source=ai-builder-group&utm_medium=content&utm_content=' + v.dataset.utm
        window.track?.('youtube_outbound', { utm })
      })
    })
  }, [])

  return (
    <main id="main">
      <div className="page-head">
        <div className="wrap">
          <h1><span className="w300">영상으로 보는</span> 우리의 작업</h1>
          <p>김이솝의 AI 가이드 · 똑똑한개발자 · AI 서대표 — 세 채널의 실전 콘텐츠</p>
        </div>
      </div>
      <div className="wrap" style={{ padding: '20px 32px 100px' }}>
        <a className="vcell feat slot" href={`https://www.youtube.com/watch?v=${FEATURED.yt}`} data-yt data-utm="featured">
          <img className="vimg" src={`https://i.ytimg.com/vi/${FEATURED.yt}/hqdefault.jpg`} alt={FEATURED.title} fetchPriority="high" decoding="async" />
          <div className="vshade"></div>
          <span className="dur num">{FEATURED.dur}</span>
          <div className="play"><i>▶</i></div>
          <div className="cap"><b>{FEATURED.title}</b><span>{FEATURED.sub}</span></div>
        </a>
        <div className="vg" style={{ marginTop: 20 }}>
          {VIDEOS.map(v => (
            <a className="vcell slot" href={`https://www.youtube.com/watch?v=${v.yt}`} data-yt data-utm={v.yt} key={v.yt}>
              <img className="vimg" src={`https://i.ytimg.com/vi/${v.yt}/hqdefault.jpg`} alt={v.title} loading="lazy" decoding="async" />
              <div className="vshade"></div>
              <span className="dur num">{v.dur}</span>
              <div className="play"><i>▶</i></div>
              <div className="cap"><b>{v.title}</b><span>{v.sub}</span></div>
            </a>
          ))}
        </div>
        <div className="cta-banner" style={{ marginTop: 60 }}>
          <div>
            <h3>비슷한 프로젝트를 계획 중이신가요?</h3>
            <p>프로젝트 이야기를 들려주세요.</p>
          </div>
          <Link className="btn btn--lime" href="/contact" data-track="cta_click" data-location="content">프로젝트 문의 <span className="arr">→</span></Link>
        </div>
      </div>
    </main>
  )
}
