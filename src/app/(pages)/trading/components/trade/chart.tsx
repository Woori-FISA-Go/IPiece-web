'use client';

import type React from 'react';

import { useRef, useState } from 'react';
import { Card, CardContent } from '@/app/(pages)/trading/components/card';
import {
  MOCK_CANDLES_1D,
  MOCK_CANDLES_1W,
  MOCK_CANDLES_1M,
  type Candle,
} from '@/lib/mock-trading';

type Period = '1D' | '1W' | '1M';

export function TradingChart() {
  const [period, setPeriod] = useState<Period>('1D');
  const [hoveredPoint, setHoveredPoint] = useState<{
    candle: Candle;
    x: number;
    y: number;
  } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const data =
    period === '1D'
      ? MOCK_CANDLES_1D
      : period === '1W'
        ? MOCK_CANDLES_1W
        : MOCK_CANDLES_1M;

  const minWidth = 620;
  const height = 320;
  const padding = { top: 68, right: 92, bottom: 88, left: 40 };
  const baseChartWidth = minWidth - padding.left - padding.right;
  const chartWidth = baseChartWidth;
  const svgWidth = minWidth;
  const chartHeight = height - padding.top - padding.bottom;

  // Calculate min/max for scaling
  const prices = data.map((d) => d.c);
  const minPrice = Math.min(...prices) * 0.98;
  const maxPrice = Math.max(...prices) * 1.02;

  // Scale functions
  const denominator = Math.max(1, data.length - 1);
  const xScale = (index: number) =>
    padding.left + (index / denominator) * chartWidth;
  const yScale = (price: number) =>
    padding.top + ((maxPrice - price) / (maxPrice - minPrice)) * chartHeight;

  // Generate path for line chart
  const linePath = data
    .map((d, i) => {
      const x = xScale(i);
      const y = yScale(d.c);
      return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    })
    .join(' ');

  // Generate path for gradient area
  const areaPath =
    linePath +
    ` L ${xScale(data.length - 1)} ${height - padding.bottom} L ${padding.left} ${height - padding.bottom} Z`;

  // Y-axis labels
  const yLabels = [maxPrice, (maxPrice + minPrice) / 2, minPrice].map(
    (price) => ({
      price: Math.round(price),
      y: yScale(price),
    }),
  );

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find closest data point
    const index = Math.round(
      ((x - padding.left) / chartWidth) * (data.length - 1),
    );
    if (index >= 0 && index < data.length) {
      const candle = data[index];
      const pointX = xScale(index);
      const pointY = yScale(candle.c);
      setHoveredPoint({ candle, x: pointX, y: pointY });
    }
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };

  return (
    <Card className="flex h-full flex-col rounded-2xl shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="flex h-full flex-col gap-6 p-6 pt-8 pb-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">차트</h2>
          <div className="flex gap-2">
            {(['1D', '1W', '1M'] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  period === p
                    ? 'bg-[#EAECF0] text-black font-medium'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="relative -mx-4 flex-1 select-none overflow-hidden px-2 py-2 pb-6">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${svgWidth} ${height}`}
            className="h-full min-h-[260px]"
            width="100%"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <defs>
              <linearGradient
                id="chartGradient"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#1A4DE5" stopOpacity="0.68" />
                <stop offset="100%" stopColor="#1A4DE5" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            {yLabels.map((label, i) => (
              <line
                key={i}
                x1={padding.left}
                y1={label.y}
                x2={svgWidth - padding.right}
                y2={label.y}
                stroke="#E5E7EB"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            ))}

            {/* Area fill */}
            <path d={areaPath} fill="url(#chartGradient)" />

            {/* Line chart */}
            <path d={linePath} fill="none" stroke="#1A4DE5" strokeWidth="1.25" />

            {/* Y-axis labels */}
            {yLabels.map((label, i) => (
              <text
                key={i}
                x={svgWidth - padding.right + 10}
                y={label.y}
                fill="#6B7280"
                fontSize="10"
                dominantBaseline="middle"
              >
                {label.price.toLocaleString()}원
              </text>
            ))}


            {/* Hover point and line */}
            {hoveredPoint && (
              <>
                <line
                  x1={hoveredPoint.x}
                  y1={padding.top}
                  x2={hoveredPoint.x}
                  y2={height - padding.bottom}
                  stroke="#9CA3AF"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <circle
                  cx={hoveredPoint.x}
                  cy={hoveredPoint.y}
                  r="2.5"
                  fill="#1A4DE5"
                  stroke="white"
                  strokeWidth="1.25"
                />
              </>
            )}
          </svg>

          {/* Tooltip */}
          {hoveredPoint && (
            <div
              className="absolute bg-[#1A4DE5] text-white text-xs rounded-lg px-3 py-2 pointer-events-none shadow-lg"
              style={{
                left: `${hoveredPoint.x}px`,
                top: `${Math.max(padding.top, hoveredPoint.y - 48)}px`,
                transform: 'translate(-50%, -100%)',
              }}
            >
              <div className="font-medium">{hoveredPoint.candle.t}</div>
              <div>거래량: {hoveredPoint.candle.v}</div>
              <div className="font-semibold">
                {hoveredPoint.candle.c.toLocaleString()} ₩
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
