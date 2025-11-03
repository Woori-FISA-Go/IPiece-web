'use client';

import type React from 'react';

import {
  useState,
  useRef,
  useMemo,
  useCallback,
  useEffect,
  useLayoutEffect,
} from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
} from 'recharts';
import type { RevenuePoint } from '@/lib/mock-info';

interface RevenueChartProps {
  data: RevenuePoint[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    value: number;
    label: string;
    dateLabel: string;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
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
  const [containerWidth, setContainerWidth] = useState(0);
  const [mounted, setMounted] = useState(false);

  const totalLength = data.length;
  const defaultWindow = Math.min(12, Math.max(1, totalLength));
  const [rangeStart, setRangeStart] = useState(() =>
    Math.max(0, totalLength - defaultWindow),
  );

  useEffect(() => {
    const windowSize = Math.min(12, Math.max(1, data.length));
    setRangeStart((prev) => {
      const maxStart = Math.max(0, data.length - windowSize);
      return Math.min(prev, maxStart);
    });
  }, [data.length]);

  useLayoutEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const update = () => {
      setContainerWidth(element.clientWidth || 0);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const windowSize = Math.min(12, Math.max(1, data.length));
  const rangeEnd = Math.min(rangeStart + windowSize, data.length);
  const slicedData = data.slice(rangeStart, rangeEnd);
  const visibleData = slicedData.length > 0 ? slicedData : data;

  const shiftWindow = useCallback(
    (steps: number) => {
      if (steps === 0 || data.length <= windowSize) return;
      setRangeStart((prev) => {
        const maxStart = Math.max(0, data.length - windowSize);
        const next = Math.min(Math.max(prev - steps, 0), maxStart);
        return next;
      });
    },
    [data.length, windowSize],
  );

  const width = containerWidth > 0 ? containerWidth : 1000;
  const height = 250;
  const padding = { top: 20, right: 28, bottom: 40, left: 24 };
  const chartWidth = Math.max(0, width - padding.left - padding.right);
  const chartHeight = height - padding.top - padding.bottom;

  const activeData = visibleData.length > 0 ? visibleData : data;

  if (activeData.length === 0) {
    return (
      <div className="flex h-[250px] w-full items-center justify-center rounded-lg bg-gradient-to-b from-blue-50/30 to-white text-xs text-gray-400">
        표시할 데이터가 없습니다.
      </div>
    );
  }

  const values = activeData.map((d) => d.value);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const valueRange = Math.max(rawMax - rawMin, 1);
  const minValue = rawMin - valueRange * 0.05;
  const maxValue = rawMax + valueRange * 0.05;

  const yTicks = useMemo(
    () => [minValue, (minValue + maxValue) / 2, maxValue],
    [minValue, maxValue],
  );

  const axisLabels = useMemo(() => {
    if (activeData.length === 0) return [];
    const count = Math.min(5, activeData.length);
    if (count === 1) return [activeData[0].t];
    const step = (activeData.length - 1) / (count - 1);
    return Array.from({ length: count }, (_, i) => {
      const idx = Math.round(i * step);
      return activeData[idx]?.t ?? '';
    });
  }, [activeData]);

  const tooltipStyle = useMemo(() => {
    if (!tooltip) return null;
    const safeTop = Math.max(padding.top + 12, tooltip.y - 48);
    const maxPoint = width - padding.right - 8;
    const minPoint = padding.left + 8;
    let left = tooltip.x;
    let translateX: '-50%' | '-100%' | '0' = '-50%';
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
  }, [tooltip, width, padding.left, padding.right, padding.top]);

  const updateHover = useCallback(
    (clientX: number, clientY: number) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect || chartWidth <= 0 || chartHeight <= 0) {
        setTooltip(null);
        return;
      }

      const localX = clientX - rect.left;
      const localY = clientY - rect.top;
      const relativeX = localX - padding.left;
      const relativeY = localY - padding.top;

      if (
        relativeX < 0 ||
        relativeX > chartWidth ||
        relativeY < 0 ||
        relativeY > chartHeight
      ) {
        setTooltip(null);
        return;
      }

      const denominator = Math.max(activeData.length - 1, 1);
      const index = Math.min(
        activeData.length - 1,
        Math.max(0, Math.round((relativeX / chartWidth) * denominator)),
      );
      const point = activeData[index];
      if (!point) {
        setTooltip(null);
        return;
      }

      const xPos = padding.left + (denominator ? (index / denominator) * chartWidth : 0);
      const yPos =
        padding.top +
        (chartHeight - ((point.value - minValue) / (maxValue - minValue || 1)) * chartHeight);

      const globalIndex = rangeStart + index;
      const anchorDate = new Date();
      anchorDate.setHours(0, 0, 0, 0);
      anchorDate.setDate(1);
      const offset = data.length - 1 - globalIndex;
      const date = new Date(anchorDate);
      date.setMonth(anchorDate.getMonth() - offset);
      const monthNumber = date.getMonth() + 1;
      const dateLabel = `${date.getFullYear()}년 ${monthNumber}월 ${date.getDate()}일`;

      setTooltip({
        x: xPos,
        y: yPos,
        value: point.value,
        label: point.t,
        dateLabel,
      });
    },
    [activeData, chartHeight, chartWidth, data.length, maxValue, minValue, padding.left, padding.top, rangeStart],
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

  const endDrag = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (dragRef.current.active && dragRef.current.pointerId !== null) {
      e.currentTarget.releasePointerCapture(dragRef.current.pointerId);
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
      endDrag(e);
      updateHover(e.clientX, e.clientY);
    },
    [endDrag, updateHover],
  );

