'use client'

import { useEffect, useMemo, useState } from 'react'
import { getAccessToken } from '@/lib/auth'

const DEFAULT_SOCKJS_CDN = 'https://cdn.jsdelivr.net/npm/sockjs-client@1/dist/sockjs.min.js'
const DEFAULT_STOMP_CDN = 'https://cdn.jsdelivr.net/npm/@stomp/stompjs@7/bundles/stomp.umd.min.js'

declare global {
  interface Window {
    SockJS?: new (url: string) => SockJSLike
    StompJs?: {
      Client: new (config?: Record<string, unknown>) => StompClientLike
    }
  }
}

type SockJSLike = {
  close: () => void
}

type StompClientLike = {
  activate: () => void
  deactivate: () => Promise<void> | void
  subscribe: (
    destination: string,
    callback: (message: { body?: string }) => void,
  ) => { unsubscribe: () => void }
  debug?: (msg: string) => void
  connectHeaders?: Record<string, string>
  webSocketFactory?: () => SockJSLike
  brokerURL?: string
  reconnectDelay?: number
  onConnect?: () => void
  onStompError?: (frame: { body?: string }) => void
  onWebSocketError?: (event: Event) => void
}

export type StompTopicConfig = {
  destination: string
  handler: (payload: unknown) => void
  parseJson?: boolean
  enabled?: boolean
}

type UseStompTopicsOptions = {
  topics: StompTopicConfig[]
  debug?: boolean
}

const ensureScript = (src: string, attr: string) => {
  if (typeof window === 'undefined') return
  if (document.querySelector(`script[data-${attr}]`)) return
  const script = document.createElement('script')
  script.src = src
  script.async = true
  script.setAttribute(`data-${attr}`, 'true')
  document.head.appendChild(script)
}

const adaptUrlForSockJS = (url: string) => {
  if (url.startsWith('wss://')) return url.replace('wss://', 'https://')
  if (url.startsWith('ws://')) return url.replace('ws://', 'http://')
  return url
}

export function useStompTopics({ topics, debug }: UseStompTopicsOptions) {
  const enabledTopics = useMemo(
    () => topics.filter((topic) => topic.enabled !== false && topic.destination),
    [topics],
  )

  const [transportReady, setTransportReady] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    ensureScript(DEFAULT_SOCKJS_CDN, 'sockjs-client')
    ensureScript(DEFAULT_STOMP_CDN, 'stomp-client')

    const checkReady = () => {
      if (window.SockJS && window.StompJs) {
        setTransportReady(true)
      } else {
        requestAnimationFrame(checkReady)
      }
    }

    checkReady()
  }, [])

  useEffect(() => {
    if (enabledTopics.length === 0) return
    if (!transportReady || typeof window === 'undefined') return

    const wsUrl =
      process.env.NEXT_PUBLIC_WS_URL ??
      process.env.NEXT_PUBLIC_SOCKET_URL ??
      'ws://localhost:8080/ws'

    const accessToken = getAccessToken()
    const appendToken = (raw: string) => {
      if (!accessToken) return raw
      try {
        const url =
          raw.startsWith('http') || raw.startsWith('ws')
            ? new URL(raw)
            : new URL(raw, window.location.origin)
        url.searchParams.set('token', accessToken)
        return url.toString()
      } catch {
        return raw
      }
    }

    const socketUrl = appendToken(wsUrl)
    const logDebug = (...messages: unknown[]) => {
      if (debug) {
        console.log('[StompTopics]', ...messages)
      }
    }

    const StompClient = window.StompJs?.Client
    if (!StompClient) return
    const client: StompClientLike = new StompClient({
      brokerURL: window.SockJS ? undefined : socketUrl,
      reconnectDelay: 0,
    })

    if (window.SockJS) {
      const SockJS = window.SockJS
      client.webSocketFactory = () =>
        SockJS ? new SockJS(adaptUrlForSockJS(socketUrl)) : new WebSocket(socketUrl)
    }
    if (debug) {
      client.debug = (msg: string) => console.log('[StompTopics]', msg)
    }
    if (accessToken) {
      client.connectHeaders = { Authorization: `Bearer ${accessToken}` }
    }

    const subscriptions: Array<() => void> = []

    client.onConnect = () => {
      enabledTopics.forEach((topic) => {
        const subscription = client.subscribe(topic.destination, (message) => {
          const body = message.body ?? ''
          if (topic.parseJson === false) {
            topic.handler(body)
            return
          }
          try {
            topic.handler(body ? JSON.parse(body) : null)
          } catch (error) {
            console.error('Failed to parse STOMP message', error)
          }
        })
        subscriptions.push(() => subscription.unsubscribe())
        logDebug('Subscribed', topic.destination)
      })
    }

    client.onStompError = (frame) => {
      console.error('STOMP error', frame.body)
    }
    client.onWebSocketError = (event) => {
      console.error('WebSocket error', event)
    }

    client.activate()

    return () => {
      subscriptions.forEach((unsubscribe) => unsubscribe())
      const result = client.deactivate()
      if (result && typeof (result as Promise<void>).catch === 'function') {
        ;(result as Promise<void>).catch((err) => {
          console.error('Failed to deactivate STOMP client', err)
        })
      }
    }
  }, [enabledTopics, transportReady, debug])
}
