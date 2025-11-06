"use client"

import { useEffect, useState } from "react"

import { Button } from "./ui/button"

interface OfferingHeroProps {
  onParticipate: () => void
}

const PROGRESS_TARGET = 75
const CIRCLE_SIZE = 96
const STROKE_WIDTH = 10
const RADIUS = CIRCLE_SIZE / 2 - STROKE_WIDTH / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export function OfferingHero({ onParticipate }: OfferingHeroProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const duration = 800
    const steps = 60
    const increment = PROGRESS_TARGET / steps
    const stepDuration = duration / steps
    let current = 0

    const timer = setInterval(() => {
      current += 1
      setProgress(Math.min(current * increment, PROGRESS_TARGET))
      if (current >= steps) clearInterval(timer)
    }, stepDuration)

    return () => clearInterval(timer)
  }, [])

  const dashOffset = CIRCUMFERENCE * (1 - progress / 100)

  return (
    <section className="bg-[#D7D7D7] py-16">
      <div className="container mx-auto flex flex-col gap-10 px-10 text-left sm:px-16 lg:px-20 xl:px-24">
        <div className="flex w-full max-w-[420px] flex-col gap-8">
          <div className="flex items-start justify-between gap-6">
            <div className="space-y-3">
              <span
                className="inline-flex items-center rounded-full px-4 py-1 text-sm font-semibold text-[#3386E5]"
                style={{ backgroundColor: "rgba(184, 217, 255, 0.3)" }}
              >
                거래 가능
              </span>
              <div className="space-y-1">
                <h1 className="text-[32px] font-bold text-[#101319]">다이노탱</h1>
                <p className="text-sm font-semibold text-[#4B4E57]">Life in Marshville 🌿</p>
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
            <InfoRow label="거래가능일" value="2025.08.07" />
            <InfoRow label="다음 배당기준일" value="2025.12.17" />
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-sm font-bold text-[#101319]">공모가</span>
            <span className="text-base text-[#101319]">1 Dino Tokens 당 100원</span>
          </div>

          <Button
            onClick={onParticipate}
            className="h-12 w-full rounded-lg bg-[#3386E5] text-base font-semibold text-white hover:bg-[#2a75d0]"
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


