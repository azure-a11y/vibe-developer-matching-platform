'use client'

import { useEffect } from 'react'

import { RibbonSep } from '@/components/RibbonSep'
import type { FaqTopic } from '@/lib/faq'

const PAGE_SIZE = 10

type PanelState = {
  items: HTMLElement[]
  totalPages: number
  current: number
  pager: HTMLElement | null
  prevBtn: HTMLButtonElement | null
  nextBtn: HTMLButtonElement | null
  status: HTMLElement | null
  empty: HTMLElement | null
}

export default function FaqView({ topics }: { topics: FaqTopic[] }) {
  useEffect(() => {
    const qHandlers = Array.from(document.querySelectorAll<HTMLElement>('.faq-q')).map(q => {
      const handler = () => {
        const open = q.getAttribute('aria-expanded') === 'true'
        q.setAttribute('aria-expanded', String(!open))
        const a = document.getElementById(q.getAttribute('aria-controls') || '')
        if (a) a.style.maxHeight = open ? '0' : a.scrollHeight + 'px'
      }
      q.addEventListener('click', handler)
      return { el: q, handler }
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
    const topicHandlers = Array.from(document.querySelectorAll<HTMLElement>('.topic')).map(b => {
      const handler = () => setTopic(b.dataset.topic || '')
      b.addEventListener('click', handler)
      return { el: b, handler }
    })
    if (location.hash.indexOf('#faq-') === 0) setTopic(location.hash.replace('#faq-', ''))

    // 카테고리별 10개 단위 페이징 + 키워드 검색.
    // 검색어가 있으면 페이지 구분 없이 매치되는 항목만 보여주고, 지우면 페이징으로 복귀한다.
    let query = ''
    const pagerHandlers: { el: HTMLElement; handler: () => void }[] = []
    const panels: PanelState[] = Array.from(document.querySelectorAll<HTMLElement>('[data-panel]')).map(panel => {
      const items = Array.from(panel.querySelectorAll<HTMLElement>('.faq-item'))
      const totalPages = Math.max(1, ...items.map(el => Number(el.dataset.page || '0') + 1))
      return {
        items,
        totalPages,
        current: 0,
        pager: panel.querySelector<HTMLElement>('.faq-pager'),
        prevBtn: panel.querySelector<HTMLButtonElement>('[data-pager-prev]'),
        nextBtn: panel.querySelector<HTMLButtonElement>('[data-pager-next]'),
        status: panel.querySelector<HTMLElement>('[data-pager-status]'),
        empty: panel.querySelector<HTMLElement>('[data-faq-empty]'),
      }
    })

    const render = (state: PanelState) => {
      if (query) {
        let matches = 0
        state.items.forEach(el => {
          const match = (el.dataset.search || '').includes(query)
          el.hidden = !match
          if (match) matches += 1
        })
        if (state.pager) state.pager.hidden = true
        if (state.empty) state.empty.hidden = matches > 0
      } else {
        state.items.forEach(el => {
          el.hidden = Number(el.dataset.page || '0') !== state.current
        })
        if (state.status) state.status.textContent = `${state.current + 1} / ${state.totalPages}`
        if (state.prevBtn) state.prevBtn.disabled = state.current === 0
        if (state.nextBtn) state.nextBtn.disabled = state.current >= state.totalPages - 1
        if (state.pager) state.pager.hidden = state.totalPages <= 1
        if (state.empty) state.empty.hidden = true
      }
    }

    panels.forEach(state => {
      if (state.prevBtn) {
        const btn = state.prevBtn
        const handler = () => {
          if (state.current > 0) {
            state.current -= 1
            render(state)
          }
        }
        btn.addEventListener('click', handler)
        pagerHandlers.push({ el: btn, handler })
      }
      if (state.nextBtn) {
        const btn = state.nextBtn
        const handler = () => {
          if (state.current < state.totalPages - 1) {
            state.current += 1
            render(state)
          }
        }
        btn.addEventListener('click', handler)
        pagerHandlers.push({ el: btn, handler })
      }
      render(state)
    })

    const searchInput = document.querySelector<HTMLInputElement>('[data-faq-search]')
    const searchHandler = () => {
      query = (searchInput?.value || '').trim().toLowerCase()
      panels.forEach(render)
    }
    searchInput?.addEventListener('input', searchHandler)

    return () => {
      qHandlers.forEach(({ el, handler }) => el.removeEventListener('click', handler))
      topicHandlers.forEach(({ el, handler }) => el.removeEventListener('click', handler))
      pagerHandlers.forEach(({ el, handler }) => el.removeEventListener('click', handler))
      searchInput?.removeEventListener('input', searchHandler)
    }
  }, [])

  return (
    <main id="main">
      <div className="page-head">
        <div className="wrap">
          <h1><span className="w300">자주 묻는</span> 질문</h1>
          <p>외주 문의부터 진행 방식까지, 가장 많이 받는 질문을 모았습니다.</p>
        </div>
      </div>
      <RibbonSep
        id="rsepFaq"
        phrases={[
          '견적 문의 ✳ 진행 방식 ✳ 계약 · 결제 ✳ 유지보수 ✳ ',
          'GOT QUESTIONS? ✳ WE ANSWER FAST ✳ ',
          '무료 상담 ✳ NDA 가능 ✳ 빠른 회신 ✳ ',
        ]}
      />

      <div className="wrap" style={{ padding: '48px 32px 120px' }}>
        {topics.length === 0 ? (
          <p style={{ color: 'var(--muted)' }}>아직 등록된 FAQ가 없습니다.</p>
        ) : (
          <>
            <div className="faq-toolbar">
              <div className="topics" role="tablist">
                {topics.map((topic, i) => (
                  <button key={topic.key} className="topic" role="tab" aria-selected={i === 0} data-topic={topic.key}>
                    {topic.label}
                  </button>
                ))}
              </div>
              <input
                type="search"
                className="faq-search"
                placeholder="키워드로 검색"
                aria-label="FAQ 검색"
                data-faq-search
              />
            </div>

            {topics.map((topic, i) => (
              <div data-panel={topic.key} hidden={i !== 0} key={topic.key}>
                {topic.items.map((item, itemIndex) => (
                  <div
                    className="faq-item"
                    data-page={Math.floor(itemIndex / PAGE_SIZE)}
                    data-search={`${item.question} ${item.answer}`.toLowerCase()}
                    key={item.id}
                  >
                    <button className="faq-q" aria-expanded="false" aria-controls={`faq-a-${item.id}`}>
                      {item.question}
                    </button>
                    <div className="faq-a" id={`faq-a-${item.id}`} role="region">
                      <p>{item.answer}</p>
                    </div>
                  </div>
                ))}
                <p className="faq-empty" data-faq-empty hidden>검색 결과가 없습니다.</p>
                {topic.items.length > PAGE_SIZE && (
                  <div className="faq-pager">
                    <button type="button" className="btn btn--ghost" data-pager-prev>이전</button>
                    <span data-pager-status className="faq-pager__status" />
                    <button type="button" className="btn btn--ghost" data-pager-next>다음</button>
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </main>
  )
}
