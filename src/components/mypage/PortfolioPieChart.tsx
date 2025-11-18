"use client"

import { Card, CardContent } from "@/components/ui/card"

interface PortfolioPieChartProps {
  hasAssets?: boolean
}

const portfolioData = [
  { name: "아이피봇", value: 48.2, color: "#10B981" },
  { name: "조구", value: 25.2, color: "#06B6D4" },
  { name: "뽀모도", value: 12.4, color: "#EC4899" },
  { name: "뽀뽀", value: 8.2, color: "#8B5CF6" },
  { name: "아롱", value: 8.2, color: "#EF4444" },
  { name: "조이", value: 4.2, color: "#F59E0B" },
]

export default function PortfolioPieChart({ hasAssets = true }: PortfolioPieChartProps) {
  const total = portfolioData.reduce((sum, item) => sum + item.value, 0) || 1
  const gradientStops = portfolioData.reduce<{ segments: string[]; acc: number }>(
    (acc, item) => {
      const start = (acc.acc / total) * 100
      const end = ((acc.acc + item.value) / total) * 100
      acc.segments.push(`${item.color} ${start}% ${end}%`)
      return { segments: acc.segments, acc: acc.acc + item.value }
    },
    { segments: [], acc: 0 },
  ).segments.join(", ")

  return (
    <>
      <Card>
        <CardContent className="p-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-700 pl-4">보유자산 포트폴리오</h3>
          </div>

          {hasAssets ? (
            <div className="flex items-center justify-center gap-8">
              <div className="relative ml-[-2rem] h-64 w-64">
                <div
                  className="h-full w-full rounded-full border border-gray-100"
                  style={{ backgroundImage: `conic-gradient(${gradientStops})` }}
                  aria-label="보유 자산 비중"
                />
                <div className="absolute inset-12 flex flex-col items-center justify-center rounded-full bg-white text-center shadow-inner">
                  <div className="text-xs text-gray-500">보유 비중</div>
                  <div className="text-sm font-medium text-gray-700">(%)</div>
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-2">
                {portfolioData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-gray-700">{item.name}</span>
                    <span className="text-sm font-medium text-gray-900 ml-auto">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">보유 종목이 없습니다.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
