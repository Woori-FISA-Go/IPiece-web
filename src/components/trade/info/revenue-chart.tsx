'use client';

import type React from 'react';

import { useState, useRef, useMemo, useCallback, useEffect, useLayoutEffect, useId } from 'react';
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

  const width = containerWidth > 0 ? containerWidth : 1000;
  const height = 250;
  const padding = { top: 20, right: 28, bottom: 40, left: 24 };
  const chartWidth = Math.max(0, width - padding.left - padding.right);
  const chartHeight = height - padding.top - padding.bottom;
  const chartBaseline = padding.top + chartHeight;
  const gradientId = useId();

  const activeData = visibleData.length > 0 ? visibleData : data;
  const hasData = activeData.length > 0;

  const values = hasData ? activeData.map((d) => d.value) : [0];
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

  const xScale = useCallback(
    (index: number) => {
      const denominator = Math.max(activeData.length - 1, 1);
      return padding.left + (denominator ? (index / denominator) * chartWidth : 0);
    },
    [activeData.length, chartWidth, padding.left],
  );

  const yScaleValue = useCallback(
    (value: number) =>
      padding.top +
      (chartHeight -
        ((value - minValue) / (maxValue - minValue || 1)) * chartHeight),
    [chartHeight, maxValue, minValue, padding.top],
  );

  const { areaPath, linePath, points } = useMemo(() => {
    if (!activeData.length) {
      return { areaPath: '', linePath: '', points: [] as { x: number; y: number }[] };
    }
    const pts = activeData.map((point, index) => ({
      x: xScale(index),
      y: yScaleValue(point.value),
    }));
    const first = pts[0];
    const last = pts[pts.length - 1];
    const areaCommands = [
      'M ' + first.x + ' ' + chartBaseline,
      'L ' + first.x + ' ' + first.y,
      ...pts.slice(1).map((point) => 'L ' + point.x + ' ' + point.y),
      'L ' + last.x + ' ' + chartBaseline,
      'L ' + first.x + ' ' + chartBaseline,
      'Z',
    ];
    const lineCommands = [
      'M ' + first.x + ' ' + first.y,
      ...pts.slice(1).map((point) => 'L ' + point.x + ' ' + point.y),
    ];
    return {
      areaPath: areaCommands.join(' '),
      linePath: lineCommands.join(' '),
      points: pts,
    };
  }, [activeData, chartBaseline, xScale, yScaleValue]);

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
      left: left + 'px',
      top: safeTop + 'px',
      transform: 'translate(' + translateX + ', -100%)',
    } as React.CSSProperties;
  }, [tooltip, width, padding.left, padding.right, padding.top]);

  if (!mounted) {
    return (
      <div
        ref={containerRef}
        className="flex h-[250px] w-full items-center justify-center rounded-lg bg-gradient-to-b from-blue-50/30 to-white text-xs text-gray-400"
      >
        李⑦듃 以鍮?以?..
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative h-[250px] w-full rounded-lg bg-gradient-to-b from-blue-50/30 to-white"
    >
      <div className="absolute inset-0">
                <svg width={width} height={height} role="img" aria-label="?? ?? ??">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
          </defs>
          {yTicks.map((tick) => {
            const y = yScaleValue(tick)
            return (
              <g key={'tick-' + tick}>
                <line
                  x1={padding.left}
                  x2={width - padding.right}
                  y1={y}
                  y2={y}
                  stroke="#E5E7EB"
                  strokeDasharray="4 4"
                />
                <text x={width - padding.right + 6} y={y + 4} fill="#6B7280" fontSize={10}>
                  {Math.round(tick).toLocaleString('ko-KR') + '원'}
                </text>
              </g>
            )
          })}
          {areaPath && (
            <>
              <path d={areaPath} fill={'url(#' + gradientId + ')'} stroke="none" />
              <path
                d={linePath}
                fill="none"
                stroke="#3b82f6"
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </>
          )}

          {points.map((point, idx) => (
            <circle
              key={'pt-' + idx}
              cx={point.x}
              cy={point.y}
              r={5}
              fill="#3b82f6"
              stroke="#fff"
              strokeWidth={1.5}
              onMouseEnter={() => {
                const dataPoint = activeData[idx];
                const dateRaw = dataPoint?.date;
                const formattedDate = dateRaw
                  ? new Date(dateRaw).toLocaleDateString('ko-KR')
                  : dataPoint?.t ?? '';
                setTooltip({
                  x: point.x,
                  y: point.y,
                  value: dataPoint?.value ?? 0,
                  label: dataPoint?.t ?? '',
                  dateLabel: formattedDate,
                });
              }}
              onMouseLeave={() => setTooltip(null)}
            />
          ))}
        </svg>
        {!hasData && (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400 bg-white/70 backdrop-blur-sm">
            데이터가 없습니다.
          </div>
        )}
      </div>

      {tooltip && (
        <>
          <div
            className="absolute"
            style={{
              left: tooltip.x + 'px',
              top: padding.top + 'px',
              height: chartHeight + 'px',
              borderLeft: '1px dashed #3b82f6',
              transform: 'translateX(-0.5px)',
              pointerEvents: 'none',
            }}
          />
          <div
            className="absolute"
            style={{
              left: tooltip.x - 5 + 'px',
              top: tooltip.y - 5 + 'px',
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
              left: tooltip.x - 3 + 'px',
              top: tooltip.y - 3 + 'px',
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
          <span key={label + '-' + index} className="truncate">
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
