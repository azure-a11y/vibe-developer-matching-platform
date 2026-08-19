'use client'

import Link from 'next/link'
import { useEffect } from 'react'

import ContactTrigger from '@/components/ContactTrigger'
import { useRibbonFlow, useDock } from '@/components/fx'

export type InsightRow = { slug: string; category: string; categoryLabel: string; img: string; title: string; desc: string; meta: string }

const CATEGORY_ORDER = ['ai-ax', 'guide', 'how', 'project'] as const
const CATEGORY_LABEL: Record<string, string> = {
  'ai-ax': 'AI · AX',
  guide: '발주 가이드',
  how: '일하는 방식',
  project: '프로젝트',
}

export default function InsightView({ articles }: { articles: InsightRow[] }) {
  useRibbonFlow({
    rsI: [
      '발주 가이드 ✳ 일하는 방식 ✳ AI · AX ✳ 프로젝트 비하인드 ✳ ',
      'READ BEFORE YOU BUILD ✳ 외주 전 필독 ✳ ',
      '실패하는 발주에는 패턴이 있다 ✳ INSIGHT WEEKLY ✳ ',
      'AI BUILDER GROUP ✳ 우리의 생각을 공개합니다 ✳ ',
    ],
  }, { rsI: 5500 })
  useDock('sub')

  useEffect(() => {
    const rows = document.querySelectorAll<HTMLElement>('[data-list] .arow')
    const empty = document.querySelector('[data-empty]') as HTMLElement | null
    document.querySelectorAll<HTMLElement>('.cats button').forEach(b => {
      b.addEventListener('click', () => {
        document.querySelectorAll('.cats button').forEach(x => x.classList.remove('on'))
        b.classList.add('on')
        const cat = b.dataset.cat
        let n = 0
        rows.forEach(r => {
          const show = cat === 'all' || r.dataset.c === cat
          r.style.display = show ? '' : 'none'
          if (show) n++
        })
        if (empty) empty.hidden = n > 0
        history.replaceState(null, '', cat === 'all' ? '#' : '#' + cat)
      })
    })
  }, [])

  const counts = CATEGORY_ORDER.map(c => ({ c, n: articles.filter(a => a.category === c).length }))

  return (
    <>
      <main id="main">
        <div className="page-head">
          <div className="wrap">
            <h1><span className="w300">우리의</span> 생각</h1>
            <p>파트너 똑똑한개발자의 실제 인사이트를 함께 발행합니다.</p>
          </div>
        </div>

        <div className="ribbon-sep" aria-hidden="true">
          <svg viewBox="0 0 1600 200" preserveAspectRatio="xMidYMid slice">
            <path id="rsI" d="M -80,90 C 280,130 560,70 860,110 C 1160,150 1360,90 1700,120" fill="none" />
            <use href="#rsI" className="edge" />
            <use href="#rsI" className="lane" />
            <text dy="6">
              <textPath href="#rsI" data-wflow data-unit="4" data-speed="0.02">발주 가이드 ✳ 일하는 방식 ✳ AI · AX ✳ 프로젝트 비하인드 ✳ 발주 가이드 ✳ 일하는 방식 ✳ AI · AX ✳ 프로젝트 비하인드 ✳ </textPath>
            </text>
          </svg>
        </div>

        <div className="wrap ins">
          <nav className="cats" aria-label="카테고리">
            <button className="on" data-cat="all">전체 <span className="cnt">{String(articles.length).padStart(2, '0')}</span></button>
            {counts.map(({ c, n }) => (
              <button key={c} data-cat={c}>{CATEGORY_LABEL[c]} <span className="cnt">{String(n).padStart(2, '0')}</span></button>
            ))}
          </nav>

          <div data-list>
            {articles.map(a => (
              <Link className="arow" href={`/insight/${encodeURIComponent(a.slug)}`} data-c={a.category} key={a.slug}>
                <img className="athumb" src={a.img} alt="" loading="lazy" />
                <div>
                  <h3>{a.title}</h3>
                  <span className="cat">{a.categoryLabel}</span>
                  <p>{a.desc}</p>
                  <span className="meta">{a.meta}</span>
                </div>
              </Link>
            ))}

            <div className="empty" data-empty hidden style={{ marginTop: 24 }}>
              <h3>이 주제의 첫 글을 준비 중입니다</h3>
              <p>다른 카테고리의 글을 먼저 읽어보세요.</p>
            </div>
          </div>
        </div>
      </main>

      <div className="dock" data-dock>
        <div className="dock__txt"><b>검증된 바이브 코딩</b><span>무료 문의 — 부담 없이 남겨보세요</span></div>
        <ContactTrigger className="btn btn--lime btn--sm" data-track="cta_click" data-location="floating">프로젝트 문의 <span className="arr">→</span></ContactTrigger>
        <button className="dock__x" aria-label="닫기" data-dock-x>✕</button>
      </div>
      <button className="dock-open" data-dock-open aria-label="문의 바 다시 열기">💬</button>
    </>
  )
}

export { CATEGORY_LABEL }
