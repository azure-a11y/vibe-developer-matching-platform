'use client'

import Link from 'next/link'
import { useEffect } from 'react'

export default function ContentView() {
  useEffect(() => {
    document.body.classList.add('dark')
    return () => document.body.classList.remove('dark')
  }, [])

  return (
    <main id="main">
      <div className="page-head">
        <div className="wrap">
          <h1><span className="w300">영상으로 보는</span> 우리의 작업</h1>
          <p>세 채널에서 매주 실전 바이브 코딩 콘텐츠가 올라옵니다.</p>
        </div>
      </div>
      <div className="wrap" style={{ padding: '20px 32px 100px' }}>
        <div className="vgrid">
          <div className="vcell slot" data-track="youtube_outbound" data-slug="featured">
            <img className="vimg" src="https://i.ytimg.com/vi/0dBSo3eDE-E/hqdefault.jpg" alt="똑똑한개발자 — 2025 상반기 워크샵" loading="lazy" />
            <div className="vshade"></div>
            <span className="dur num">15:47</span>
            <div className="play"><i>▶</i></div>
            <div className="cap"><b>2025 똑똑한개발자 상반기 워크샵</b><span>똑똑한개발자 · 오피셜</span></div>
          </div>
          <div className="vside">
            <div className="vcell slot" style={{ aspectRatio: '16/8' }}>
              <img className="vimg" src="https://i.ytimg.com/vi/ZIn53VIic14/hqdefault.jpg" alt="김이솝 — AI 동물 인터뷰 쇼츠 만들기" loading="lazy" />
              <div className="vshade"></div>
              <span className="dur num">7:57</span><div className="play"><i>▶</i></div>
              <div className="cap"><b>AI 동물 인터뷰 쇼츠 만들기 7분만에 끝!</b></div>
            </div>
            <div className="vcell slot" style={{ aspectRatio: '16/8' }}>
              <img className="vimg" src="https://i.ytimg.com/vi/TP6ArUCnt8c/hqdefault.jpg" alt="똑똑한개발자 — 원티드 하이파이브 컨퍼런스" loading="lazy" />
              <div className="vshade"></div>
              <span className="dur num">17:36</span><div className="play"><i>▶</i></div>
              <div className="cap"><b>잘봐 이게 컨퍼런스다 — 똑똑한개발자 × 원티드</b></div>
            </div>
          </div>
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
