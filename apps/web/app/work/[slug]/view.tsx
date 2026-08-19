'use client'

import Link from 'next/link'
import { useEffect } from 'react'

import ContactTrigger from '@/components/ContactTrigger'

export type WorkDetailData = {
  title: string
  summary: string
  tag: string
  year: string
  period: string
  techStack: string[]
  scope: string
  problem: string
  solution: string
  result: string
  cover: { src: string; alt: string }
  builders: { slug: string; name: string; role: string; avatar: string }[]
}

export default function WorkDetailView({ work }: { work: WorkDetailData }) {
  useEffect(() => {
    window.track?.('work_detail_view', { slug: work.title, category: work.tag })
  }, [work.title, work.tag])

  // 실제 케이스 스터디 원고(problem/solution/result)가 없으면 summary로 대체 표시한다.
  // 각 필드에 원고가 입력되면 해당 항목만 자동으로 실제 내용으로 바뀐다 — 임의로 지어낸 텍스트가 아니다.
  const problem = work.problem || work.summary
  const solution = work.solution || work.summary
  const result = work.result || work.summary

  return (
    <main id="main">
      <div className="wrap wd-head">
        <Link className="backlink" href="/work">Work 목록으로</Link>
        <h1>{work.title}</h1>
        <p className="sum">{work.summary}</p>
        <div className="tags">
          {work.techStack.map(t => <span className="tag" key={t}>{t}</span>)}
          {work.year && <span className="tag num">{work.year}</span>}
        </div>
      </div>

      <div className="wrap wd-cover">
        <div className="slot mask">
          <img className="cover" src={work.cover.src} alt={work.cover.alt} />
        </div>
      </div>

      <div className="wrap wd-body">
        <article className="wd-art">
          <h2><span className="no">01</span>문제</h2>
          <p>{problem}</p>
          <h2><span className="no">02</span>해결</h2>
          <p>{solution}</p>
          <h2><span className="no">03</span>결과</h2>
          <p>{result}</p>
        </article>

        <aside className="aside">
          <div className="aside__head"><span>Project Sheet</span></div>
          <dl>
            <div className="row"><dt>기간</dt><dd className="num">{work.period || '-'}</dd></div>
            <div className="row"><dt>연도</dt><dd className="num">{work.year || '-'}</dd></div>
            <div className="row"><dt>범위</dt><dd>{work.scope || '-'}</dd></div>
            <div className="row"><dt>기술</dt><dd>{work.techStack.join(' · ') || '-'}</dd></div>
            {work.builders.length > 0 && (
              <div className="row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}><dt>참여 빌더</dt><dd style={{ textAlign: 'left' }}>
                {work.builders.map(b => (
                  <Link className="b-chip" href={`/builder/${b.slug}`} style={{ textDecoration: 'none' }} key={b.slug}>
                    <i style={{ backgroundImage: `url(${b.avatar})`, backgroundSize: 'cover' }}></i>{b.name} · {b.role}
                  </Link>
                ))}
              </dd></div>
            )}
          </dl>
          <p className="note">빌더 칩을 누르면 프로필과 작업물로 이동합니다.</p>
        </aside>
      </div>

      <section style={{ paddingTop: 0, paddingBottom: 0 }}>
        <div className="wrap">
          <div className="cta-banner">
            <div>
              <h3>비슷한 프로젝트를 계획 중이신가요?</h3>
              <p>지금 상황을 알려주시면, 맞는 빌더와 진행 방식을 제안드립니다.</p>
            </div>
            <ContactTrigger className="btn btn--lime" data-track="cta_click" data-location="work_detail">프로젝트 문의 <span className="arr">→</span></ContactTrigger>
          </div>
        </div>
      </section>
    </main>
  )
}
