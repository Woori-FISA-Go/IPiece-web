"use client"

import { useEffect, useMemo, useState } from "react"

import { Button } from "./ui/button"
import type { OfferingDetail } from "../types"
import { deriveOfferingStatus, resolveImage } from "../utils"

interface OfferingHeroProps {
  onParticipate: () => void
  detail?: OfferingDetail | null
  isLoading?: boolean
}

const CIRCLE_SIZE = 96
const STROKE_WIDTH = 10
const RADIUS = CIRCLE_SIZE / 2 - STROKE_WIDTH / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const STATUS_STYLES = {
  UPCOMING: {
    text: "시작 전",
    className: "bg-[#E3F3E6]/80 text-[#1C7C3B]",
  },
  ONGOING: {
    text: "진행 중",
    className: "bg-[#E2EEFF]/80 text-[#1D5ED8]",
  },
  ENDED: {
    text: "종료",
    className: "bg-[#ECEEF2]/80 text-[#6B7280]",
  },
} as const

export function OfferingHero({ onParticipate, detail, isLoading }: OfferingHeroProps) {
  const targetProgress = useMemo(() => {
    if (typeof detail?.progressRate === "number") {
      return Math.max(0, Math.min(detail.progressRate, 100))
    }
    return 0
  }, [detail?.progressRate])

  const [progress, setProgress] = useState(targetProgress)

  useEffect(() => {
    let animationFrame: number
    const duration = 600
    const start = performance.now()
    const initial = progress

    const animate = (timestamp: number) => {
      const elapsed = timestamp - start
      const ratio = Math.min(elapsed / duration, 1)
      const eased = easeOutCubic(ratio)
      const value = initial + (targetProgress - initial) * eased
      setProgress(value)
      if (ratio < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [targetProgress])

  const dashOffset = useMemo(() => CIRCUMFERENCE * (1 - progress / 100), [progress])
  const startDate = formatDate(detail?.offeringStartDate)
  const endDate = formatDate(detail?.offeringEndDate)
  const priceLabel = detail?.offeringPrice
    ? `1 ${detail?.tokenName ?? "Token"} TOKEN × ${detail.offeringPrice.toLocaleString("ko-KR")}원`
    : "가격 정보 없음"
  const status = detail ? deriveOfferingStatus(detail) : "ONGOING"
  const statusStyle = STATUS_STYLES[status]
  const ownerLabel = detail?.owner ?? detail?.tokenName ?? "발행사 정보 없음"

  const heroBackground = detail?.presentImg ? resolveImage(detail.presentImg) : null

  return (
    <section
      className="py-24 min-h-[520px]"
      style={
        heroBackground
          ? {
              backgroundImage: `url(${heroBackground})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : { backgroundColor: "#D7D7D7" }
      }
    >
      <div className="container mx-auto flex flex-col gap-10 px-10 text-left sm:px-16 lg:px-20 xl:px-24">
        <div className="flex w-full max-w-[480px] flex-col gap-8 rounded-3xl bg-white/45 p-8 backdrop-blur-md">
          <div className="flex items-start justify-between gap-6">
            <div className="space-y-3">
              <span className={`inline-flex items-center rounded-full px-4 py-1 text-sm font-semibold ${statusStyle.className}`}>
                {statusStyle.text}
              </span>
              <div className="space-y-1">
                <h1 className="text-[32px] font-bold text-[#101319]">
                  {detail?.productName ?? (isLoading ? "상세 정보를 불러오는 중" : "상품 정보를 찾을 수 없습니다.")}
                </h1>
                <p className="text-sm font-semibold text-[#4B4E57]">{ownerLabel}</p>
              </div>
            </div>

            <div className="relative h-[96px] w-[96px]">
              <svg
                viewBox={`0 0 ${CIRCLE_SIZE} ${CIRCLE_SIZE}`}
                className="h-full w-full"
                style={{ transform: "rotate(-90deg)" }}
                role="img"
                aria-label={`진행률 ${Math.round(progress)}%`}
              >
                <circle
                  cx={CIRCLE_SIZE / 2}
                  cy={CIRCLE_SIZE / 2}
                  r={RADIUS}
                  stroke="#D3DBE8"
                  strokeWidth={STROKE_WIDTH}
                  fill="none"
                />
                <circle
                  cx={CIRCLE_SIZE / 2}
                  cy={CIRCLE_SIZE / 2}
                  r={RADIUS}
                  stroke="#3386E5"
                  strokeWidth={STROKE_WIDTH}
                  fill="none"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dashoffset 0.3s ease-out" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-semibold text-[#101319]">{Math.round(progress)}%</span>
              </div>
            </div>
          </div>

          <hr className="border border-[#101319]" />

          <div className="flex flex-col gap-3 text-sm text-[#101319]">
            <InfoRow label="공모 시작일" value={startDate} />
            <InfoRow label="공모 종료일" value={endDate} />
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-sm font-bold text-[#101319]">공모가</span>
            <span className="text-base text-[#101319]">{priceLabel}</span>
          </div>

          <Button
            onClick={onParticipate}
            disabled={isLoading}
            className="h-12 w-full rounded-lg bg-[#3386E5] text-base font-semibold text-white hover:bg-[#2a75d0] disabled:cursor-not-allowed disabled:opacity-70"
          >
            공모 참여하기
          </Button>
        </div>
      </div>
    </section>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-6">
      <span className="text-sm font-bold text-[#101319]">{label}</span>
      <span className="text-base font-bold text-[#101319]">{value}</span>
    </div>
  )
}

function formatDate(value?: string) {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  const yyyy = date.getFullYear()
  const mm = `${date.getMonth() + 1}`.padStart(2, "0")
  const dd = `${date.getDate()}`.padStart(2, "0")
  return `${yyyy}.${mm}.${dd}`
}

function easeOutCubic(x: number) {
  return 1 - Math.pow(1 - x, 3)
}
