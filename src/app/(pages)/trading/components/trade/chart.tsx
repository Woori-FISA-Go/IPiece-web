'use client';

import type React from 'react';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Card, CardContent } from '@/app/(pages)/trading/components/card';
import {
  MOCK_CANDLES_1D,
  MOCK_CANDLES_1M,
  MOCK_CANDLES_1W,
  type Candle,
} from '@/lib/mock-trading';

type Period = '1D' | '1W' | '1M';

const DEFAULT_WINDOW_BY_PERIOD: Record<Period, number> = {
  '1D': 60,
  '1W': 40,
  '1M': 36,
};

interface HoverPoint {
  candle: Candle;
  x: number;
  y: number;
}

export function TradingChart() {
  const [period, setPeriod] = useState<Period>('1D');
  const [hoveredPoint, setHoveredPoint] = useState<HoverPoint | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<{
    active: boolean;
    pointerId: number | null;
    lastX: number;
    accumulated: number;
  }>({
    active: false,
    pointerId: null,
    lastX: 0,
    accumulated: 0,
  });

  const [rangeStartByPeriod, setRangeStartByPeriod] = useState<
    Record<Period, number>
  >(() => {
    const initial = {} as Record<Period, number>;
    (['1D', '1W', '1M'] as Period[]).forEach((p) => {
      const sourceLength =
        p === '1D'
          ? MOCK_CANDLES_1D.length
          : p === '1W'
            ? MOCK_CANDLES_1W.length
            : MOCK_CANDLES_1M.length;
      const baseWindow = Math.min(DEFAULT_WINDOW_BY_PERIOD[p], sourceLength);
      initial[p] = Math.max(0, sourceLength - baseWindow);
    });
    return initial;
  });

  const data =
    period === '1D'
      ? MOCK_CANDLES_1D
      : period === '1W'
        ? MOCK_CANDLES_1W
        : MOCK_CANDLES_1M;

  useEffect(() => {
    const windowSize = Math.min(DEFAULT_WINDOW_BY_PERIOD[period], data.length);
    const maxStart = Math.max(0, data.length - windowSize);

    setRangeStartByPeriod((prev) => {
      const previousStart = prev[period];
      const nextStart =
        previousStart === undefined ? maxStart : Math.min(previousStart, maxStart);

      if (nextStart === previousStart) {
        if (previousStart === undefined) {
          return { ...prev, [period]: maxStart };
        }
        return prev;
      }

      return { ...prev, [period]: nextStart };
    });
    setHoveredPoint(null);
  }, [period, data.length]);

  const windowSize = Math.min(DEFAULT_WINDOW_BY_PERIOD[period], data.length);
  const maxStart = Math.max(0, data.length - windowSize);
  const currentRangeStart = Math.min(
    Math.max(rangeStartByPeriod[period] ?? maxStart, 0),
    maxStart,
  );
  const rangeEnd = Math.min(currentRangeStart + windowSize, data.length);
  const slicedData = data.slice(currentRangeStart, rangeEnd);
  const visibleData = slicedData.length > 0 ? slicedData : data;

  const minWidth = 620;
  const height = 320;
  const padding = { top: 68, right: 92, bottom: 88, left: 40 };
  const baseChartWidth = minWidth - padding.left - padding.right;
  const chartWidth = baseChartWidth;
  const svgWidth = minWidth;
  const chartHeight = height - padding.top - padding.bottom;

  const prices = visibleData.map((d) => d.c);
  const minPrice = Math.min(...prices) * 0.98;
  const maxPrice = Math.max(...prices) * 1.02;

  const xScale = (index: number) => {
    if (visibleData.length <= 1) {
      return padding.left + chartWidth / 2;
    }
    return padding.left + (index / (visibleData.length - 1)) * chartWidth;
  };
  const yScale = (price: number) =>
    padding.top +
    ((maxPrice - price) / (maxPrice - minPrice || 1)) * chartHeight;

  const linePath = visibleData
    .map((d, i) => {
      const x = xScale(i);
      const y = yScale(d.c);
      return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    })
    .join(' ');

  const areaPath =
    linePath +
    ` L ${xScale(visibleData.length - 1)} ${height - padding.bottom} L ${xScale(0)} ${height - padding.bottom} Z`;

  const yLabels = useMemo(
    () =>
      [maxPrice, (maxPrice + minPrice) / 2, minPrice].map((price) => ({
        price: Math.round(price),
        y: yScale(price),
      })),
    [maxPrice, minPrice, yScale],
  );

  const axisLabels = useMemo(() => {
    if (visibleData.length === 0) return [];
    const count = Math.min(5, visibleData.length);
    if (count === 1) return [visibleData[0].t];
    const step = (visibleData.length - 1) / (count - 1);
    return Array.from({ length: count }, (_, i) => {
      const idx = Math.round(i * step);
      return visibleData[idx]?.t ?? '';
    });
  }, [visibleData]);

  const shiftWindow = useCallback(
    (steps: number) => {
      if (steps === 0 || data.length <= windowSize) return;

      setRangeStartByPeriod((prev) => {
        const previous = prev[period] ?? maxStart;
        const next = Math.min(Math.max(previous - steps, 0), maxStart);
        if (next === previous) return prev;
        return { ...prev, [period]: next };
      });
    },
    [data.length, maxStart, period, windowSize],
  );

  const updateHover = useCallback(
    (clientX: number, clientY: number) => {
      if (!svgRef.current) return;

      const rect = svgRef.current.getBoundingClientRect();
      const localX = clientX - rect.left;
      const localY = clientY - rect.top;

      if (
        localX < padding.left ||
        localX > svgWidth - padding.right ||
        localY < padding.top ||
        localY > height - padding.bottom
      ) {
        setHoveredPoint(null);
        return;
      }

      const relativeX = localX - padding.left;
      const index =
        visibleData.length > 1
          ? Math.round((relativeX / chartWidth) * (visibleData.length - 1))
          : 0;
      const candle = visibleData[index];

      if (!candle) {
        setHoveredPoint(null);
        return;
      }

      setHoveredPoint({
        candle,
        x: xScale(index),
        y: yScale(candle.c),
      });
    },
    [
      chartWidth,
      height,
      padding.bottom,
      padding.left,
      padding.top,
      svgWidth,
      visibleData,
      xScale,
      yScale,
    ],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      dragRef.current = {
        active: true,
        pointerId: e.pointerId,
        lastX: e.clientX,
        accumulated: 0,
      };
      e.currentTarget.setPointerCapture(e.pointerId);
      updateHover(e.clientX, e.clientY);
    },
    [updateHover],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (drag.active) {
        const movement = e.clientX - drag.lastX;
        drag.lastX = e.clientX;
        drag.accumulated += movement;

        const threshold = 56;
        const steps = Math.trunc(drag.accumulated / threshold);

        if (steps !== 0) {
          shiftWindow(steps);
          drag.accumulated -= steps * threshold;
        }
      }

      updateHover(e.clientX, e.clientY);
    },
    [shiftWindow, updateHover],
  );

  const endDrag = useCallback((target: HTMLDivElement | null) => {
    if (
      dragRef.current.active &&
      dragRef.current.pointerId !== null &&
      target
    ) {
      target.releasePointerCapture(dragRef.current.pointerId);
    }

    dragRef.current = {
      active: false,
      pointerId: null,
      lastX: 0,
      accumulated: 0,
    };
  }, []);

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      endDrag(e.currentTarget);
      updateHover(e.clientX, e.clientY);
    },
    [endDrag, updateHover],
  );

  const handlePointerLeave = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      endDrag(e.currentTarget);
      setHoveredPoint(null);
    },
    [endDrag],
  );

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

        <div
          className="relative -mx-4 flex-1 select-none overflow-hidden px-2 py-2 pb-6"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerLeave}
          onPointerCancel={handlePointerLeave}
        >
          <svg
            ref={svgRef}
            viewBox={`0 0 ${svgWidth} ${height}`}
            className="h-full min-h-[260px]"
            width="100%"
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

            {yLabels.map((label, i) => (
              <line
                key={`grid-${i}`}
                x1={padding.left}
                y1={label.y}
                x2={svgWidth - padding.right}
                y2={label.y}
                stroke="#E5E7EB"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            ))}

            <path d={areaPath} fill="url(#chartGradient)" />

            <path d={linePath} fill="none" stroke="#1A4DE5" strokeWidth="1.25" />

            {yLabels.map((label, i) => (
              <text
                key={`ylabel-${i}`}
                x={svgWidth - padding.right + 10}
                y={label.y}
                fill="#6B7280"
                fontSize="10"
                dominantBaseline="middle"
              >
                {label.price.toLocaleString()}원
              </text>
            ))}

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

          {hoveredPoint && (
            <div
              className="absolute pointer-events-none rounded-lg bg-[#1A4DE5] px-3 py-2 text-xs text-white shadow-lg"
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

          <div className="absolute bottom-[18px] left-0 right-0 flex justify-between px-8 text-[10px] text-gray-500">
            {axisLabels.map((label, index) => (
              <span key={`${label}-${index}`} className="truncate">
                {label}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
