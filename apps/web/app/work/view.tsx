'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

import ContactTrigger from '@/components/ContactTrigger'
import { useRibbonFlow, useDock } from '@/components/fx'

export type WorkCard = {
  slug: string
  category: string
  tag: string
  year: string
  title: string
  desc: string
  partner: string
  stack: string[]
  img: string
  alt: string
}

export type BuilderCard = {
  slug: string
  name: string
  role: string
  desc: string
  stack: string[]
  done: number
  badgeLabel: string
  isLead: boolean
  avatar: string
}

/**
 * 빠른 매칭 위저드 추천 테이블 — 원본(work/view.tsx MATCH)은 4가지 프로젝트 유형 →
 * 빌더 슬러그 2명 고정 매핑이었다. packages/content 에는 "프로젝트 유형" 개념이
 * 없어 자동 산출할 수 없으므로, 지홍님 1안의 원래 배정을 그대로 유지한다.
 */
const MATCH_SLUGS: Record<string, [string, string]> = {
  landing: ['ria', 'minseo'],
  platform: ['dohyun', 'josh'],
  ai: ['yuna', 'sein'],
  app: ['hajun', 'ria'],
}

export default function WorkView({ works, builders }: { works: WorkCard[]; builders: BuilderCard[] }) {
  const [category, setCategory] = useState('all')
  const [page, setPage] = useState(1)
  const [builderPage, setBuilderPage] = useState(1)
  const filteredWorks = useMemo(() => category === 'all' ? works : works.filter((work) => work.category === category), [category, works])
  const totalPages = Math.max(1, Math.ceil(filteredWorks.length / 6))
  const currentPage = Math.min(page, totalPages)
  const pagedWorks = filteredWorks.slice((currentPage - 1) * 6, currentPage * 6)
  const builderTotalPages = Math.max(1, Math.ceil(builders.length / 8))
  const currentBuilderPage = Math.min(builderPage, builderTotalPages)
  const pagedBuilders = builders.slice((currentBuilderPage - 1) * 8, currentBuilderPage * 8)
  const changePage = (nextPage: number) => {
    setPage(nextPage)
    requestAnimationFrame(() => document.getElementById('works')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }
  const changeBuilderPage = (nextPage: number) => {
    setBuilderPage(nextPage)
    requestAnimationFrame(() => document.getElementById('builders')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }
  useRibbonFlow({
    rsW: [
      'AI 에이전트 ✳ 랜딩 ✳ 플랫폼 ✳ 모바일 앱 ✳ 자동화 ✳ ',
      'REAL PROJECTS ONLY ✳ 실제 서비스 URL 공개 ✳ ',
      '고르기 어려우면 30초 매칭 ✳ FIND YOUR BUILDER ✳ ',
      '기획부터 검수까지 ✳ ONE TEAM ✳ AI BUILDER GROUP ✳ ',
    ],
  }, { rsW: 5000 })
  useDock()

  /* 프로젝트 필터 */
  useEffect(() => {
    const cnt = document.querySelector('[data-cnt]')
    const cards = document.querySelectorAll<HTMLElement>('[data-list] .wcard')
    const empty = document.querySelector('[data-empty]') as HTMLElement | null
    document.querySelectorAll<HTMLElement>('.chips .chip').forEach(ch => {
      ch.addEventListener('click', () => {
        document.querySelectorAll('.chips .chip').forEach(c => c.classList.remove('on'))
        ch.classList.add('on')
        const cat = ch.dataset.cat
        let shown = 0
        cards.forEach(c => {
          const show = cat === 'all' || c.dataset.c === cat
          c.style.display = show ? '' : 'none'
          if (show) shown++
        })
        if (empty) empty.hidden = shown > 0
        if (cnt) cnt.textContent = '( 0' + shown + ' )'
        history.replaceState(null, '', cat === 'all' ? '#' : '#category=' + cat)
      })
    })
  }, [])

  /* 빌더 매칭 위저드 */
  useEffect(() => {
    let picked = 'ai'
    const go = (s: string) => {
      document.querySelectorAll<HTMLElement>('.qstep').forEach(x => x.classList.toggle('on', x.dataset.s === s))
      const done = s === 'r' ? 3 : (parseInt(s, 10) || 1)
      document.querySelectorAll('#prog i').forEach((seg, i) => seg.classList.toggle('done', i < done))
      if (s === 'r') renderPicks()
    }
    const renderPicks = () => {
      const box = document.querySelector('[data-picks]')
      if (!box) return
      const slugs = MATCH_SLUGS[picked] ?? MATCH_SLUGS.ai!
      box.innerHTML = slugs.map((slug, i) => {
        const b = builders.find(x => x.slug === slug)
        if (!b) return ''
        return '<a class="pick" href="/builder/' + b.slug + '">'
          + '<img src="' + b.avatar + '" alt="빌더 ' + b.name + ' 프로필 사진">'
          + '<div><b>' + b.name + '</b><span>' + b.role + ' · ' + b.done + '건 수행</span></div>'
          + '<span class="why">' + (i === 0 ? 'BEST' : '추천') + '</span></a>'
      }).join('')
    }
    document.querySelectorAll<HTMLElement>('.opt').forEach(b => {
      b.addEventListener('click', () => {
        if (b.dataset.pick) picked = b.dataset.pick
        go(b.dataset.next || '1')
      })
    })
    document.querySelectorAll<HTMLElement>('.qback').forEach(b => {
      b.addEventListener('click', () => go(b.dataset.back || '1'))
    })
    document.querySelector('.redo')?.addEventListener('click', () => go('1'))
  }, [builders])

  return (
    <>
      <main id="main">
        <div className="page-head page-head--work">
          <div className="wrap page-head__row">
            <div className="page-head__text">
              <span className="page-head__eyebrow">Our Work</span>
              <h1><span className="w300">만드는 사람과,</span> 만든 것들</h1>
              <span className="page-head__rule" aria-hidden="true"></span>
              <p>추천받고 싶다면 30초 매칭으로, 직접 둘러보고 싶다면 작업물부터. 두 길 모두 열어두었습니다.</p>
            </div>
            <div className="head-stats">
              <div><b className="num">{builders.length}</b><span>검증된 빌더</span></div>
              <div><b className="num">{String(works.length).padStart(2, '0')}</b><span>공개 프로젝트</span></div>
              <div><b className="num">4.9</b><span>평균 만족도</span></div>
            </div>
          </div>
        </div>

        <div className="ribbon-sep" aria-hidden="true">
          <svg viewBox="0 0 1600 220" preserveAspectRatio="xMidYMid slice">
            <path id="rsW" d="M -80,150 C 240,90 420,190 720,150 C 1020,110 1220,170 1420,120 C 1520,95 1600,100 1700,80" fill="none" />
            <use href="#rsW" className="edge2" />
            <use href="#rsW" className="lane2" />
            <text className="t2" dy="5">
              <textPath href="#rsW" data-wflow data-unit="5" data-speed="0.024" data-dir="rev">AI 에이전트 ✳ 랜딩 ✳ 플랫폼 ✳ 모바일 앱 ✳ 자동화 ✳ AI 에이전트 ✳ 랜딩 ✳ 플랫폼 ✳ 모바일 앱 ✳ 자동화 ✳ </textPath>
            </text>
          </svg>
        </div>

        <div className="wrap panels">

          <section className="panel panel--sand" id="works">
            <div className="panel__head">
              <div>
                <div className="panel__no"><i>01</i>직접 탐색</div>
                <h2>수행 프로젝트 <span className="head-cnt num" data-cnt>( {String(works.length).padStart(2, '0')} )</span></h2>
                <p className="panel__sub">비슷한 결과물을 먼저 찾으세요 — 담당 빌더가 함께 보입니다.</p>
              </div>
              <div className="panel__side">고르기 어렵다면 → <a href="#match">03 빠른 매칭 ↓</a></div>
            </div>

            <div className="chips" role="tablist" style={{ margin: '0 0 34px' }}>
              {['all', 'aiax', 'commerce', 'platform', 'finance'].map((cat) => <button className={`chip ${category === cat ? 'on' : ''}`} data-cat={cat} type="button" key={cat} onClick={() => { setCategory(cat); setPage(1) }}>{cat === 'all' ? '전체' : cat === 'aiax' ? 'AI · AX' : cat === 'platform' ? 'SaaS · Admin' : cat.slice(0, 1).toUpperCase() + cat.slice(1)}</button>)}
            </div>

            <div className="stage">
              <div className="stage__bg" aria-hidden="true">
                {works.slice(0, 4).map(p => (
                  <img key={p.slug} src={p.img} alt="" loading="lazy" />
                ))}
              </div>
              <div className="pxg" data-list>
                {pagedWorks.map((p, i) => (
                  <Link
                    className="wcard rv on"
                    style={{ transitionDelay: `${Math.min(i, 6) * 70}ms` }}
                    href={`/work/${encodeURIComponent(p.slug)}`}
                    data-c={p.category}
                    key={p.slug}
                  >
                    <div className="slot mask">
                      <img className="cover" src={p.img} alt={p.alt} loading="lazy" />
                    </div>
                    <div className="meta">
                      <div className="mrow"><span className="tag">{p.tag}</span><span className="yr num">{p.year}</span></div>
                      <h3>{p.title}</h3>
                      <p>{p.desc}</p>
                      {p.stack.length > 0 && (
                        <div className="wcard__stack">
                          {p.stack.slice(0, 3).map(s => <i key={s}>{s}</i>)}
                        </div>
                      )}
                      <div className="wcard__foot">
                        {p.partner && <div className="builders">{p.partner}</div>}
                        <span className="wcard__cta">View Project <span className="arr">→</span></span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              {totalPages > 1 && <nav className="list-pager" aria-label="Work 페이지 이동">
                <button type="button" disabled={currentPage === 1} onClick={() => changePage(currentPage - 1)}>이전</button>
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => <button className={pageNumber === currentPage ? 'on' : ''} type="button" aria-current={pageNumber === currentPage ? 'page' : undefined} key={pageNumber} onClick={() => changePage(pageNumber)}>{pageNumber}</button>)}
                <button type="button" disabled={currentPage === totalPages} onClick={() => changePage(currentPage + 1)}>다음</button>
              </nav>}
            </div>

            <nav className="list-pager work-list-pager" aria-label="Work 페이지 이동">
              <button type="button" disabled={currentPage === 1} onClick={() => changePage(currentPage - 1)}>이전</button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => <button className={pageNumber === currentPage ? 'on' : ''} type="button" aria-current={pageNumber === currentPage ? 'page' : undefined} key={pageNumber} onClick={() => changePage(pageNumber)}>{pageNumber}</button>)}
              <button type="button" disabled={currentPage === totalPages} onClick={() => changePage(currentPage + 1)}>다음</button>
            </nav>
            <div className="empty" data-empty hidden={filteredWorks.length > 0}>
              <h3>이 분야의 첫 프로젝트가 곧 공개됩니다</h3>
              <p>고민 중인 프로젝트가 이 분야라면, 30초 매칭으로 알려주세요.</p>
              <a className="btn btn--ghost btn--sm" href="#match">30초 매칭 받기 ↓</a>
              <ContactTrigger className="btn btn--ink btn--sm">문의하기 <span className="arr">→</span></ContactTrigger>
            </div>
          </section>

          <section className="panel panel--tint" id="builders">
            <div className="panel__head">
              <div>
                <div className="panel__no"><i>02</i>만드는 사람들</div>
                <h2>검증된 빌더 <span className="head-cnt num">( {builders.length} )</span></h2>
                <p className="panel__sub">카드를 누르면 빌더의 프로필과 수행한 작업물을 볼 수 있습니다.</p>
              </div>
              <div className="panel__side">누구에게 맡길지 고민된다면 → <a href="#match">03 빠른 매칭 ↓</a></div>
            </div>
            <div className="bld__grid">
              {pagedBuilders.map(b => (
                <Link className="bcard rv on" href={`/builder/${b.slug}`} data-track="builder_click" data-slug={b.slug} key={b.slug}>
                  <div className="slot mask">
                    <img src={b.avatar} alt={`${b.name} 프로필 사진`} />
                    {b.badgeLabel && <span className={b.isLead ? 'lv lv--lead' : 'lv lv--new'}>{b.badgeLabel}</span>}
                    <div className="ct"><span>수행 <span className="num">{b.done}</span>건</span><span className="go">Profile →</span></div>
                  </div>
                  <div className="meta">
                    <b>{b.name}</b>
                    <span className="role">{b.role}</span>
                    <p>{b.desc}</p>
                    <div className="stk">{b.stack.slice(0, 2).map(s => <i key={s}>{s}</i>)}</div>
                  </div>
                </Link>
              ))}
            </div>
            <p className="bld-note">※ <b>✳ 이달의 빌더</b>는 매달 고객 평가로 새로 선정합니다 · <b>NEW</b>는 합류 90일 이내의 빌더입니다</p>
          </section>

            {builderTotalPages > 1 && <nav className="list-pager" aria-label="Builder 페이지 이동">
              <button type="button" disabled={currentBuilderPage === 1} onClick={() => changeBuilderPage(currentBuilderPage - 1)}>이전</button>
              {Array.from({ length: builderTotalPages }, (_, index) => index + 1).map((pageNumber) => <button className={pageNumber === currentBuilderPage ? 'on' : ''} type="button" aria-current={pageNumber === currentBuilderPage ? 'page' : undefined} key={pageNumber} onClick={() => changeBuilderPage(pageNumber)}>{pageNumber}</button>)}
              <button type="button" disabled={currentBuilderPage === builderTotalPages} onClick={() => changeBuilderPage(currentBuilderPage + 1)}>다음</button>
            </nav>}

          <section className="panel panel--tint" id="match">
            <div className="panel__head">
              <div>
                <div className="panel__no"><i>03</i>빠른 매칭</div>
                <h2>딱 맞는 빌더를 찾아드려요</h2>
                <p className="panel__sub">세 번만 고르면 프로젝트에 맞는 빌더 2명을 추천해 드립니다.</p>
              </div>
              <div className="panel__side">직접 고르고 싶다면 → <a href="#works">01 작업물 탐색 ↑</a></div>
            </div>

            <div className="quiz">
              <div className="quiz__head">
                <b><em>✳</em> 빌더 매칭</b>
                <span className="time">약 30초</span>
              </div>
              <div className="prog" id="prog"><i className="done"></i><i></i><i></i></div>
              <div className="quiz__body">
                <div className="qstep on" data-s="1">
                  <p className="qq"><small>질문 1 / 3</small>무엇을 만드시나요?</p>
                  <div className="opts">
                    <button className="opt" data-next="2" data-pick="landing">랜딩 페이지</button>
                    <button className="opt" data-next="2" data-pick="platform">웹 서비스 · 플랫폼</button>
                    <button className="opt" data-next="2" data-pick="ai">AI 기능 · 챗봇</button>
                    <button className="opt" data-next="2" data-pick="app">모바일 앱</button>
                  </div>
                </div>
                <div className="qstep" data-s="2">
                  <p className="qq"><small>질문 2 / 3</small>예산 범위는요?</p>
                  <div className="opts">
                    <button className="opt" data-next="3">500만 원 이하</button>
                    <button className="opt" data-next="3">500~1,500만 원</button>
                    <button className="opt" data-next="3">1,500만 원 이상</button>
                    <button className="opt" data-next="3">아직 모르겠어요</button>
                  </div>
                  <button className="qback" type="button" data-back="1">이전 질문</button>
                </div>
                <div className="qstep" data-s="3">
                  <p className="qq"><small>질문 3 / 3</small>언제 시작하고 싶으세요?</p>
                  <div className="opts">
                    <button className="opt" data-next="r">최대한 빨리</button>
                    <button className="opt" data-next="r">한 달 안</button>
                    <button className="opt" data-next="r">일정 협의 필요</button>
                  </div>
                  <button className="qback" type="button" data-back="2">이전 질문</button>
                </div>
                <div className="qstep qres" data-s="r">
                  <p className="lead">조건에 맞는 빌더 <em>2명</em>을 찾았어요. 문의를 남기면 이 구성으로 제안을 드립니다.</p>
                  <div className="picks" data-picks></div>
                  <ContactTrigger className="btn btn--ink" data-track="cta_click" data-location="work_match">이 구성으로 문의하기 <span className="arr">→</span></ContactTrigger>
                  <button className="qback" type="button" data-back="3">이전 질문</button>
                  <button className="redo" type="button">처음부터 다시</button>
                </div>
              </div>
            </div>
          </section>
        </div>

        <section>
          <div className="wrap">
            <div className="cta-banner">
              <div>
                <h3>비슷한 프로젝트를 계획 중이신가요?</h3>
                <p>프로젝트 이야기를 들려주세요. 맞는 빌더를 배정해 드립니다.</p>
              </div>
              <ContactTrigger className="btn btn--lime" data-track="cta_click" data-location="work_detail">프로젝트 문의 <span className="arr">→</span></ContactTrigger>
            </div>
          </div>
        </section>
      </main>

      <div className="dock" data-dock>
        <div className="dock__txt"><b>검증된 바이브 코딩</b><span>부담 없이 문의를 남겨보세요</span></div>
        <ContactTrigger className="btn btn--lime btn--sm" data-track="cta_click" data-location="floating">프로젝트 문의 <span className="arr">→</span></ContactTrigger>
        <button className="dock__x" aria-label="닫기" data-dock-x>✕</button>
      </div>
      <button className="dock-open" data-dock-open aria-label="문의 바 다시 열기">💬</button>
    </>
  )
}
