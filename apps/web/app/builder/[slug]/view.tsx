'use client'

import Link from 'next/link'

import ContactTrigger from '@/components/ContactTrigger'

export type BuilderProfileData = {
  no: string
  name: string
  fname: string
  role: string
  bio: string
  focus: string
  stack: string[]
  done: number
  badgeLabel: string
  isLead: boolean
  avatar: string
  principles: { title: string; description: string }[]
  projects: { slug: string; title: string; desc: string; tag: string; year: string; img: string; withTeam: string }[]
  others: { slug: string; name: string; role: string; avatar: string }[]
}

export default function BuilderProfileView({ b }: { b: BuilderProfileData }) {
  return (
    <main id="main">
      <section className="bp-hero" style={{ paddingBottom: 0 }}>
        <div className="wrap">
          <p className="crumb"><Link href="/work">Work</Link> / <Link href="/builder">검증된 빌더</Link> / <span>{b.name}</span></p>
          <div className="bp-grid">
            <div className="bp-photo slot mask">
              <img src={b.avatar} alt={`${b.name} 프로필 사진`} />
              <span className={b.isLead ? 'lv lv--lead' : 'lv'}>{b.badgeLabel || 'Builder'}</span>
            </div>
            <div className="bp-info">
              <span className="t-cap">Builder Profile</span>
              <h1>{b.name}</h1>
              <p className="bp-role">{b.role}</p>
              <p className="bp-bio">{b.bio}</p>
              <dl className="bp-facts">
                <div className="fhead"><span>Builder Sheet</span><span>{b.no}</span></div>
                <div className="row"><dt>전문 분야</dt><dd>{b.focus}</dd></div>
                <div className="row"><dt>주요 스택</dt><dd>{b.stack.join(' · ')}</dd></div>
                <div className="row"><dt>수행 프로젝트</dt><dd className="num">{b.done}</dd></div>
                <div className="row"><dt>함께한 파트너</dt><dd>똑똑한개발자</dd></div>
              </dl>
              <div className="bp-cta">
                <ContactTrigger className="btn btn--lime" data-track="cta_click" data-location="builder_profile">이 빌더와 프로젝트 문의 <span className="arr">→</span></ContactTrigger>
              </div>
            </div>
          </div>
        </div>
      </section>

      {b.principles.length > 0 && (
        <section className="bp-pr" style={{ paddingBottom: 0 }}>
          <div className="wrap">
            <div className="eyebrow"><i></i>How I Build<span className="no">{b.no}</span></div>
            <div className="grid g3">
              {b.principles.map((p, i) => (
                <div className={'pr-card rv d' + i} key={p.title}>
                  <span className="no">{String(i + 1).padStart(2, '0')}</span><b>{p.title}</b><p>{p.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bp-work" style={{ paddingBottom: 20 }}>
        <div className="wrap">
          <div className="sec-head">
            <h2 style={{ fontSize: 'clamp(24px,3vw,34px)', margin: 0 }}>{b.fname}의 작업물</h2>
            <span className="head-cnt num">( {String(b.projects.length).padStart(2, '0')} )</span>
          </div>
          <p className="note">※ 공개 가능한 프로젝트만 게재합니다 · 전체 수행 {b.done}건</p>
          <div className="grid g2">
            {b.projects.map((p, i) => (
              <Link className={'wcard rv d' + (i % 4)} href={`/work/${p.slug}`} data-cursor="VIEW →" key={p.slug}>
                <div className="slot mask"><img className="cover" src={p.img} alt={`${p.title} 화면`} loading="lazy" /></div>
                <div className="meta">
                  <div className="mrow"><span className="tag">{p.tag}</span><span className="yr num">{p.year}</span></div>
                  <h3>{p.title}</h3>
                  <p>{p.desc}</p>
                  <div className="builders">{(p.withTeam ? p.withTeam + ' · ' : '') + b.name}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {b.others.length > 0 && (
        <section className="bp-others" style={{ paddingBottom: 30 }}>
          <div className="wrap">
            <div className="sec-head">
              <h2 style={{ fontSize: 'clamp(22px,2.6vw,30px)', margin: 0 }}>다른 빌더 보기</h2>
              <Link className="more-link" href="/builder">전체 빌더</Link>
            </div>
            <div className="grid g3">
              {b.others.map((o) => (
                <Link className="ocard" href={`/builder/${o.slug}`} key={o.slug}>
                  <img src={o.avatar} alt={`${o.name} 프로필 사진`} />
                  <span><b>{o.name}</b><span>{o.role}</span></span>
                  <span className="arr">→</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section style={{ paddingTop: 40 }}>
        <div className="wrap">
          <div className="cta-banner">
            <div>
              <h3>{b.fname}와 비슷한 프로젝트를 계획 중이신가요?</h3>
              <p>프로젝트 이야기를 들려주세요. 상황에 맞는 빌더와 진행 방식을 제안드립니다.</p>
            </div>
            <ContactTrigger className="btn btn--lime" data-track="cta_click" data-location="builder_profile_bottom">프로젝트 문의 <span className="arr">→</span></ContactTrigger>
          </div>
        </div>
      </section>
    </main>
  )
}
