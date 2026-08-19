'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { useContactModal } from '@/components/ContactModalContext'

/* /contact 직접 접속(외부 링크·북마크) 대응 — 전역 모달을 열고 홈으로 보낸다 */
export default function ContactRedirect() {
  const router = useRouter()
  const { open } = useContactModal()

  useEffect(() => {
    open()
    router.replace('/')
  }, [open, router])

  return null
}
