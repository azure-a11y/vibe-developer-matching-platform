'use client'

import Link from 'next/link'
import { useEffect, type CSSProperties, type ReactNode } from 'react'

import ContactTrigger from '@/components/ContactTrigger'
import { useReplayOnView } from '@/components/fx'
import { RibbonSep } from '@/components/RibbonSep'
import type { FaqTopic } from '@/lib/faq'

/* 스테퍼 점등 순서를 CSS 변수로 넘긴다 (CSS 커스텀 속성이라 캐스트가 필요하다) */
const step = (i: number) => ({ '--i': i }) as CSSProperties

/* ── 히어로 스트림 블록 데이터 (원본 index.html 열 1·2·3, 6블록 ×2 루프) ── */
type Block =
  | { kind: 'shot'; h: number; url: string; img: string; alt: string }
  | { kind: 'duo'; h: number; a: string; b: string }

const shot = (h: number, url: string, img: string, alt: string): Block => ({ kind: 'shot', h, url, img, alt })
const duo = (h: number, a: string, b: string): Block => ({ kind: 'duo', h, a, b })

const COL1: Block[] = [
  shot(196, 'toktokhan.dev', 'ref-toktokhan.jpg', '똑똑한개발자 메인 화면'),
  duo(234, 'm-kream.png', 'm-codle.png'),
  shot(200, 'toss.im', 'ref-toss.jpg', '토스 메인 화면'),
  duo(228, 'm-kakaobank.png', 'm-29cm.png'),
  shot(198, 'kakaobank.com', 'ref-kakaobank.jpg', '카카오뱅크 서비스 화면'),
  shot(192, 'daangn.com', 'ref-daangn.jpg', '당근 메인 화면'),
]
const COL2: Block[] = [
  shot(200, 'builderschool.ai', 'ref-builderschool.jpg', 'AI빌더스쿨 메인 화면'),
  duo(230, 'm-builderschool.png', 'm-aidt.png'),
  shot(196, '29cm.co.kr', 'ref-29cm.jpg', '29CM 메인 화면'),
  shot(198, 'ai.codle.io', 'ref-codle.jpg', '코들 메인 화면'),
  shot(194, 'zigbang.com', 'ref-zigbang.jpg', '직방 메인 화면'),
  duo(232, 'm-29cm.png', 'm-kream.png'),
]
const COL3: Block[] = [
  shot(176, 'zigbang.com', 'ref-zigbang.jpg', '직방 메인 화면'),
  duo(208, 'm-aidt.png', 'm-kakaobank.png'),
  shot(172, 'daangn.com', 'ref-daangn.jpg', '당근 메인 화면'),
  shot(176, '29cm.co.kr', 'ref-29cm.jpg', '29CM 메인 화면'),
  duo(206, 'm-codle.png', 'm-builderschool.png'),
  shot(176, 'toss.im', 'ref-toss.jpg', '토스 메인 화면'),
]

function StreamBlock({ b }: { b: Block }) {
  if (b.kind === 'shot') {
    return (
      <div className="sc slot" style={{ height: b.h }}>
        <div className="bf">
          <div className="bf__bar"><i></i><i></i><i></i><span className="url">{b.url}</span></div>
          <img className="shot" src={`/assets/img/${b.img}`} alt={b.alt} />
        </div>
        <div className="shotshade"></div><span className="lb">Sample · 교체 예정</span>
      </div>
    )
  }
  return (
    <div className="sc sc--duo slot" style={{ height: b.h }}>
      <img src={`/assets/img/${b.a}`} alt="" />
      <img src={`/assets/img/${b.b}`} alt="" />
      <span className="lb">Mobile · Sample</span>
    </div>
  )
}

function StreamCol({ blocks, cls }: { blocks: Block[]; cls: string }) {
  return (
    <div className={cls}>
      <div className="col-in">
        {[...blocks, ...blocks].map((b, i) => <StreamBlock key={i} b={b} />)}
      </div>
    </div>
  )
}

/* ── S2 "이런 곳은 조심하세요" — 항목 데이터 + 라인 아이콘 ── */
type S2Item = {
  id: string
  cls: 'warn--a' | 'warn--b' | 'warn--c'
  label: string
  title: ReactNode
  lead: string
  point: string
  fig: ReactNode
}

const S2_ITEMS: S2Item[] = [
  {
    id: 'mock',
    cls: 'warn--a',
    label: '가짜 포트폴리오',
    title: <>포트폴리오 수백 개,<br />전부 목업인 업체</>,
    lead: '실서비스 URL을 물어보세요.',
    point: '답 못 하면 목업입니다.',
    fig: (
      <div className="w-fig w-fig1">
        <div className="w-fig1__shot">
          <span className="dots"><i></i><i></i><i></i></span>
          <img src="/assets/img/s2-real-site.jpg" alt="" />
        </div>
      </div>
    ),
  },
  {
    id: 'copy',
    cls: 'warn--b',
    label: '복붙 애니메이션',
    title: <>모든 섹션이 똑같이<br />움직이는 사이트</>,
    lead: '전부 같은 애니메이션이면 —',
    point: '한 번에 뽑은 겁니다.',
    fig: <div className="w-fig w-fig2"><i></i><i></i><i></i></div>,
  },
  {
    id: 'price',
    cls: 'warn--c',
    label: '반값 외주',
    title: <>싼 가격만 내세우는<br />반값 외주</>,
    lead: '반값의 결말은',
    point: '다시 만드는 비용입니다.',
    fig: <div className="w-fig w-fig3"><span className="tagp"><s>-50%</s></span></div>,
  },
]

