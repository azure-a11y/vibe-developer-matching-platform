'use client'
import Link from 'next/link'
import { useState } from 'react'
type Builder = { slug: string; name: string; role: string; bio: string; specialties: string[]; avatar: string; badgeLabel: string; isLead: boolean; done: number }
export default function BuilderListView({ builders }: { builders: Builder[] }) {
  const [page, setPage] = useState(1), totalPages = Math.max(1, Math.ceil(builders.length / 8)), currentPage = Math.min(page, totalPages)
  const visible = builders.slice((currentPage - 1) * 8, currentPage * 8)
  const changePage = (nextPage: number) => {
    setPage(nextPage)
    requestAnimationFrame(() => document.querySelector('.bld__grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }
  return <><div className="bld__grid">{visible.map(b => <Link className="bcard rv" href={`/builder/${b.slug}`} key={b.slug}><div className="slot mask"><img src={b.avatar} alt={`${b.name} 프로필 사진`} />{b.badgeLabel && <span className={b.isLead ? 'lv lv--lead' : 'lv lv--new'}>{b.badgeLabel}</span>}<div className="ct"><span>수행 <span className="num">{b.done}</span>건</span><span className="go">Profile →</span></div></div><div className="meta"><b>{b.name}</b><span className="role">{b.role}</span><p>{b.bio}</p><div className="stk">{b.specialties.slice(0, 2).map(s => <i key={s}>{s}</i>)}</div></div></Link>)}</div>{totalPages > 1 && <nav className="list-pager" aria-label="Builder 페이지 이동"><button type="button" disabled={currentPage === 1} onClick={() => changePage(currentPage - 1)}>이전</button>{Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => <button className={pageNumber === currentPage ? 'on' : ''} type="button" aria-current={pageNumber === currentPage ? 'page' : undefined} key={pageNumber} onClick={() => changePage(pageNumber)}>{pageNumber}</button>)}<button type="button" disabled={currentPage === totalPages} onClick={() => changePage(currentPage + 1)}>다음</button></nav>}</>
}
