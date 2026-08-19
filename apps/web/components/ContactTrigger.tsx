'use client'

import type { ButtonHTMLAttributes } from 'react'

import { useContactModal } from './ContactModalContext'

/* 사이트 전역의 "프로젝트 문의" CTA. /contact 페이지로 이동하는 대신 전역 모달을 연다. */
export default function ContactTrigger({ children, onClick, ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { open } = useContactModal()
  return (
    <button
      type="button"
      {...rest}
      onClick={e => {
        onClick?.(e)
        open()
      }}
    >
      {children}
    </button>
  )
}
