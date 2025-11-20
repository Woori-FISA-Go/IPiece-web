'use client';

import type React from 'react';
import type { CSSProperties } from 'react';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useLayoutEffect,
  useId,
} from 'react';
import { Card, CardContent } from '@/components/ui/card';
import type { Candle } from '@/lib/mock-trading';
import { apiFetch } from '@/lib/api-client';

type Period = '1D' | '1W' | '1M';
type ChartInterval = '1d' | '1w' | '1m';

type ChartApiResponse = {
  product_id: number;
  interval: ChartInterval;
  window?: { start_at: string; end_at: string };
  points?: Array<{ ts: string; price: number; volume?: number }>;
  has_more?: boolean;
  next_cursor?: string;
  fetched_at?: string;
};

interface HoverPoint {
  candle: Candle;
  x: number;
  y: number;
}

interface TradingChartProps {
  productId?: number | string;
}

export function TradingChart({ productId }: TradingChartProps) {
  const [period, setPeriod] = useState<Period>('1W');
  const [candles, setCandles] = useState<Candle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<HoverPoint | null>(null);
  const chartAreaRef = useRef<HTMLDivElement>(null);
  const chartScrollRef = useRef<HTMLDivElement>(null);
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

  const visibleData = candles;

  const height = 320;
  const padding = { top: 68, right: 28, bottom: 88, left: 40 };
  const defaultContainerWidth = 620;
  const [containerWidth, setContainerWidth] = useState(defaultContainerWidth);
  const pointSpacing = 24;
  const baseCanvasWidth = Math.max(
    containerWidth,
    padding.left +
      padding.right +
      Math.max(visibleData.length - 1, 1) * pointSpacing,
  );
  const chartWidth = Math.max(
    0,
    baseCanvasWidth - padding.left - padding.right,
  );
  const chartHeight = height - padding.top - padding.bottom;
  const chartBaseline = padding.top + chartHeight;
  const gradientId = useId();

  useLayoutEffect(() => {
    const element = chartScrollRef.current;
    if (!element) return;

    const updateDimensions = () => {
      const width = element.clientWidth || defaultContainerWidth;
      setContainerWidth(width);
    };

    updateDimensions();
    const observer = new ResizeObserver(updateDimensions);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const scroller = chartScrollRef.current;
    if (!scroller) return;
    scroller.scrollLeft = scroller.scrollWidth - scroller.clientWidth;
  }, [period, visibleData.length, baseCanvasWidth]);

  const hasData = visibleData.length > 0;
  const prices = hasData ? visibleData.map((d) => d.c) : [0];
  const minPrice = hasData ? Math.min(...prices) * 0.98 : 0;
  const maxPrice = hasData ? Math.max(...prices) * 1.02 : 0;

  const xScale = (index: number) => {
    if (visibleData.length <= 1) {
      return padding.left + chartWidth / 2;
    }
    return padding.left + (index / (visibleData.length - 1)) * chartWidth;
  };
  const yScale = (price: number) =>
    padding.top +
    ((maxPrice - price) / (maxPrice - minPrice || 1)) * chartHeight;

  const { areaPath, linePath } = useMemo(() => {
    if (!visibleData.length) {
      return { areaPath: '', linePath: '' };
    }
    const points = visibleData.map((candle, index) => ({
      x: xScale(index),
      y: yScale(candle.c),
    }));
    const first = points[0];
    const last = points[points.length - 1];
    const areaCommands = [
      `M ${first.x} ${chartBaseline}`,
      `L ${first.x} ${first.y}`,
      ...points.slice(1).map((point) => `L ${point.x} ${point.y}`),
      `L ${last.x} ${chartBaseline}`,
      `L ${first.x} ${chartBaseline}`,
      'Z',
    ];
    const lineCommands = [
      `M ${first.x} ${first.y}`,
      ...points.slice(1).map((point) => `L ${point.x} ${point.y}`),
    ];
    return {
      areaPath: areaCommands.join(' '),
      linePath: lineCommands.join(' '),
    };
  }, [chartBaseline, visibleData, xScale, yScale]);

  const yTicks = useMemo(() => {
    if (!hasData) return [0];
    return [minPrice, (minPrice + maxPrice) / 2, maxPrice];
  }, [hasData, minPrice, maxPrice]);

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

  const mapPointLabel = useCallback(
    (timestamp: string) => {
      const date = new Date(timestamp);
      if (Number.isNaN(date.getTime())) return timestamp;
      if (period === '1D') {
        return `${date.getHours().toString().padStart(2, '0')}:${date
          .getMinutes()
          .toString()
          .padStart(2, '0')}`;
      }
      return `${date.getMonth() + 1}/${date.getDate()}`;
    },
    [period],
  );

  useEffect(() => {
    let cancelled = false;

    const fetchChart = async () => {
      if (!productId) {
        setCandles([]);
        return;
      }
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const intervalParam = period.toLowerCase() as ChartInterval;
        const res = await apiFetch(
          `/v1/market/${productId}/chart?interval=${intervalParam}`,
        );
        if (!res.ok) {
          throw new Error(`Failed chart fetch: ${res.status}`);
        }
        const payload = (await res.json()) as ChartApiResponse;
        const mapped = (payload.points ?? []).map((point) => ({
          t: mapPointLabel(point.ts),
          o: point.price,
          h: point.price,
          l: point.price,
          c: point.price,
          v: point.volume ?? 0,
        }));
        if (!cancelled) {
          setCandles(mapped);
        }
      } catch (err) {
        console.error('Failed to fetch chart data', err);
        if (!cancelled) {
          setErrorMessage('차트를 불러오지 못했습니다.');
          setCandles([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchChart();
    return () => {
      cancelled = true;
    };
  }, [mapPointLabel, period, productId]);

  const tooltipStyle = useMemo(() => {
    if (!hoveredPoint) return null;
    const safeTop = Math.max(padding.top + 12, hoveredPoint.y - 48);
    const maxPoint = baseCanvasWidth - padding.right - 8;
    const minPoint = padding.left + 8;
    let left = hoveredPoint.x;
    let translateX = '-50%';
    if (left > maxPoint - 60) {
      left = Math.min(maxPoint, left);
      translateX = '-100%';
    } else if (left < minPoint + 60) {
      left = Math.max(minPoint, left);
      translateX = '0';
    }
    return {
      left: `${left}px`,
      top: `${safeTop}px`,
      transform: `translate(${translateX}, -100%)`,
    } as React.CSSProperties;
  }, [hoveredPoint, baseCanvasWidth, padding.left, padding.right, padding.top]);
  const scrollStyle = useMemo<CSSProperties>(
    () => ({ scrollbarWidth: 'none' }),
    [],
  );

  const updateHover = useCallback(
    (
      clientX: number,
      clientY: number,
      rect: DOMRect | null,
      scrollLeft = 0,
    ) => {
      if (!rect || chartWidth <= 0) return;

      const localX = clientX - rect.left;
      const localY = clientY - rect.top;

      if (
        localX < padding.left ||
        localX > baseCanvasWidth - padding.right ||
        localY < padding.top ||
        localY > height - padding.bottom
      ) {
        setHoveredPoint(null);
        return;
      }

      const relativeX = localX - padding.left + scrollLeft;
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
      padding.right,
      padding.top,
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
      const rect =
        chartAreaRef.current?.getBoundingClientRect() ??
        e.currentTarget.getBoundingClientRect();
      const scrollLeft = chartScrollRef.current?.scrollLeft ?? 0;
      updateHover(e.clientX, e.clientY, rect, scrollLeft);
    },
    [updateHover],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (drag.active) {
        const scroller = chartScrollRef.current;
        if (scroller) {
          const delta = drag.lastX - e.clientX;
          scroller.scrollLeft = Math.max(0, scroller.scrollLeft + delta);
        }
        drag.lastX = e.clientX;
        drag.accumulated = 0;
      }

      const rect =
        chartAreaRef.current?.getBoundingClientRect() ??
        e.currentTarget.getBoundingClientRect();
      const scrollLeft = chartScrollRef.current?.scrollLeft ?? 0;
      updateHover(e.clientX, e.clientY, rect, scrollLeft);
    },
    [updateHover],
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
      const rect =
        chartAreaRef.current?.getBoundingClientRect() ??
        e.currentTarget.getBoundingClientRect();
      const scrollLeft = chartScrollRef.current?.scrollLeft ?? 0;
      updateHover(e.clientX, e.clientY, rect, scrollLeft);
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
          ref={chartScrollRef}
          className="relative -mx-4 flex-1 select-none overflow-x-auto overflow-y-hidden px-2 py-2 pb-6"
          style={scrollStyle}
        >
          {hasData ? (
            <div
              ref={chartAreaRef}
              className="relative h-full"
              style={{ height, width: baseCanvasWidth }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerLeave}
              onPointerCancel={handlePointerLeave}
            >
              <svg
                width={baseCanvasWidth}
                height={height}
                role="img"
                aria-label="거래 차트"
              >
                <defs>
                  <linearGradient
                    id={gradientId}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#1A4DE5" stopOpacity="0.68" />
                    <stop offset="100%" stopColor="#1A4DE5" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {yTicks.map((tick) => {
                  const y = yScale(tick);
                  return (
                    <g key={`tick-${tick}`}>
                      <line
                        x1={padding.left}
                        x2={baseCanvasWidth - padding.right}
                        y1={y}
                        y2={y}
                        stroke="#E5E7EB"
                        strokeDasharray="4 4"
                      />
                      <text
                        x={baseCanvasWidth - padding.right + 6}
                        y={y + 4}
                        fill="#6B7280"
                        fontSize={10}
                      >
                        {`${Math.round(tick).toLocaleString('ko-KR')}원`}
                      </text>
                    </g>
                  );
                })}
                {areaPath && (
                  <>
                    <path
                      d={areaPath}
                      fill={`url(#${gradientId})`}
                      stroke="none"
                    />
                    <path
                      d={linePath}
                      fill="none"
                      stroke="#1A4DE5"
                      strokeWidth={1.25}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />
                    {visibleData.map((candle, index) => (
                      <circle
                        key={`point-${candle.t}-${index}`}
                        cx={xScale(index)}
                        cy={yScale(candle.c)}
                        r={4}
                        fill="#1A4DE5"
                        stroke="#ffffff"
                        strokeWidth={1}
                      />
                    ))}
                 </>
               )}
              </svg>

              {hoveredPoint && (
                <>
                  <div
                    className="absolute"
                    style={{
                      left: `${hoveredPoint.x}px`,
                      top: `${padding.top}px`,
                      height: `${chartHeight}px`,
                      borderLeft: '1px dashed #9CA3AF',
                      transform: 'translateX(-0.5px)',
                      pointerEvents: 'none',
                    }}
                  />
                  <div
                    className="absolute"
                    style={{
                      left: `${hoveredPoint.x - 5}px`,
                      top: `${hoveredPoint.y - 5}px`,
                      width: '10px',
                      height: '10px',
                      backgroundColor: '#1A4DE5',
                      border: '1.25px solid #ffffff',
                      borderRadius: '9999px',
                      pointerEvents: 'none',
                    }}
                  />
                  <div
                    className="absolute"
                    style={{
                      left: `${hoveredPoint.x - 3}px`,
                      top: `${hoveredPoint.y - 3}px`,
                      width: '6px',
                      height: '6px',
                      backgroundColor: '#ffffff',
                      borderRadius: '9999px',
                      pointerEvents: 'none',
                    }}
                  />
                  {tooltipStyle && (
                    <div
                      className="absolute pointer-events-none rounded-lg bg-[#1A4DE5] px-3 py-2 text-xs text-white shadow-lg"
                      style={tooltipStyle}
                    >
                      <div className="font-medium">{hoveredPoint.candle.t}</div>
                      <div>거래량: {hoveredPoint.candle.v}</div>
                      <div className="font-semibold">
                        {hoveredPoint.candle.c.toLocaleString('ko-KR')} ₩
                      </div>
                    </div>
                  )}
                </>
              )}

              <div
                className="absolute bottom-[18px] left-0 right-0 flex justify-between px-8 text-[10px] text-gray-500"
                style={{ pointerEvents: 'none' }}
              >
                {axisLabels.map((label, index) => (
                  <span key={`${label}-${index}`} className="truncate">
                    {label}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex h-[320px] items-center justify-center rounded-xl border border-dashed border-slate-200 text-sm text-slate-400">
              {errorMessage
                ? errorMessage
                : isLoading
                  ? '차트 데이터를 불러오는 중...'
                  : '차트 준비 중...'}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
