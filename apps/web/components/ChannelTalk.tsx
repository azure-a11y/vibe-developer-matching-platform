'use client'

import { useEffect } from 'react'

import { channelPluginKey } from '@/lib/site'

declare global {
  interface Window {
    ChannelIO?: ChannelIOFn
    ChannelIOInitialized?: boolean
  }
}
type ChannelIOFn = {
  (...args: unknown[]): void
  q?: unknown[]
  c?: (args: unknown) => void
}

/* 채널톡 상담 위젯. 키가 비어 있으면 아무것도 하지 않는다 — 연동 전에도 사이트는 그대로 동작해야 한다.
   런처는 채널톡 기본 것을 쓴다. 기본 런처는 우하단 고정이라 하단 중앙의 .dock 과 겹칠 수 있어
   boot 성공 시 body.ct-on 을 붙여 CSS 쪽에서 dock 이 비켜서게 한다. */
export default function ChannelTalk() {
  useEffect(() => {
    if (!channelPluginKey) return
    if (window.ChannelIOInitialized) return
    window.ChannelIOInitialized = true

    const ch = function (...args: unknown[]) { ch.c?.(args) } as ChannelIOFn
    ch.q = []
    ch.c = (args: unknown) => { ch.q!.push(args) }
    window.ChannelIO = ch

    const el = document.createElement('script')
    el.async = true
    el.src = 'https://cdn.channel.io/plugin/ch-plugin-web.js'
    document.head.appendChild(el)

    window.ChannelIO('boot', { pluginKey: channelPluginKey, language: 'ko' }, (err: unknown) => {
      if (err) return
      document.body.classList.add('ct-on')
    })

    return () => {
      try { window.ChannelIO?.('shutdown') } catch {}
      window.ChannelIOInitialized = false
      document.body.classList.remove('ct-on')
    }
  }, [])

  return null
}
