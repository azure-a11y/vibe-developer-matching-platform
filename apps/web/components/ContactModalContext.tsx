'use client'

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

interface ContactModalCtx {
  isOpen: boolean
  open: () => void
  close: () => void
}

const ContactModalContext = createContext<ContactModalCtx | null>(null)

export function ContactModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const value = useMemo(() => ({ isOpen, open, close }), [isOpen, open, close])

  return <ContactModalContext.Provider value={value}>{children}</ContactModalContext.Provider>
}

export function useContactModal() {
  const ctx = useContext(ContactModalContext)
  if (!ctx) throw new Error('useContactModal은 ContactModalProvider 안에서만 쓸 수 있습니다')
  return ctx
}
