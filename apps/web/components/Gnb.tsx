'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import BrandLink from './BrandLink'
import ContactTrigger from './ContactTrigger'

const NAV = [
  { href: '/' as const, label: 'Home', match: (p: string) => p === '/' },
  { href: '/work' as const, label: 'Work', match: (p: string) => p.startsWith('/work') || p.startsWith('/builder') },
  { href: '/insight' as const, label: 'Insight', match: (p: string) => p.startsWith('/insight') },
  { href: '/content' as const, label: 'Content', match: (p: string) => p.startsWith('/content') },
  { href: '/faq' as const, label: 'FAQ', match: (p: string) => p.startsWith('/faq') },
]

export default function Gnb({ brandName }: { brandName?: string } = {}) {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* 페이지 이동 시 모바일 메뉴 닫기 — effect 대신 렌더 중 상태 조정
     (https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes) */
  const [prevPathname, setPrevPathname] = useState(pathname)
  if (pathname !== prevPathname) {
    setPrevPathname(pathname)
    setOpen(false)
  }

  /* v22: 오버레이 열림 시 body 스크롤 잠금 (PRD FR-C-04) */
  useEffect(() => {
    document.body.classList.toggle('no-scroll', open)
    return () => document.body.classList.remove('no-scroll')
  }, [open])

  return (
    <header className={`gnb${scrolled ? ' scrolled' : ''}${open ? ' menu-open' : ''}`}>
      <div className="gnb__in">
        <BrandLink brandName={brandName} onNavigate={() => setOpen(false)} />
        <button className="gnb__burger" aria-label="메뉴" onClick={() => setOpen(v => !v)}>
          {open ? '✕' : '☰'}
        </button>
        <nav>
          {NAV.map(item => (
            <Link key={item.href} href={item.href} className={item.match(pathname) ? 'active' : undefined}>
              {item.label}
            </Link>
          ))}
        </nav>
        {/* 문의(진입)·접수 완료 페이지에서는 GNB CTA 미노출 (원본 스펙) */}
        {pathname !== '/contact' && pathname !== '/submit' && (
          <ContactTrigger className="btn btn--lime btn--sm btn--pulse" data-track="cta_click" data-location="gnb">
            문의하기
          </ContactTrigger>
        )}
      </div>
    </header>
  )
}
