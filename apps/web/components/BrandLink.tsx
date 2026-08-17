'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { MouseEvent } from 'react'

type Props = {
  brandName?: string
  className?: string
  /** 모바일 메뉴처럼 클릭과 함께 닫아야 할 것이 있으면 넘긴다 */
  onNavigate?: () => void
}

/**
 * 로고 = "홈 최상단으로".
 * 다른 페이지에서는 Link 가 홈으로 보내고 App Router 가 알아서 최상단에 놓는다.
 * 홈에서는 라우팅이 일어나지 않아 스크롤 위치가 그대로 남으므로, 직접 올려준다.
 */
export default function BrandLink({ brandName, className = 'logo', onNavigate }: Props) {
  const pathname = usePathname()

  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onNavigate?.()
    if (pathname !== '/') return
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return

    e.preventDefault()
    window.scrollTo({ top: 0 })
    if (window.location.hash) {
      window.history.replaceState(window.history.state, '', '/')
    }
  }

  return (
    <Link className={className} href="/" onClick={onClick} aria-label={`${brandName || 'AI빌더그룹'} 홈`}>
      <img src="/logo-full.svg" alt="" className="logo-mark" />
      {brandName || 'AI빌더그룹'}
    </Link>
  )
}
