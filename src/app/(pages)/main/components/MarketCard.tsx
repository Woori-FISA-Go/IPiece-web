"use client"

import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from "react"
import Image from "next/image"
import type { Item } from "../constants/data"
import { StatusPill } from "./StatusPill"
import iconCoin from "../assets/icon_coin.png"
import iconHeartDefault from "../assets/icon_heart.svg"
import iconHeartActive from "../assets/icon_heart_active.svg"
import { apiFetch } from "@/lib/api-client"
import { getAccessToken } from "@/lib/auth"
import { useRouter } from "next/navigation"

interface MarketCardProps {
  item: Item
}

const allowedRemoteHosts = new Set([
  "hebbkx1anhila5yf.public.blob.vercel-storage.com",
  "i.namu.wiki",
  "img.danawa.com",
  "cdn.huffingtonpost.kr",
  "i.pinimg.com",
  "github.com",
])

const apiHost = (() => {
  const base = process.env.NEXT_PUBLIC_API_URL
  if (!base) return null
  try {
    return new URL(base).hostname
  } catch {
    return null
  }
})()

if (apiHost) {
  allowedRemoteHosts.add(apiHost)
}

function normalizeImageUrl(url?: string) {
  if (!url) return undefined
  if (url.startsWith("http://") || url.startsWith("https://")) {
    try {
      const parsed = new URL(url)
      if (parsed.hostname === "www.google.com" && parsed.pathname === "/url") {
        return undefined
      }
      if (!allowedRemoteHosts.has(parsed.hostname)) {
        return undefined
      }
      return url
    } catch {
      return undefined
    }
  }
  const base = process.env.NEXT_PUBLIC_API_URL
  if (!base) {
    return url.startsWith("/") ? url : `/${url}`
  }
  const normalizedPath = url.startsWith("/") ? url : `/${url}`
  try {
    const absolute = new URL(normalizedPath, base).toString()
    const host = new URL(absolute).hostname
    if (!allowedRemoteHosts.has(host)) {
      return undefined
    }
    return absolute
  } catch {
    return undefined
  }
}

export function MarketCard({ item }: MarketCardProps) {
  const [liked, setLiked] = useState(item.liked || false)
  const [isToggling, setIsToggling] = useState(false)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const imageUrl = normalizeImageUrl(item.imageUrl)
  const router = useRouter()
  const formattedPrice =
    typeof item.priceKRW === "number" ? item.priceKRW.toLocaleString("ko-KR") : item.priceKRW

  useEffect(() => {
    return () => {
      if (toastTimer.current) {
        clearTimeout(toastTimer.current)
      }
    }
  }, [])

  const showToast = (message: string) => {
    setToastMessage(message)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastMessage(null), 2200)
  }

  const detailEndpoint =
    item.status === "OFFERING"
      ? `/v1/offerings/${item.id}/detail`
      : item.status === "TRADING"
        ? `/v1/market/${item.id}/details`
        : null

  const detailRoute = item.status === "OFFERING" ? `/offering/${item.id}` : `/trading/${item.id}`

  const handleFavoriteToggle = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    if (isToggling) return

    const token = getAccessToken()
    if (!token) {
      showToast("로그인이 필요한 서비스입니다.")
      return
    }

    setIsToggling(true)
    try {
      const method = liked ? "DELETE" : "POST"
      const res = await apiFetch(`/v1/products/${item.id}/favorite`, { method })
      if (!res.ok) {
        let message: string | undefined
        try {
          const error = (await res.json()) as { detail?: string; message?: string }
          message = error.detail || error.message
        } catch {
          /* ignore */
        }
        throw new Error(message || "관심 등록 처리에 실패했습니다.")
      }
      setLiked((prev) => !prev)
    } catch (error) {
      const message = error instanceof Error ? error.message : "관심 등록 처리에 실패했습니다."
      showToast(message)
    } finally {
      setIsToggling(false)
    }
  }

  const fetchDetailAndNavigate = async () => {
    if (!detailEndpoint || !detailRoute || isLoadingDetail) return

    setIsLoadingDetail(true)
    try {
      const res = await apiFetch(detailEndpoint)
      if (!res.ok) {
        let message: string | undefined
        try {
          const error = (await res.json()) as { detail?: string; message?: string }
          message = error.detail || error.message
        } catch {
          /* ignore */
        }
        throw new Error(message || "상세 정보를 불러오지 못했습니다.")
      }
      const detail = await res.json().catch(() => null)
      if (detail) {
        sessionStorage.setItem(`product-detail:${item.status}:${item.id}`, JSON.stringify(detail))
      }
      router.push(detailRoute)
    } catch (error) {
      const message = error instanceof Error ? error.message : "상세 정보를 불러오지 못했습니다."
      showToast(message)
    } finally {
      setIsLoadingDetail(false)
    }
  }

  const handleCardKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      fetchDetailAndNavigate()
    }
  }

  return (
    <div className="group">
      <div
        role="button"
        tabIndex={0}
        onClick={fetchDetailAndNavigate}
        onKeyDown={handleCardKeyDown}
        className="block cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#3386E5]"
      >
        <div className="relative aspect-[4/3] lg:aspect-[5/4] bg-gray-100 rounded-lg mb-3 overflow-hidden">
          {imageUrl ? (
            <Image src={imageUrl} alt={item.title} fill className="object-cover" unoptimized />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-900 text-lg">image</div>
          )}
          {isLoadingDetail ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-white text-xs">
              <span>상세 정보를 불러오는 중...</span>
            </div>
          ) : null}
          <button
            onClick={handleFavoriteToggle}
            type="button"
            className="absolute top-2 right-2 z-10 p-0 bg-transparent border-0 appearance-none cursor-pointer disabled:cursor-not-allowed"
            aria-label={liked ? '\uCC2C \uCDE8\uC18C' : '\uCC2C\uD558\uAE30'}
            aria-pressed={liked}
            disabled={isToggling}
          >
            <Image src={liked ? iconHeartActive : iconHeartDefault} alt="" width={24} height={24} />
          </button>
        </div>
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-semibold text-base text-gray-900 hover:text-[#3386E5] transition-colors">{item.title}</h3>
          <StatusPill status={item.status} />
        </div>
        <div className="flex items-center gap-1">
          <Image src={iconCoin} alt="" width={16} height={16} />
          <span className="text-sm font-semibold text-gray-900">
            {formattedPrice}
            {'\uC6D0'}
          </span>
        </div>
      </div>
      {toastMessage ? (
        <div className="fixed bottom-6 right-6 z-50 rounded-md bg-black/80 px-4 py-2 text-sm text-white shadow-lg">
          {toastMessage}
        </div>
      ) : null}
    </div>
  )
}