  const handlePointerLeave = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      endDrag(e);
      setTooltip(null);
    },
    [endDrag],
  );

  if (!mounted) {
    return (
      <div
        ref={containerRef}
        className="flex h-[250px] w-full items-center justify-center rounded-lg bg-gradient-to-b from-blue-50/30 to-white text-xs text-gray-400"
      >
        차트 준비 중...
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative h-[250px] w-full rounded-lg bg-gradient-to-b from-blue-50/30 to-white"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onPointerCancel={handlePointerLeave}
    >
      <div className="absolute inset-0">
        <AreaChart
          width={width}
          height={height}
          data={activeData}
          margin={padding}
        >
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#E5E7EB" strokeDasharray="4 4" vertical={false} />
          <XAxis dataKey="t" hide />
          <YAxis
            dataKey="value"
            axisLine={false}
            tickLine={false}
            ticks={yTicks}
            domain={[minValue, maxValue]}
            tickFormatter={(value: number) => `${Math.round(value).toLocaleString('ko-KR')}원`}
            tick={{ fill: '#6B7280', fontSize: 10, dx: -4 }}
            orientation="right"
            width={26}
            tickMargin={0}
          />
          <RechartsTooltip cursor={false} wrapperStyle={{ display: 'none' }} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#revenueGradient)"
            isAnimationActive={false}
            activeDot={false}
            dot={false}
          />
        </AreaChart>
      </div>

      {tooltip && (
        <>
          <div
            className="absolute"
            style={{
              left: `${tooltip.x}px`,
              top: `${padding.top}px`,
              height: `${chartHeight}px`,
              borderLeft: '1px dashed #3b82f6',
              transform: 'translateX(-0.5px)',
              pointerEvents: 'none',
            }}
          />
          <div
            className="absolute"
            style={{
              left: `${tooltip.x - 5}px`,
              top: `${tooltip.y - 5}px`,
              width: '10px',
              height: '10px',
              backgroundColor: '#3b82f6',
              border: '1.5px solid #ffffff',
              borderRadius: '9999px',
              pointerEvents: 'none',
            }}
          />
          <div
            className="absolute"
            style={{
              left: `${tooltip.x - 3}px`,
              top: `${tooltip.y - 3}px`,
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
              <div className="text-[11px] font-medium text-white/80">{tooltip.dateLabel}</div>
              <div className="mt-1 text-sm font-semibold">
                {Math.round(tooltip.value).toLocaleString('ko-KR')}원
              </div>
            </div>
          )}
        </>
      )}

      <div className="absolute bottom-[14px] left-0 right-0 flex justify-between px-12 text-[10px] text-gray-500">
        {axisLabels.map((label, index) => (
          <span key={`${label}-${index}`} className="truncate">
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
