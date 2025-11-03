"use client"

import { Card, CardContent } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"

interface PortfolioPieChartProps {
  hasAssets?: boolean
}

const portfolioData = [
  { name: "다이노봇", value: 48.2, color: "#10B981" },
  { name: "조구만", value: 25.2, color: "#06B6D4" },
  { name: "뽀모도", value: 12.4, color: "#EC4899" },
  { name: "뽀뽀", value: 8.2, color: "#8B5CF6" },
  { name: "크롱", value: 8.2, color: "#EF4444" },
  { name: "조가수", value: 4.2, color: "#F59E0B" },
]

export default function PortfolioPieChart({ hasAssets = true }: PortfolioPieChartProps) {
  return (
    <Card>
      <CardContent className="p-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-700 pl-4">보유자산 포트폴리오</h3>
          <button className="text-gray-400 hover:text-gray-600" aria-label="새로고침">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
            </svg>
          </button>
        </div>

        {hasAssets ? (
          <div className="flex items-center justify-center gap-8">
            {/* Pie Chart */}
            <div className="w-64 h-64 relative ml-[-2rem]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={portfolioData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {portfolioData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
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
            <p className="text-gray-500">데이터가 없습니다.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