function S2Icon({ id }: { id: string }) {
  if (id === 'mock') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="4.5" width="18" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
        <line x1="3" y1="8.7" x2="21" y2="8.7" stroke="currentColor" strokeWidth="1.6" />
        <line x1="7" y1="12.6" x2="15.5" y2="12.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeDasharray="1.6 2.6" />
        <line x1="7" y1="15.6" x2="12" y2="15.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeDasharray="1.6 2.6" />
      </svg>
    )
  }
  if (id === 'copy') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="8" y="8" width="12" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
        <path d="M4.5 15.5v-9a2.5 2.5 0 0 1 2.5-2.5h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12.7 3.5h4.8a2 2 0 0 1 2 2v4.8a2 2 0 0 1-.59 1.41l-8 8a2 2 0 0 1-2.82 0l-4.8-4.8a2 2 0 0 1 0-2.82l8-8a2 2 0 0 1 1.41-.59Z" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="16.1" cy="7.9" r="1.25" fill="currentColor" />
      <line x1="6" y1="18" x2="18" y2="6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

/* ── 라우렐 잎 SVG ── */
function Lv({ r = false }: { r?: boolean }) {
  return (
    <svg className={r ? 'lv lv--r' : 'lv'} viewBox="0 0 36 76" aria-hidden="true">
      <path d="M31 70 C15 60 9 44 12 22" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <g fill="currentColor">
        <ellipse cx="24.5" cy="66" rx="8" ry="3" transform="rotate(128 24.5 66)" />
        <ellipse cx="16.3" cy="56.5" rx="8" ry="3" transform="rotate(142 16.3 56.5)" />
        <ellipse cx="10.8" cy="45" rx="8" ry="3" transform="rotate(158 10.8 45)" />
        <ellipse cx="8" cy="32.4" rx="8" ry="3" transform="rotate(174 8 32.4)" />
        <ellipse cx="8.1" cy="19.8" rx="7.6" ry="2.8" transform="rotate(190 8.1 19.8)" />
        <ellipse cx="10.9" cy="8.2" rx="6.8" ry="2.6" transform="rotate(206 10.9 8.2)" />
        <ellipse cx="14" cy="3" rx="5" ry="2.1" transform="rotate(230 14 3)" />
      </g>
    </svg>
  )
}

const LAURELS = [
  { box: 'laurbox rv', cls: 'laur laur--blue', top: 'YOUTUBE CREATOR', big: '8.4만', sub: 'SUBSCRIBERS' },
  { box: 'laurbox rv d1', cls: 'laur laur--gold laur--wide', top: 'SELECTED BY', big: 'FORBES KOREA', sub: '30 UNDER 30' },
  { box: 'laurbox rv d2', cls: 'laur laur--ink', top: 'KOREA MARKET', big: 'No.1', sub: 'FREELANCER PLATFORM' },
]

/* ── 브랜드 로고월 ── */
const BRANDS1: [string, string][] = [
  ['asiana', '아시아나IDT'], ['appsintoss', 'apps in toss'], ['bluegarage', 'BLUE GARAGE'],
  ['nhnacademy', 'NHN ACADEMY'], ['woowa', '우아한형제들'], ['kakao', 'kakao'], ['tmoney', 'Tmoney'],
  ['kt', 'kt'], ['hanssem', '한샘'], ['hhi', '현대중공업'], ['aerok', 'Aerok'], ['skbio', 'SK바이오사이언스'],
]
const BRANDS2: [string, string][] = [
  ['shinhan', '신한은행'], ['nice', 'NICE정보통신'], ['linegames', 'LINE GAMES'], ['ksoe', '한국조선해양'],
  ['fastfive', 'FASTFIVE'], ['millie', '밀리의서재'], ['kyobo', '교보문고'], ['kmong', '크몽'],
  ['riiid', 'Riiid'], ['sm', 'SM Entertainment'], ['krafton', 'KRAFTON'],
]

function Bset({ brands }: { brands: [string, string][] }) {
  return (
    <div className="bset">
      {brands.map(([file, alt]) => (
        <img key={file} src={`/assets/img/brands/${file}.png`} alt={alt} loading="lazy" />
      ))}
    </div>
  )
}

type WorkPreview = { slug: string; tag: string; meta: string; title: string; desc?: string; note?: string; shotUrl: string; shotImg: string }
type InsightPreview = { slug: string; title: string; tag: string; date: string }

