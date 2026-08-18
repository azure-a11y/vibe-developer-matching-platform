'use client'

import { useEffect } from 'react'

/* 섹션 이음새 리본 — 곡선 SVG 경로를 따라 흐르는 라임색 문구.
   원래 홈페이지 히어로 아래에만 있던 것을 여러 페이지에서 재사용할 수 있도록 분리했다. */
export function RibbonSep({
  id,
  phrases,
  rotateMs = 5200,
  speed = 0.026,
  dir = 'rev',
}: {
  id: string
  phrases: string[]
  rotateMs?: number
  speed?: number
  dir?: 'fwd' | 'rev'
}) {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const tp = document.querySelector<SVGTextPathElement>(`[data-wflow="${id}"]`)
    const path = document.getElementById(id) as unknown as SVGPathElement | null
    if (!tp || !path) return

    const pathLen = path.getTotalLength()
    const txt = tp.parentNode as SVGTextElement
    txt.style.transition = 'opacity .45s ease'
    let di = 0
    let off = 0
    let unit = 10
    const setDeck = (i: number) => {
      di = i
      const phrase = phrases[i]
      tp.textContent = phrase ?? ''
      const one = Math.max(1, tp.getComputedTextLength())
      const n = Math.max(2, Math.ceil((pathLen * 1.5) / one) + 1)
      tp.textContent = new Array(n + 1).join(phrase)
      unit = (one / pathLen) * 100
      off = -unit / 2
    }
    setDeck(0)

    const timeouts: number[] = []
    const intervals: number[] = []
    if (!reduce && phrases.length > 1) {
      const swap = () => {
        if (document.hidden) return
        txt.style.opacity = '0'
        timeouts.push(window.setTimeout(() => { setDeck((di + 1) % phrases.length); txt.style.opacity = '1' }, 470))
      }
      timeouts.push(window.setTimeout(() => { swap(); intervals.push(window.setInterval(swap, rotateMs)) }, 2600))
    }

    let raf = 0
    if (!reduce) {
      const signedSpeed = speed * (dir === 'rev' ? -1 : 1)
      const loop = () => {
        off -= signedSpeed
        if (off <= -unit) off += unit
        if (off > 0) off -= unit
        tp.setAttribute('startOffset', off + '%')
        raf = requestAnimationFrame(loop)
      }
      raf = requestAnimationFrame(loop)
    }
    return () => {
      cancelAnimationFrame(raf)
      timeouts.forEach(t => clearTimeout(t))
      intervals.forEach(t => clearInterval(t))
    }
  }, [id, phrases, rotateMs, speed, dir])

  return (
    <div className="ribbon-sep" aria-hidden="true">
      <svg viewBox="0 0 1600 220" preserveAspectRatio="xMidYMid slice">
        <path id={id} d="M -80,150 C 240,90 420,190 720,150 C 1020,110 1220,170 1420,120 C 1520,95 1600,100 1700,80" fill="none" />
        <use href={`#${id}`} className="edge2" />
        <use href={`#${id}`} className="lane2" />
        <text className="t2" dy="6">
          <textPath href={`#${id}`} data-wflow={id}>{phrases[0]}</textPath>
        </text>
      </svg>
    </div>
  )
}
