'use client';

import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { PieChart, Pie, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import type { PortfolioRatioItem } from './types';

interface PortfolioPieChartProps {
  ratios?: PortfolioRatioItem[];
  isLoading?: boolean;
}

// 색상 그룹을 교차 배치(노 → 초 → 파 → 주 → 남 → 보 → 빨 순으로 한 톤씩 번갈아 사용)
const COLOR_GROUPS = [
  ['#FFD43B', '#F6D743', '#FFEC99'], // 노랑
  ['#69DB7C', '#4FAA6D', '#8BD37F'], // 초록
  ['#4DABF7', '#2F83E4', '#7FB8F8'], // 파랑
  ['#F08A1C', '#F7B267', '#F59F50'], // 주황
  ['#2FB5C8', '#17BEBB', '#009FB7'], // 남색/청록
  ['#9A7FC3', '#B197FC', '#9775FA'], // 보라
  ['#E7494F', '#E86B7B', '#F783AC'], // 빨강/핑크
];

const DEFAULT_COLORS = (() => {
  const res: string[] = [];
  const maxLen = Math.max(...COLOR_GROUPS.map((g) => g.length));
  for (let i = 0; i < maxLen; i++) {
    for (const group of COLOR_GROUPS) {
      if (group[i]) res.push(group[i]);
    }
  }
  return res;
})();

export default function PortfolioPieChart({
  ratios,
  isLoading,
}: PortfolioPieChartProps) {
  const sortedRatios = useMemo(() => {
    const list = ratios ?? [];
    return [...list].sort((a, b) => (b.ratio ?? 0) - (a.ratio ?? 0));
  }, [ratios]);

  const hasData = Boolean(sortedRatios.length);
  const chartData = useMemo(() => {
    if (!hasData) return [];
    return sortedRatios.map((item, index) => ({
      name: item.productName,
      value: item.ratio,
      color: DEFAULT_COLORS[index % DEFAULT_COLORS.length],
    }));
  }, [sortedRatios, hasData]);

  const compact = chartData.length > 10;

  return (
    <Card className="bg-[#FAFAFA]">
      <CardContent className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-700">
            보유자산 포트폴리오
          </h3>
        </div>
        {isLoading ? (
          <div className="flex h-64 items-center justify-center text-gray-400">
            불러오는 중...
          </div>
        ) : hasData ? (
          <div className="flex items-center justify-center gap-8">
            <div className="relative h-72 w-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={70}
                    outerRadius={130}
                    stroke="#fff"
                    strokeWidth={1.5}
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={entry.color}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: '1px solid #e5e7eb',
                      fontSize: 12,
                    }}
                    formatter={(value: number, _name, props) => [
                      `${value.toFixed(1)}%`,
                      props?.payload?.name ?? '',
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-20 flex flex-col items-center justify-center rounded-full bg-white text-center shadow-inner">
                <div className="text-xs text-gray-500">보유 비중</div>
                <div className="text-sm font-medium text-gray-700">(%)</div>
              </div>
            </div>
            <div className="space-y-2">
              {chartData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span
                    className={`${
                      compact ? 'text-xs' : 'text-sm'
                    } text-gray-700`}
                  >
                    {item.name}
                  </span>
                  <span
                    className={`ml-auto ${
                      compact ? 'text-xs' : 'text-sm'
                    } font-medium text-gray-900`}
                  >
                    {item.value.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex h-64 items-center justify-center text-gray-500">
            보유 중인 자산이 없습니다.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
