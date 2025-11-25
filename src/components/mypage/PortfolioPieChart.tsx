"use client"

import { useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import type { PortfolioRatioItem } from "./types"

interface PortfolioPieChartProps {
  ratios?: PortfolioRatioItem[]
  isLoading?: boolean
}

const CHART_COLORS = Array.from({ length: 100 }, (_, index) => {
  const hue = (index * 29) % 360
  return `hsl(${hue}, 75%, 55%)`
})

export default function PortfolioPieChart({ ratios, isLoading }: PortfolioPieChartProps) {
  const sortedRatios = useMemo(() => {
    const list = ratios ?? []
    return [...list].sort((a, b) => (b.ratio ?? 0) - (a.ratio ?? 0))
  }, [ratios])

  const hasData = Boolean(sortedRatios.length)

  const segments = useMemo(() => {
    if (!hasData) return []
    const total = sortedRatios.reduce((sum, item) => sum + item.ratio, 0) || 1
    let acc = 0
    return sortedRatios.map((item, index) => {
      const start = (acc / total) * 100
      acc += item.ratio
      const end = (acc / total) * 100
      return {
        ...item,
        color: CHART_COLORS[index % CHART_COLORS.length],
        start,
        end,
      }
    })
  }, [sortedRatios, hasData])

  const compact = segments.length > 10

  return (
    <Card className="bg-[#FAFAFA]">
      <CardContent className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-700">보유자산 포트폴리오</h3>
        </div>
        {isLoading ? (
          <div className="flex h-64 items-center justify-center text-gray-400">불러오는 중...</div>
        ) : hasData ? (
          <div className="flex items-center justify-center gap-8">
            <div className="relative h-64 w-64">
              <div
                className="h-full w-full rounded-full border border-gray-100"
                style={{ backgroundImage: `conic-gradient(${segments.map((item) => `${item.color} ${item.start}% ${item.end}%`).join(", ")})` }}
                aria-label="보유 비중"
              />
              <div className="absolute inset-12 flex flex-col items-center justify-center rounded-full bg-white text-center shadow-inner">
                <div className="text-xs text-gray-500">보유 비중</div>
                <div className="text-sm font-medium text-gray-700">(%)</div>
              </div>
            </div>
            <div className="space-y-2">
              {segments.map((item) => (
                <div key={item.productName} className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className={`${compact ? "text-xs" : "text-sm"} text-gray-700`}>{item.productName}</span>
                  <span className={`ml-auto ${compact ? "text-xs" : "text-sm"} font-medium text-gray-900`}>
                    {item.ratio.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex h-64 items-center justify-center text-gray-500">보유 중인 자산이 없습니다.</div>
        )}
      </CardContent>
    </Card>
  )
}
