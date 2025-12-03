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
const PERIOD_OPTIONS: Period[] = ['1D', '1W', '1M'];
const DEFAULT_PERIOD: Period = '1D';
type ChartInterval = '1d' | '1w' | '1m';

const formatTimestampLabel = (timestamp: string, period: Period) => {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return timestamp;
  if (period === '1D') {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${month}/${day}`;
};

const formatDateTimeLabel = (timestamp: string) => {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return timestamp;
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');
  const hh = date.getHours().toString().padStart(2, '0');
  const mm = date.getMinutes().toString().padStart(2, '0');
  // 두 칸 공백으로 날짜/시간 구분
  return `${y}.${m}.${d}  ${hh}:${mm}`;
};

export type TradeTickMessage = {
  productId: number;
  tradePrice: number;
  tradeQuantity: number;
  matchTime: string;
};

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
  candle: ChartCandle;
  x: number;
  y: number;
}

type ChartCandle = Candle & { timestamp: string };

interface TradingChartProps {
  productId?: number | string;
  liveTick?: TradeTickMessage | null;
}

export function TradingChart({ productId, liveTick }: TradingChartProps) {
  const [period, setPeriod] = useState<Period>(DEFAULT_PERIOD);
  const [candles, setCandles] = useState<ChartCandle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<HoverPoint | null>(null);
  const chartAreaRef = useRef<HTMLDivElement>(null);
  const chartScrollRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
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

  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const visibleData = candles;

  const height = 320;
  const padding = { top: 68, right: 72, bottom: 88, left: 40 };
  const defaultContainerWidth = 620;
  const [containerWidth, setContainerWidth] = useState(defaultContainerWidth);
  const pointSpacing = 24;
  const MAX_CANDLES = 400;
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

  const getSmoothLineSegments = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return { move: '', segments: [] };
    if (points.length === 1) {
      const { x, y } = points[0];
      return { move: `M ${x} ${y}`, segments: [] };
    }
    const move = `M ${points[0].x} ${points[0].y}`;
    const segments: string[] = [];
    for (let i = 0; i < points.length - 1; i += 1) {
      const p0 = i > 0 ? points[i - 1] : points[i];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = i !== points.length - 2 ? points[i + 2] : p2;

      const c1x = p1.x + (p2.x - p0.x) / 6;
      const c1y = p1.y + (p2.y - p0.y) / 6;
      const c2x = p2.x - (p3.x - p1.x) / 6;
      const c2y = p2.y - (p3.y - p1.y) / 6;

      segments.push(`C ${c1x} ${c1y} ${c2x} ${c2y} ${p2.x} ${p2.y}`);
    }
    return { move, segments };
  };

  useEffect(() => {
    setPeriod(DEFAULT_PERIOD);
  }, [productId]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const displayPeriod = period;

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
    const { move, segments } = getSmoothLineSegments(points);
    const line = [move, ...segments].join(' ');
    const first = points[0];
    const last = points[points.length - 1];
    const area = [
      `M ${first.x} ${chartBaseline}`,
      move,
      ...segments,
      `L ${last.x} ${chartBaseline}`,
      `L ${first.x} ${chartBaseline}`,
      'Z',
    ].join(' ');
    return {
      areaPath: area,
      linePath: line,
    };
  }, [chartBaseline, visibleData, xScale, yScale]);

  const axisLabels = useMemo(() => {
    if (visibleData.length === 0) return [];
    const count = Math.min(5, visibleData.length);
    let lastDateStr: string | null = null;

    const buildLabel = (idx: number) => {
      const candle = visibleData[idx];
      const ts = candle?.timestamp;
      const labelDate = ts ? new Date(ts) : null;
      let dateLabel: string | undefined;
      let timeLabel = '';

      if (displayPeriod === '1D') {
        if (labelDate && !Number.isNaN(labelDate.getTime())) {
          const dateStr = `${labelDate.getFullYear()}-${labelDate.getMonth()}-${labelDate.getDate()}`;
          const isNewDay = lastDateStr !== dateStr;
          if (isNewDay) {
            dateLabel = `${labelDate.getMonth() + 1}/${labelDate.getDate()}`;
            lastDateStr = dateStr;
          }
        }
        // 1D 구간에서는 시간 없이 날짜만 표시
        timeLabel = '';
      } else {
        timeLabel = candle ? formatTimestampLabel(candle.timestamp, displayPeriod) : '';
      }

      return {
        dateLabel,
        timeLabel,
        index: idx,
      };
    };

    if (count === 1) {
      return [buildLabel(0)];
    }
    const step = (visibleData.length - 1) / (count - 1);
    return Array.from({ length: count }, (_, i) => buildLabel(Math.round(i * step)));
  }, [visibleData, displayPeriod]);

  const dateMarkers = useMemo(() => {
    if (visibleData.length === 0) return [];
    const markers: { index: number; label: string }[] = [];
    for (let i = 0; i < visibleData.length; i += 1) {
      const current = new Date(visibleData[i].timestamp);
      const prev = i > 0 ? new Date(visibleData[i - 1].timestamp) : null;
      const currentDay = `${current.getFullYear()}-${current.getMonth() + 1}-${current.getDate()}`;
      const prevDay =
        prev && !Number.isNaN(prev.getTime())
          ? `${prev.getFullYear()}-${prev.getMonth() + 1}-${prev.getDate()}`
          : null;
      if (i === 0 || currentDay !== prevDay) {
        markers.push({ index: i, label: `${current.getMonth() + 1}/${current.getDate()}` });
      }
    }
    return markers;
  }, [visibleData]);

  const yTicks = useMemo(() => {
    if (!hasData) return [0];
    const floorHundred = (value: number) => Math.floor(value / 100) * 100;
    const ceilHundred = (value: number) => Math.ceil(value / 100) * 100;
    const roundHundred = (value: number) => Math.round(value / 100) * 100;

    let roundedMin = floorHundred(minPrice);
    let roundedMax = ceilHundred(maxPrice);
    if (roundedMax === roundedMin) {
      roundedMax = roundedMin + 100;
    }
    const middle = roundHundred((roundedMin + roundedMax) / 2);
    return [roundedMin, middle, roundedMax];
  }, [hasData, minPrice, maxPrice]);

  const fetchChart = useCallback(
    async ({ cursor, append }: { cursor?: string | null; append?: boolean } = {}) => {
      if (!productId) {
        setCandles([]);
        return;
      }
      if (append && !cursor) return;
      append ? setIsFetchingMore(true) : setIsLoading(true);
      if (!append) setErrorMessage(null);
      try {
        const intervalParam = period.toLowerCase() as ChartInterval;
        const params = new URLSearchParams({ interval: intervalParam });
        if (cursor) params.set('cursor', cursor);
        const res = await apiFetch(
          `/v1/market/${productId}/chart?${params.toString()}`,
        );
        if (!res.ok) {
          throw new Error(`Failed chart fetch: ${res.status}`);
        }
        const payload = (await res.json()) as ChartApiResponse;
        const mapped: ChartCandle[] = (payload.points ?? []).map((point) => ({
          timestamp: point.ts,
          t: point.ts,
          o: point.price,
          h: point.price,
          l: point.price,
          c: point.price,
          v: point.volume ?? 0,
        }));
        setNextCursor(payload.next_cursor ?? null);
        setHasMore(Boolean(payload.has_more));
        const scroller = chartScrollRef.current;
        const prevScrollWidth = scroller?.scrollWidth ?? 0;
        setCandles((prev) => {
          if (append) {
            const existing = new Set(prev.map((candle) => candle.timestamp));
            const filtered = mapped.filter(
              (candle) => !existing.has(candle.timestamp),
            );
            if (!filtered.length) return prev;
            const nextCandles = [...filtered, ...prev].slice(-MAX_CANDLES);
            if (scroller) {
              requestAnimationFrame(() => {
                const current = chartScrollRef.current;
                if (!current) return;
                const newScrollWidth = current.scrollWidth;
                current.scrollLeft += newScrollWidth - prevScrollWidth;
              });
            }
            return nextCandles;
          }
          return mapped.slice(-MAX_CANDLES);
        });
      } catch (err) {
        console.error('Failed to fetch chart data', err);
        if (!append) {
          setErrorMessage('차트를 불러오지 못했습니다.');
          setCandles([]);
        }
      } finally {
        append ? setIsFetchingMore(false) : setIsLoading(false);
      }
    },
    [period, productId],
  );

  useEffect(() => {
    setCandles([]);
    setNextCursor(null);
    setHasMore(false);
    fetchChart();
  }, [fetchChart]);

  useEffect(() => {
    const scroller = chartScrollRef.current;
    if (!scroller) return;
    const handleScroll = () => {
      if (!hasMore || isFetchingMore || !nextCursor) return;
      if (scroller.scrollLeft <= 24) {
        fetchChart({ cursor: nextCursor, append: true });
      }
    };
    scroller.addEventListener('scroll', handleScroll);
    return () => scroller.removeEventListener('scroll', handleScroll);
  }, [fetchChart, hasMore, isFetchingMore, nextCursor]);

  useEffect(() => {
    if (!liveTick) return;
    const numericProduct = Number(productId);
    if (
      Number.isFinite(numericProduct) &&
      liveTick.productId !== numericProduct
    )
      return;
    if (period !== '1D') return;
    setCandles((prev) => {
      const timestamp = liveTick.matchTime;
      const candle: ChartCandle = {
        timestamp,
        t: timestamp,
        o: liveTick.tradePrice,
        h: liveTick.tradePrice,
        l: liveTick.tradePrice,
        c: liveTick.tradePrice,
        v: liveTick.tradeQuantity,
      };
      return [...prev, candle].slice(-MAX_CANDLES);
    });
  }, [liveTick, period, productId]);

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

      const scroller = chartScrollRef.current;
      if (scroller && scroller.scrollLeft <= 10 && hasMore && !isFetchingMore) {
        fetchChart({ cursor: nextCursor, append: true }).catch(() => null);
      }
    },
    [endDrag, updateHover, hasMore, isFetchingMore, fetchChart, nextCursor],
  );

  const handlePointerLeave = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      endDrag(e.currentTarget);
      setHoveredPoint(null);
    },
    [endDrag],
  );

  if (!mounted) {
    return null;
  }

  return (
    <Card className="flex h-full flex-col rounded-2xl shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="flex h-full flex-col gap-6 p-6 pt-8 pb-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">차트</h2>
          <div className="flex gap-2">
            {PERIOD_OPTIONS.map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  displayPeriod === p
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
          className="relative -mx-4 flex flex-1 select-none items-center overflow-x-auto overflow-y-hidden px-2 py-2 pb-6"
          style={scrollStyle}
        >
          <div
            ref={chartAreaRef}
            className="relative"
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
                  <stop offset="0%" stopColor="#2563EB" stopOpacity="0.68" />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
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
                      stroke="#2563EB"
                      strokeWidth={1.25}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />
                  </>
                )}
              </svg>

              {hoveredPoint && hasData && (
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
                      left: `${hoveredPoint.x - 4}px`,
                      top: `${hoveredPoint.y - 4}px`,
                      width: '8px',
                      height: '8px',
                      backgroundColor: '#2563EB',
                      borderRadius: '9999px',
                      pointerEvents: 'none',
                    }}
                  />
                  <div
                    className="absolute"
                    style={{
                      left: `${hoveredPoint.x - 2}px`,
                      top: `${hoveredPoint.y - 2}px`,
                      width: '4px',
                      height: '4px',
                      backgroundColor: '#ffffff',
                      borderRadius: '9999px',
                      pointerEvents: 'none',
                    }}
                  />
                  {tooltipStyle && (
                    <div
                      className="absolute pointer-events-none rounded-lg bg-[#2563EB] px-3 py-2 text-xs text-white shadow-lg"
                      style={tooltipStyle}
                    >
                      <div className="font-medium">
                        {formatDateTimeLabel(hoveredPoint.candle.timestamp)}
                      </div>
                      <div className="font-semibold">
                        {hoveredPoint.candle.c.toLocaleString('ko-KR')}원
                      </div>
                    </div>
                  )}
                </>
      )}

              <div className="pointer-events-none absolute bottom-[24px] left-0 right-0 px-8 text-[10px] text-gray-500">
                {axisLabels.map(({ dateLabel, timeLabel, index }) => (
                  <span
                    key={`${timeLabel}-${index}`}
                    className="absolute -translate-x-1/2 whitespace-nowrap text-center"
                    style={{ left: `${xScale(index)}px` }}
                  >
                    {dateLabel ? (
                      <div className="text-gray-800">{dateLabel}</div>
                    ) : (
                      <div>{timeLabel}</div>
                    )}
                  </span>
                ))}
              </div>

              {!hasData && (
                <div className="absolute inset-0 flex items-center justify-center px-4">
                  <span className="text-xs text-slate-400">
                    데이터가 없습니다.
                  </span>
                </div>
              )}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
