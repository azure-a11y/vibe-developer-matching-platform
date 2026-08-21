'use client'

import { useEffect, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'

import Link from 'next/link'

import { buildPluugEmbedUrl } from '@/lib/site'

import { useContactModal } from './ContactModalContext'
import '@/app/contact/contact.css'

const noopSubscribe = () => () => {}
const getIsClientSnapshot = () => true
const getIsClientServerSnapshot = () => false

/* 전역 문의 팝업 — 어느 페이지에서 열어도 같은 모달. RootLayout에 한 번만 마운트된다.
   /contact 직접 접속은 app/contact/page.tsx가 이 모달을 열고 홈으로 리다이렉트하는 방식으로 처리한다. */
export default function ContactModal({ pluugFormUrl, activeBuilderCount }: { pluugFormUrl: string; activeBuilderCount: number }) {
  const { isOpen, close } = useContactModal()
  const hasPluugUrl = pluugFormUrl.length > 0
  const visibleBuilderCount = 3
  const additionalBuilderCount = Math.max(0, activeBuilderCount - visibleBuilderCount)

  /* pluug 주소는 utm_source를 location에서 읽기 때문에 클라이언트에서만 만든다 (ContactView와 동일 이유) */
  const isClient = useSyncExternalStore(noopSubscribe, getIsClientSnapshot, getIsClientServerSnapshot)
  const embedSrc = isClient && hasPluugUrl ? buildPluugEmbedUrl(pluugFormUrl, 'contact_modal') : ''

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    document.addEventListener('keydown', onKey)
    document.body.classList.add('contact-modal-lock')
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.classList.remove('contact-modal-lock')
    }
  }, [isOpen, close])

  useEffect(() => {
    if (!isOpen) return
    document.querySelectorAll('[data-pills]').forEach(group => {
      group.querySelectorAll('.pill').forEach(p => {
        p.addEventListener('click', () => {
          group.querySelectorAll('.pill').forEach(x => x.classList.remove('on'))
          p.classList.add('on')
        })
      })
    })
  }, [isOpen])

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
  }

  if (!isOpen || typeof document === 'undefined') return null

  return createPortal(
    <div className="contact-modal-overlay" role="dialog" aria-modal="true" aria-label="프로젝트 문의" onClick={close}>
      <div className="contact-modal-panel" onClick={e => e.stopPropagation()}>
        <button className="contact-modal-close" aria-label="닫기" onClick={close}>✕</button>

        <div className="c-shell">
          <div className="c-left">
            <span className="k">Project Inquiry</span>
            <h2>프로젝트 이야기를<br /><em>들려주세요</em></h2>
            <p className="sub">아이디어 단계여도 괜찮습니다. 지금 상황 그대로 적어주시면 저희가 길을 잡아드립니다.</p>

            <div className="proms">
              <div className="prom"><i>✓</i>상담·견적은 무료입니다</div>
              <div className="prom"><i>✓</i>보통 24시간 안에 회신드립니다</div>
              <div className="prom"><i>✓</i>프로젝트에 맞는 빌더를 매칭합니다</div>
            </div>

            <div className="psteps">
              <span className="t">이후 진행</span>
              <div className="pstep"><span className="no">01</span><div><b>문의 접수</b><span>내용 확인</span></div></div>
              <div className="pstep"><span className="no">02</span><div><b>담당자 배정</b><span>맞는 빌더 매칭</span></div></div>
              <div className="pstep"><span className="no">03</span><div><b>상담 · 견적</b><span>범위·일정 확정</span></div></div>
              <div className="pstep"><span className="no">04</span><div><b>착수</b><span>단계별 확인 진행</span></div></div>
            </div>

            <div className="team">
              <div className="avs">
                <img src="/assets/img/av-josh.jpg" alt="빌더 조쉬" />
                <img src="/assets/img/av-ria.jpg" alt="빌더 리아" />
                <img src="/assets/img/av-yuna.jpg" alt="빌더 유나" />
                {additionalBuilderCount > 0 && <span className="more">+{additionalBuilderCount}</span>}
              </div>
              <p><b>검증된 빌더 {activeBuilderCount}인</b>이<br />다음 프로젝트를 기다리고 있어요</p>
            </div>
          </div>

          {hasPluugUrl ? (
            <div className="c-form c-form--embed">
              {embedSrc && (
                <iframe
                  src={embedSrc}
                  title="프로젝트 문의 폼"
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              )}
              <p className="after-note">
                폼이 보이지 않으면 <a href={embedSrc || pluugFormUrl} target="_blank" rel="noopener noreferrer">새 창에서 열기</a> ·
                제출하면 <b>하루 안에</b> 회신드려요
              </p>
            </div>
          ) : (
          <form className="c-form" data-form onSubmit={onSubmit}>
            <div className="f-2col">
              <div className="f-row"><label>회사 / 담당자명 <span className="req">*</span></label>
                <input required placeholder="회사명 · 성함" /></div>
              <div className="f-row"><label>연락처 <span className="req">*</span></label>
                <input required type="tel" placeholder="010-0000-0000" /></div>
            </div>
            <div className="f-row"><label>이메일 <span className="req">*</span></label>
              <input type="email" required placeholder="you@company.com" /></div>

            <div className="f-group"><label>프로젝트 유형 <span className="opt-t">선택</span></label>
              <div className="pills" data-pills>
                <button type="button" className="pill on">랜딩 · 웹사이트</button>
                <button type="button" className="pill">SaaS · 플랫폼</button>
                <button type="button" className="pill">AI 서비스</button>
                <button type="button" className="pill">모바일 앱</button>
                <button type="button" className="pill">기타</button>
              </div>
            </div>
            <div className="f-group"><label>예산 규모 <span className="opt-t">선택 — 미정이어도 괜찮아요</span></label>
              <div className="pills" data-pills>
                <button type="button" className="pill on">미정</button>
                <button type="button" className="pill">~1,000만</button>
                <button type="button" className="pill">1,000만~3,000만</button>
                <button type="button" className="pill">3,000만 이상</button>
              </div>
            </div>

            <div className="f-row"><label>프로젝트 내용 <span className="req">*</span></label>
              <textarea required placeholder="예) 예약 관리가 되는 학원용 웹서비스를 만들고 싶어요. 지금은 엑셀로 관리 중이고, 10월 오픈이 목표예요."></textarea>
              <p className="hint">만들고 싶은 것 · 현재 상황 · 희망 일정 — 이 세 가지면 충분합니다.</p>
            </div>

            <label className="agree"><input type="checkbox" required />
              <span>개인정보 수집·이용에 동의합니다. <Link href="/privacy" onClick={close}>전문 보기</Link></span></label>

            <button className="btn btn--lime" type="submit" disabled aria-disabled="true">
              문의 보내기 <span className="arr">→</span>
            </button>
            <p className="after-note">문의 폼 준비 중입니다 — 관리자 Settings에서 pluug 폼 URL을 설정하면 활성화됩니다.</p>
          </form>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