function WorkCard({ w, index }: { w: WorkPreview; index: number }) {
  return (
    <Link
      className={`wcard rv${index === 1 ? ' d2' : ''}`}
      href={`/work/${w.slug}`}
      data-track="work_card"
    >
      <div className="slot mask">
        <div className="bf"><div className="bf__bar"><i></i><i></i><i></i><span className="url">{w.shotUrl}</span></div><img className="shot" src={w.shotImg} alt="" /></div>
        <div className="par"></div>
        <div className="slot__spec"><b>Asset — Work Cover</b><span>실서비스 메인 화면 (브라우저 프레임)</span><em>1520×1045px · 16:11 @2x</em></div>
      </div>
      <div className="meta">
        <div className="mrow"><span className="tag">{w.tag}</span><span className="yr num">{w.meta}</span></div>
        <h3>{w.title}</h3>
        {w.desc && <p>{w.desc}</p>}
        {w.note && <div className="builders">{w.note}</div>}
      </div>
    </Link>
  )
}

export default function HomeView({
  workPreviews,
  insightPreviews,
  faqTopics,
  activeBuilderCount,
}: {
  workPreviews: WorkPreview[]
  insightPreviews: InsightPreview[]
  faqTopics: FaqTopic[]
  activeBuilderCount: number
}) {
  /* 0.85 — 스테퍼가 화면에 거의 다 들어왔을 때 시작한다. 낮게 잡으면 아직 화면 끄트머리에
     있을 때 재생이 끝나서, 정작 눈이 갔을 땐 이미 다 켜져 있다. 스탯 숫자 펄스(s4x__stats)도
     같은 스크롤-재생 트리거를 공유한다. */
  useReplayOnView('[data-stepflow], [data-numpulse]', 'lit', 0.85)

  /* S2 "이런 곳은 조심하세요" — IntersectionObserver 기반 활성 항목 추적 + 클릭 이동 (휠 캡처 없음) */
  useEffect(() => {
    const items = Array.from(document.querySelectorAll<HTMLElement>('[data-s2item]'))
    const steps = Array.from(document.querySelectorAll<HTMLElement>('[data-s2step]'))
    const now = document.querySelector('[data-s2now]')
    if (!items.length) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let current = 0
    const setActive = (i: number) => {
      current = i
      items.forEach((el, j) => el.classList.toggle('active', j === i))
      steps.forEach((el, j) => el.setAttribute('aria-current', String(j === i)))
      if (now) now.textContent = '0' + (i + 1)
    }
    setActive(0)

    const io = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return
          const idx = Number((entry.target as HTMLElement).dataset.s2item)
          if (!Number.isNaN(idx) && idx !== current) setActive(idx)
        })
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    )
    items.forEach(el => io.observe(el))

    const onStepClick = (e: Event) => {
      const idx = Number((e.currentTarget as HTMLElement).dataset.s2step)
      const target = items[idx]
      if (target) target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' })
    }
    steps.forEach(btn => btn.addEventListener('click', onStepClick))

    return () => {
      io.disconnect()
      steps.forEach(btn => btn.removeEventListener('click', onStepClick))
    }
  }, [])

  /* S3 자동 순환 · S5 탭 · 모바일 캐러셀 · S6 패럴랙스 · S8 퍼짐 전환 · S9 FAQ */
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const mobile = window.matchMedia('(max-width: 900px)')
    const cleanups: (() => void)[] = []

    const steps = document.querySelectorAll('[data-steps] .step')
    const s3now = document.querySelector('[data-s3now]')
    if (steps.length) {
      let si = 0
      let s3timer = 0
      const setStep = (n: number) => {
        si = n
        steps.forEach((s, j) => s.classList.toggle('on', j === n))
        if (s3now) s3now.textContent = '0' + (n + 1)
      }
      const startS3 = () => { s3timer = window.setInterval(() => setStep((si + 1) % steps.length), 3600) }
      const stopS3 = () => clearInterval(s3timer)
      startS3()
      const sg = document.querySelector('[data-steps]') as HTMLElement
      sg.addEventListener('mouseenter', stopS3)
      sg.addEventListener('mouseleave', startS3)
      steps.forEach((s, j) => s.addEventListener('click', () => setStep(j)))
      cleanups.push(() => { clearInterval(s3timer); sg.removeEventListener('mouseenter', stopS3); sg.removeEventListener('mouseleave', startS3) })
    }

    document.querySelectorAll('.mcard').forEach(c => {
      c.addEventListener('click', () => { if (mobile.matches) c.classList.toggle('open') })
    })

    const cmq = window.matchMedia('(max-width: 960px)')
    const isAtSnap = (grid: Element, card: Element) => {
      const pad = parseFloat(getComputedStyle(grid).scrollPaddingLeft) || 0
      return Math.abs(card.getBoundingClientRect().left - grid.getBoundingClientRect().left - pad) < 24
    }
    const slideTo = (card: Element) => card.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' })
    const s4grid = document.querySelector('.s4x__grid')
    if (s4grid) {
      const s4cards = Array.prototype.slice.call(s4grid.querySelectorAll('.s4x-card')) as Element[]
      s4cards.forEach((card, i) => {
        card.addEventListener('click', () => {
          if (!cmq.matches) return
          const next = s4cards[(i + 1) % s4cards.length]
          slideTo(isAtSnap(s4grid, card) && next ? next : card)
        })
      })
    }
    const s5grid = document.querySelector('.s5 .g3')
    if (s5grid) {
      const s5tap = (e: Event) => {
        if (!cmq.matches) return
        const card = (e.target as Element).closest('.mcard')
        if (!card || isAtSnap(s5grid, card)) return
        e.stopPropagation()
        slideTo(card)
      }
      s5grid.addEventListener('click', s5tap, true)
      cleanups.push(() => s5grid.removeEventListener('click', s5tap, true))
    }

    const pars = document.querySelectorAll<HTMLElement>('.wcard .par')
    const parUpdate = () => {
      if (reduced || mobile.matches) return
      pars.forEach(p => {
        const slot = p.closest('.slot')
        if (!slot) return
        const r = slot.getBoundingClientRect()
        const t = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight
        p.style.transform = 'translateY(' + t * 24 + 'px)'
      })
    }
    window.addEventListener('scroll', parUpdate, { passive: true })
    parUpdate()
    cleanups.push(() => window.removeEventListener('scroll', parUpdate))

    const ov = document.querySelector('[data-ov]') as HTMLElement | null
    const goTimers: number[] = []
    document.querySelectorAll('[data-expand]').forEach(v => {
      v.addEventListener('click', () => {
        window.track?.('youtube_outbound', { utm: 'utm_source=builder-group&utm_medium=content' })
        if (reduced || !ov) { window.location.href = '/content'; return }
        const r = v.getBoundingClientRect()
        ov.style.cssText = 'left:' + r.left + 'px;top:' + r.top + 'px;width:' + r.width + 'px;height:' + r.height + 'px;opacity:1;'
        requestAnimationFrame(() => {
          ov.classList.add('go')
          ov.style.cssText += 'left:0;top:0;width:100vw;height:100vh;'
        })
        goTimers.push(window.setTimeout(() => { window.location.href = '/content' }, 520))
      })
    })
    cleanups.push(() => goTimers.forEach(t => clearTimeout(t)))

    document.querySelectorAll('.faq-q').forEach(q => {
      q.addEventListener('click', () => {
        const open = q.getAttribute('aria-expanded') === 'true'
        q.setAttribute('aria-expanded', String(!open))
        const a = document.getElementById(q.getAttribute('aria-controls') || '')
        if (a) a.style.maxHeight = open ? '0' : a.scrollHeight + 'px'
      })
    })
    const setTopic = (t: string) => {
      document.querySelectorAll<HTMLElement>('.topic').forEach(b => {
        b.setAttribute('aria-selected', String(b.dataset.topic === t))
      })
      document.querySelectorAll<HTMLElement>('[data-panel]').forEach(p => {
        p.hidden = p.dataset.panel !== t
      })
      if (location.hash !== '#faq-' + t) history.replaceState(null, '', '#faq-' + t)
    }
    document.querySelectorAll<HTMLElement>('.topic').forEach(b => {
      b.addEventListener('click', () => setTopic(b.dataset.topic || ''))
    })
    if (location.hash.indexOf('#faq-') === 0) setTopic(location.hash.replace('#faq-', ''))

    return () => cleanups.forEach(fn => fn())
  }, [])

  /* S6 Work 프리뷰 카드 — 마우스 위치 기반 내부 이미지 미세 패럴랙스.
     프레임(.bf__bar)은 고정하고 .shot 이미지만 살짝 움직인다. 정밀 포인터 + 모션 허용
     환경에서만 동작하며, 값 보간은 .shot에 걸린 CSS transition(home.css)이 담당한다. */
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const cards = Array.from(document.querySelectorAll<HTMLElement>('.wg2__grid .wcard'))
    if (!cards.length) return

    const onMove = (e: MouseEvent) => {
      const card = e.currentTarget as HTMLElement
      const shot = card.querySelector<HTMLElement>('.shot')
      if (!shot) return
      const r = card.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width - 0.5
      const py = (e.clientY - r.top) / r.height - 0.5
      shot.style.transform = `translate(${(px * 16).toFixed(1)}px, ${(py * 16).toFixed(1)}px) scale(1.02)`
    }
    const onLeave = (e: MouseEvent) => {
      const shot = (e.currentTarget as HTMLElement).querySelector<HTMLElement>('.shot')
      if (shot) shot.style.transform = ''
    }
    cards.forEach(card => {
      card.addEventListener('mousemove', onMove)
      card.addEventListener('mouseleave', onLeave)
    })
    return () => {
      cards.forEach(card => {
        card.removeEventListener('mousemove', onMove)
        card.removeEventListener('mouseleave', onLeave)
      })
    }
  }, [])

  /* 플로팅 독 — 스크롤 진입 후 표시, 최종 CTA·푸터 근처/닫기 시 숨김 */
  useEffect(() => {
    const dock = document.querySelector('[data-dock]')
    if (!dock) return
    let closed = false
    try { closed = sessionStorage.getItem('dock') === '1' } catch {}
    const xbtn = document.querySelector('[data-dock-x]') as HTMLElement
    const reopen = document.querySelector('[data-dock-open]') as HTMLElement | null
    const syncReopen = () => { if (reopen) reopen.classList.toggle('show', closed) }
    const endEl = document.querySelector('.s10') || document.querySelector('.cta-banner') || document.querySelector('footer')
    const upd = () => {
      if (closed) return
      const nearEnd = !!endEl && endEl.getBoundingClientRect().top < window.innerHeight * 0.9
      dock.classList.toggle('show', window.scrollY > window.innerHeight * 0.85 && !nearEnd)
    }
    const onClose = () => {
      closed = true
      dock.classList.remove('show')
      try { sessionStorage.setItem('dock', '1') } catch {}
      syncReopen()
    }
    const onReopen = () => {
      closed = false
      try { sessionStorage.removeItem('dock') } catch {}
      syncReopen(); upd()
    }
    xbtn.addEventListener('click', onClose)
    if (reopen) reopen.addEventListener('click', onReopen)
    window.addEventListener('scroll', upd, { passive: true })
    upd(); syncReopen()
    return () => {
      window.removeEventListener('scroll', upd)
      xbtn.removeEventListener('click', onClose)
      if (reopen) reopen.removeEventListener('click', onReopen)
    }
  }, [])

  return (
    <>
      <main id="main" style={{ paddingTop: 0 }}>

        {/* ===== S1 Hero — 스트림: 데스크톱 실물 + 모바일 듀오 교차 ===== */}
        <section className="hero">
          <div className="hero__bg" aria-hidden="true"></div>
          <div className="hero-real"><i>✓</i>실제 제작 화면입니다</div>

          <div className="streamwrap" aria-hidden="true">
            <div className="stream">
              <StreamCol blocks={COL1} cls="col" />
              <StreamCol blocks={COL2} cls="col col--rev" />
              <StreamCol blocks={COL3} cls="col col--slow" />
            </div>
          </div>

          <div className="wrap hero__in">
            <span className="h1-over"><i>✓</i><em>검증된</em><span className="h1-over-lead">바이브 코딩으로,</span></span>
            <h1 className="st st1"><mark>외주</mark><span className="h1-tail">를 해드립니다</span></h1>
            <p className="st st2">기획부터 개발, 검수까지 한 팀이 끝까지 맡습니다.<br />
              아이디어만 가져오세요 — 나머지는 검증된 빌더의 일입니다.</p>
            <div className="st st3 hero-ctas">
              <ContactTrigger className="btn btn--ink btn--pulse" data-track="cta_click" data-location="hero">프로젝트 문의 <span className="arr">→</span></ContactTrigger>
              <Link className="cta-sub" href="/work" data-track="cta_click" data-location="hero_secondary">작업물 먼저 보기 <span className="arr">→</span></Link>
            </div>
            <p className="st st3 hero-proof"><a className="proof-link" href="#builders">검증된 빌더 <b className="num">{activeBuilderCount}</b>인</a><i></i><a className="proof-link" href="#work">공개 프로젝트 <b className="num">{workPreviews.length}</b>건</a><i></i><a className="proof-link" href="#system"><b>검수 시스템</b> 운영</a></p>
          </div>
          <div className="hero__scroll">SCROLL</div>
        </section>

        <RibbonSep
          id="rsepA"
          className="ribbon-sep--hero"
          phrases={[
            'AI 에이전트 ✳ 랜딩 페이지 ✳ 플랫폼 ✳ 모바일 앱 ✳ 업무 자동화 ✳ ',
            'PLAN ✳ DESIGN ✳ BUILD ✳ REVIEW ✳ 올인원 턴키 ✳ ',
            '아이디어만 가져오세요 ✳ WE BUILD THE REST ✳ NDA 가능 ✳ ',
            'PoC 먼저, 확장은 그다음 ✳ SHIP FAST, SHIP RIGHT ✳ ',
          ]}
        />

        <section className="s4x" id="system">
          <div className="wrap">
            <div className="s4x__head">
              <h2><mark>대충</mark> 만든 결과물은<br />통과하지 못합니다</h2>
            </div>
            <div className="s4x__grid">
              {LAURELS.map(l => (
                <div className={l.box} key={l.top}>
                  <div className={l.cls}>
                    <Lv />
                    <span className="laur__txt"><span className="l-star">✦</span><span className="l-top">{l.top}</span><b>{l.big}</b><span className="l-sub">{l.sub}</span></span>
                    <Lv r />
                  </div>
                </div>
              ))}
              <div className="s4x-card rv">
                <div className="vis2 v2--edu">
                  <img className="v2-person" src="/assets/img/p-kiesop.png" alt="김이솝" />
                  <div className="ic-pill ic-pill--side"><span className="spark">✦</span>커리큘럼 수료<span className="ok">✓</span></div>
                </div>
                <div className="bd2"><b>교육 — 김이솝 커리큘럼</b><span>그가 설계한 과정을 <mark>수료한 빌더만 투입</mark></span></div>
              </div>
              <div className="s4x-card rv d1">
                <div className="vis2 v2--sys">
                  <div className="v2-tok"><span>+ O ✳</span><em>(주)똑똑한개발자</em></div>
                  <div className="ic-team">
                    <span className="bub">오늘 검수 2건 통과 ✓</span>
                    <div className="avs"><i>조</i><i>리</i><i className="core">✳</i><i>도</i><i className="more">+24</i></div>
                  </div>
                </div>
                <div className="bd2"><b>검수 — (주)똑똑한개발자</b><span>크몽 자회사 — <mark>전 결과물 기준 심사</mark></span></div>
              </div>
              <div className="s4x-card rv d2">
                <div className="vis2 v2--match">
                  <img className="v2-kmong" src="/assets/img/p-kmong.png" alt="크몽" />
                  <div className="ic-match ic-match--side">
                    <div className="chip2"><i>유</i><div><b>빌더 유나</b><span>AI 서비스</span></div></div>
                    <span className="done">매칭 완료</span>
                  </div>
                </div>
                <div className="bd2"><b>매칭·보증 — 크몽</b><span>거래·정산을 <mark>마켓 안전망이 보증</mark></span></div>
              </div>
            </div>
            <div className="sys__flow2" data-stepflow aria-label="검증 프로세스" style={{ marginTop: 72 }}>
              <span className="fstep" style={step(0)}><span className="dot">01</span><span className="lb2"><span className="lb2t">교육</span><small>커리큘럼 수료</small></span></span>
              <span className="fline" style={step(1)}></span>
              <span className="fstep" style={step(2)}><span className="dot">02</span><span className="lb2"><span className="lb2t">제작</span><small>검증된 빌더</small></span></span>
              <span className="fline" style={step(3)}></span>
              <span className="fstep" style={step(4)}><span className="dot">03</span><span className="lb2"><span className="lb2t">검수</span><small>9년차 기준 심사</small></span></span>
              <span className="fline" style={step(5)}></span>
              <span className="fstep fstep--last" style={step(6)}><span className="dot">✓</span><span className="lb2"><span className="lb2t">고객 전달</span><small>검수 통과분만</small></span></span>
            </div>
          </div>
        </section>

        <section className="s4b">
          <div className="wrap">
            <div className="s4x__brands">
              <h3>똑똑한 개발자는 다양한 기업의 복잡한 문제를 함께 해결해 왔습니다</h3>
              <p className="bsub">이제 그 기준을 바이브 코딩에 적용합니다</p>
              <p className="bcta"><mark>믿고 맡기세요</mark></p>
              <div className="bwall">
                <div className="brow"><div className="btrack"><Bset brands={BRANDS1} /><Bset brands={BRANDS1} /></div></div>
                <div className="brow"><div className="btrack btrack--rev"><Bset brands={BRANDS2} /><Bset brands={BRANDS2} /></div></div>
              </div>
            </div>
            <div className="s4x__stats" data-numpulse style={{ marginTop: 36 }}>
              <span className="st2" style={step(0)}><b>3<em>단계</em></b><span>모든 단계 확인 후 진행</span></span>
              <span className="st2" style={step(1)}><b>17<em>화면</em></b><span>범위를 화면 단위로 확정</span></span>
              <span className="st2" style={step(2)}><b>3<em>주</em></b><span>랜딩 표준 납기</span></span>
              <span className="st2" style={step(3)}><b>30<em>일</em></b><span>무상 하자보수 보장</span></span>
            </div>
          </div>
        </section>

        <section className="s2">
          <div className="wrap">
            <div className="s2__grid">
              <div className="s2__left">
                <h2><span className="w300">요즘 바이브 코딩 외주,</span><br />이런 곳은 조심하세요</h2>
                <nav className="s2steps" aria-label="주의할 외주 업체 유형">
                  {S2_ITEMS.map((it, i) => (
                    <button
                      key={it.id}
                      type="button"
                      className="s2step"
                      data-s2step={i}
                      aria-current={i === 0}
                      aria-controls={`s2item-${it.id}`}
                    >
                      <span className="s2step__dot"><S2Icon id={it.id} /></span>
                      <span className="s2step__meta"><b>0{i + 1}</b><span>{it.label}</span></span>
                    </button>
                  ))}
                </nav>
                <p className="s2__count"><b data-s2now>01</b> / 03</p>
              </div>
              <div className="s2__right">
                {S2_ITEMS.map((it, i) => (
                  <article className={`warn ${it.cls}`} data-s2item={i} id={`s2item-${it.id}`} key={it.id}>
                    <span className="wnum">0{i + 1}</span>
                    <div>
                      <span className="warn__tag">CHECK · 0{i + 1}</span>
                      <h3>{it.title}</h3>
                      <p>{it.lead} <mark>{it.point}</mark></p>
                    </div>
                    <div className="warn__figwrap">{it.fig}</div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="s3 grain" id="how">
          <div className="wrap">
            <div className="s3__head">
              <h2><span className="w300">그래서 우리는,</span><br />일하는 방식이 다릅니다</h2>
              <span className="s3__cnt"><b data-s3now>01</b> / 04</span>
            </div>
            <div className="s3__grid" data-steps>
              <div className="step on">
                <span className="no">01</span>
                <h3>기획</h3>
                <p>요구사항을 화면 목록과 기능 명세로 확정합니다. 여기서 정해진 범위가 모든 판단의 기준선이 됩니다.</p>
                <span className="out">산출물 — 기획서 · IA · 화면 정의</span>
                <div className="bar"><i></i></div>
              </div>
              <div className="step">
                <span className="no">02</span>
                <h3>디자인 · 목업</h3>
                <p>기능이 동작하는 가상 사이트(목업)로 확인합니다. 그림이 아니라 실제로 눌러보고 결정합니다.</p>
                <span className="out">산출물 — 동작 목업 · 디자인 시안</span>
                <div className="bar"><i></i></div>
              </div>
              <div className="step">
                <span className="no">03</span>
                <h3>개발</h3>
                <p>확정된 시안과 화면상 100% 동일한 완성도로 구현합니다. 검색 최적화 세팅까지 기본입니다.</p>
                <span className="out">산출물 — 배포 사이트 · SEO 세팅</span>
                <div className="bar"><i></i></div>
              </div>
              <div className="step">
                <span className="no">04</span>
                <h3>검수 · 이관</h3>
                <p>단계마다 확인을 받고 진행하며, 완료 후 모든 계정과 권한을 안전하게 이전합니다.</p>
                <span className="out">산출물 — 인계 문서 · 계정 이관</span>
                <div className="bar"><i></i></div>
              </div>
            </div>
          </div>
        </section>

        <section className="s5" id="builders">
          <div className="wrap">
            <h2><span className="w300">개발사를 고르지 마세요.</span><br />맞는 개발자를 매칭해 드립니다</h2>
            <div className="grid g3">
              <div className="mcard mcard--light" tabIndex={0}>
                <div className="bg bgi bgi-1"><span className="mring"></span><svg className="mico" viewBox="0 0 96 96" aria-hidden="true"><rect x="8" y="14" width="80" height="64" rx="10" fill="none" stroke="currentColor" strokeWidth="5" /><line x1="8" y1="32" x2="88" y2="32" stroke="currentColor" strokeWidth="5" /><circle cx="20" cy="23" r="3.2" fill="currentColor" /><circle cx="31" cy="23" r="3.2" fill="currentColor" /><rect x="20" y="42" width="34" height="8" rx="4" fill="currentColor" /><rect x="20" y="56" width="22" height="8" rx="4" fill="currentColor" /><path d="M60 50 L78 65 L69 66.5 L64.5 75 Z" fill="currentColor" /></svg><span className="mdeco md1">✳</span><span className="mdeco md2">✦</span></div>
                <div className="shade"></div>
                <div className="plus">+</div>
                <div className="in">
                  <span className="k">Match — 01</span>
                  <h3>랜딩 · 웹사이트</h3>
                  <p className="sub">브랜드 사이트, 수주용 랜딩</p>
                  <div className="detail">
                    <p>디자인 감도와 인터랙션 구현력이 검증된 빌더가 맡습니다. 전환 트래킹 설계까지 포함합니다.</p>
                    <span className="who">Builder — Design &amp; Interaction</span>
                  </div>
                </div>
              </div>
              <div className="mcard" tabIndex={0}>
                <div className="bg bgi bgi-2"><span className="mring"></span><svg className="mico" viewBox="0 0 96 96" aria-hidden="true"><rect x="8" y="10" width="80" height="76" rx="12" fill="none" stroke="currentColor" strokeWidth="5" /><line x1="34" y1="10" x2="34" y2="86" stroke="currentColor" strokeWidth="5" /><rect x="15" y="22" width="12" height="5" rx="2.5" fill="currentColor" /><rect x="15" y="34" width="12" height="5" rx="2.5" fill="currentColor" /><rect x="15" y="46" width="12" height="5" rx="2.5" fill="currentColor" /><rect x="43" y="52" width="9" height="22" rx="3" fill="currentColor" /><rect x="58" y="40" width="9" height="34" rx="3" fill="currentColor" /><rect x="73" y="28" width="9" height="46" rx="3" fill="currentColor" /></svg><span className="mdeco md1">✦</span><span className="mdeco md2">✳</span></div>
                <div className="shade"></div>
                <div className="plus">+</div>
                <div className="in">
                  <span className="k">Match — 02</span>
                  <h3>SaaS · 플랫폼</h3>
                  <p className="sub">관리자·데이터 구조가 있는 서비스</p>
                  <div className="detail">
                    <p>데이터 모델링과 권한 설계 경험이 있는 빌더를 배정합니다. 규모가 크면 시니어 개발자와 투트랙으로.</p>
                    <span className="who">Builder — Data &amp; Architecture</span>
                  </div>
                </div>
              </div>
              <div className="mcard mcard--light" tabIndex={0}>
                <div className="bg bgi bgi-3"><span className="mring"></span><svg className="mico" viewBox="0 0 96 96" aria-hidden="true"><g stroke="currentColor" strokeWidth="10" strokeLinecap="round"><line x1="48" y1="14" x2="48" y2="82" /><line x1="19" y1="31" x2="77" y2="65" /><line x1="77" y1="31" x2="19" y2="65" /></g><circle cx="80" cy="16" r="6" fill="currentColor" /></svg><span className="mdeco md1">✦</span><span className="mdeco md2">✳</span></div>
                <div className="shade"></div>
                <div className="plus">+</div>
                <div className="in">
                  <span className="k">Match — 03</span>
                  <h3>AI 서비스</h3>
                  <p className="sub">LLM 연동, AI 기능 탑재</p>
                  <div className="detail">
                    <p>AI API 연동과 프롬프트 설계를 실무로 다뤄본 빌더가 맡습니다. PoC부터 단계적으로 검증합니다.</p>
                    <span className="who">Builder — LLM &amp; Evaluation</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="rv" style={{ marginTop: 46, textAlign: 'center' }}>
              <Link className="btn btn--ghost" href="/work#builders" data-track="cta_click" data-location="match_section">어떤 빌더들인지 보러가기 <span className="arr">→</span></Link>
            </div>
          </div>
        </section>

        {/* ===== S6 Work 프리뷰 — 실제 packages/content 데이터 (page.tsx 에서 props 로 전달) ===== */}
        <section id="work">
          <div className="wrap">
            <div className="sec-head">
              <h2>완성한 프로젝트</h2>
            </div>
            <p className="t-lead">실제로 수행한 프로젝트만 올립니다.</p>
            <div className="wg2">
              <Link className="more-link wg2__more" href="/work">전체 보기</Link>
              <div className="wg2__grid">
                {workPreviews.map((w, i) => <WorkCard w={w} index={i} key={w.slug} />)}
              </div>
            </div>
          </div>
        </section>

        {/* ===== S7 Insight 프리뷰 — 실제 packages/content 데이터 ===== */}
        <section className="s7">
          <div className="wrap">
            <div className="sec-head">
              <h2>우리의 생각</h2>
              <Link className="more-link" href="/insight">전체 보기</Link>
            </div>
            {insightPreviews.map(a => (
              <Link className="irow" href={`/insight/${a.slug}`} key={a.slug}>
                <span className="t">{a.title}</span>
                <span className="meta"><span className="tag">{a.tag}</span><span className="d num">{a.date}</span></span>
              </Link>
            ))}
          </div>
        </section>

        <section className="s9" id="faq">
          <div className="wrap">
            <div className="sec-head">
              <h2>자주 묻는 질문</h2>
              <Link className="more-link" href="/faq">전체 보기</Link>
            </div>
            <p className="t-lead">문의 전에 가장 많이 받는 질문을 모았습니다.</p>

            {faqTopics.length > 0 && (
              <>
                <div className="topics" role="tablist">
                  {faqTopics.map((topic, i) => (
                    <button
                      key={topic.key}
                      className="topic"
                      role="tab"
                      aria-selected={i === 0}
                      data-topic={topic.key}
                      data-track="faq_topic_change"
                    >
                      {topic.label}
                    </button>
                  ))}
                </div>

                {faqTopics.map((topic, i) => (
                  <div data-panel={topic.key} hidden={i !== 0} key={topic.key}>
                    {topic.items.map(item => (
                      <div className="faq-item" key={item.id}>
                        <button className="faq-q" aria-expanded="false" aria-controls={`faq-a-${item.id}`}>{item.question}</button>
                        <div className="faq-a" id={`faq-a-${item.id}`} role="region"><p>{item.answer}</p></div>
                      </div>
                    ))}
                  </div>
                ))}
              </>
            )}

          </div>
        </section>

        <section className="s10">
          <div className="wrap">
            <span className="ast" aria-hidden="true">✳</span>
            <h2><span className="w300">만들고 싶은 것이</span><br />있으신가요?</h2>
            <p>지금 프로젝트를 문의해 주세요. 빠르게 연락드립니다.</p>
            <ContactTrigger className="btn btn--lime" data-track="cta_click" data-location="footer_cta" style={{ fontSize: 17, padding: '18px 38px' }}>프로젝트 문의 <span className="arr">→</span></ContactTrigger>
          </div>
        </section>

      </main>

      <div className="dock" data-dock>
        <div className="dock__txt"><b>검증된 바이브 코딩</b><span>무료 문의 — 부담 없이 남겨보세요</span></div>
        <ContactTrigger className="btn btn--lime btn--sm" data-track="cta_click" data-location="floating">프로젝트 문의 <span className="arr">→</span></ContactTrigger>
        <button className="dock__x" aria-label="닫기" data-dock-x>✕</button>
      </div>
      <button className="dock-open" data-dock-open aria-label="문의 바 다시 열기">💬</button>

      <div className="expand-ov" data-ov></div>
    </>
  )
}
