"use client"

import { useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import profilePicture from "@/assets/images/profile.png"
import { clearTokens } from "@/lib/auth"
import { apiFetch } from "@/lib/api-client"
import type { MyHomeResponse } from "./types"

interface UserProfileCardProps {
  data?: MyHomeResponse | null
  isLoading?: boolean
}

const KRW_FORMATTER = new Intl.NumberFormat("ko-KR")

function formatCurrency(value?: number) {
  if (typeof value !== "number") return "-"
  return KRW_FORMATTER.format(value)
}

function formatSignedCurrency(value?: number) {
  if (typeof value !== "number") return "-"
  const sign = value > 0 ? "+" : ""
  return `${sign}${KRW_FORMATTER.format(value)} KRW`
}

function getTrendColor(value?: number) {
  if (typeof value !== "number") return "text-gray-500"
  if (value > 0) return "text-[#E53333]"
  if (value < 0) return "text-[#3386E5]"
  return "text-gray-500"
}

export default function UserProfileCard({ data, isLoading }: UserProfileCardProps) {
  const sortedPortfolio = useMemo(() => {
    const list = data?.portfolio_ratio ?? []
    return [...list].sort((a, b) => (b.ratio ?? 0) - (a.ratio ?? 0))
  }, [data?.portfolio_ratio])

  const thumbnails = useMemo(
    () => sortedPortfolio.map((item) => item.thumbnailImg).filter((src): src is string => Boolean(src)),
    [sortedPortfolio],
  )

  const representativeThumb = thumbnails[0]
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    if (isLoggingOut) return
    setIsLoggingOut(true)
    try {
      await apiFetch("/v1/auth/token/logout", { method: "POST" })
    } catch (error) {
      console.error("Failed to logout", error)
    } finally {
      clearTokens()
      if (typeof window !== "undefined") {
        window.location.href = "/auth/login"
      }
    }
  }

  return (
    <Card className="bg-[#FAFAFA]">
      <CardContent className="px-6 pb-6 pt-4">
        <div className="mb-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 overflow-hidden rounded-full bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={representativeThumb || profilePicture.src}
                alt="사용자 대표 이미지"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="text-lg font-bold text-gray-900">
              {data?.user_made_id ?? (isLoading ? "불러오는 중..." : "IPiece")}
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="mt-1 rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoggingOut ? "로그아웃 중..." : "로그아웃"}
          </button>
        </div>

        <div className="mb-4">
          <div className="mb-2 text-sm text-gray-700">보유 IP</div>
          {thumbnails.length ? (
            <div className="flex flex-wrap gap-2">
              {thumbnails.map((thumb, index) => (
                <div key={`${thumb}-${index}`} className="h-10 w-10 overflow-hidden rounded bg-amber-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={thumb} alt="보유 IP" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-base font-semibold text-gray-400">{isLoading ? "불러오는 중..." : "0 IP"}</div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between gap-8 text-sm">
          <div className="flex w-1/2 items-center pr-4">
            <span className="text-gray-500">보유 KRW</span>
            <span className="ml-auto text-lg font-bold text-gray-900">
              {formatCurrency(data?.total_krw)} <span className="text-xs font-normal text-gray-500">KRW</span>
            </span>
          </div>
          <div className="flex w-1/2 items-center pl-4">
            <span className="text-gray-500">총 보유자산</span>
            <span className="ml-auto text-lg font-bold text-gray-900">
              {formatCurrency(data?.total_assets)} <span className="text-xs font-normal text-gray-500">KRW</span>
            </span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-6 border-t border-gray-200 pt-4 text-sm">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">총 매수</span>
              <span>
                {formatCurrency(data?.total_buy_amount)} <span className="text-xs text-gray-500">KRW</span>
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">총 평가</span>
              <span>
                {formatCurrency(data?.total_evaluation)} <span className="text-xs text-gray-500">KRW</span>
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">주문 가능</span>
              <span>
                {formatCurrency(data?.available_krw)} <span className="text-xs text-gray-500">KRW</span>
              </span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">총 평가손익</span>
              <span className={getTrendColor(data?.total_profit)}>{formatSignedCurrency(data?.total_profit)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">총 평가수익률</span>
              <span className={getTrendColor(data?.total_profit_rate)}>
                {typeof data?.total_profit_rate === "number"
                  ? `${data.total_profit_rate > 0 ? "+" : ""}${data.total_profit_rate.toFixed(2)} %`
                  : "-"}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
