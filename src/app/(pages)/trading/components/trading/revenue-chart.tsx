'use client';

import type React from 'react';

import {
  useState,
  useRef,
  useMemo,
  useCallback,
  useEffect,
} from 'react';
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
  } | null>(null);
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

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current = {
      active: true,
      pointerId: e.pointerId,
      lastX: e.clientX,
      accumulated: 0,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag.active) return;

      const movement = e.clientX - drag.lastX;
      drag.lastX = e.clientX;
      drag.accumulated += movement;

      const threshold = 56;
      const steps = Math.trunc(drag.accumulated / threshold);

      if (steps !== 0) {
        shiftWindow(steps);
        drag.accumulated -= steps * threshold;
      }
    },
    [shiftWindow],
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

  const width = 1000;
  const height = 250;
  const padding = { top: 20, right: 80, bottom: 40, left: 24 };
  const chartWidth = width - padding.left - padding.right;
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
  const minValue = Math.min(...values) * 0.95;
  const maxValue = Math.max(...values) * 1.05;

  const xScale = (index: number) =>
    activeData.length > 1
      ? (index / (activeData.length - 1)) * chartWidth
      : chartWidth / 2;
  const yScale = (value: number) =>
    chartHeight - ((value - minValue) / (maxValue - minValue || 1)) * chartHeight;

  const linePath = activeData
    .map((d, i) => {
      const x = xScale(i);
      const y = yScale(d.value);
      return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    })
    .join(' ');

  const areaPath =
    linePath +
    ` L ${xScale(activeData.length - 1)} ${chartHeight} L ${xScale(0)} ${chartHeight} Z`;

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - padding.left;
    const y = e.clientY - rect.top - padding.top;

    if (x < 0 || x > chartWidth || y < 0 || y > chartHeight) {
      setTooltip(null);
      return;
    }

    const index =
      activeData.length > 1
        ? Math.round((x / chartWidth) * (activeData.length - 1))
        : 0;
    const point = activeData[index];
    if (point) {
      setTooltip({
        x: xScale(index) + padding.left,
        y: yScale(point.value) + padding.top,
        value: point.value,
        label: point.t,
      });
    }
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  const yTicks = [minValue, (minValue + maxValue) / 2, maxValue];

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

  return (
    <div
      className="relative w-full h-[250px] bg-gradient-to-b from-blue-50/30 to-white rounded-lg"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
      onPointerCancel={endDrag}
    >
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`0 0 ${width} ${height}`}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="cursor-crosshair"
      >
        {/* Y-axis labels */}
        {yTicks.map((tick, i) => (
          <g key={i}>
            <line
              x1={padding.left}
              y1={yScale(tick) + padding.top}
              x2={padding.left + chartWidth}
              y2={yScale(tick) + padding.top}
              stroke="#e5e7eb"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            <text
              x={padding.left + chartWidth + 10}
              y={yScale(tick) + padding.top}
              textAnchor="start"
              alignmentBaseline="middle"
              className="text-[10px] fill-gray-500"
            >
              {Math.round(tick).toLocaleString('ko-KR')}원
            </text>
          </g>
        ))}

        {/* Area fill */}
        <path
          d={areaPath}
          fill="url(#areaGradient)"
          transform={`translate(${padding.left}, ${padding.top})`}
        />

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
          transform={`translate(${padding.left}, ${padding.top})`}
        />

        {/* Tooltip elements */}
        {tooltip && (
          <>
            {/* Vertical line */}
            <line
              x1={tooltip.x}
              y1={padding.top}
              x2={tooltip.x}
              y2={height - padding.bottom}
              stroke="#3b82f6"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            {/* Point */}
            <circle cx={tooltip.x} cy={tooltip.y} r="5" fill="#3b82f6" />
            <circle cx={tooltip.x} cy={tooltip.y} r="3" fill="white" />

            {/* Tooltip box */}
            <g
              transform={`translate(${tooltip.x}, ${Math.max(60, tooltip.y - 20)})`}
            >
              <rect
                x="-70"
                y="-45"
                width="140"
                height="50"
                rx="8"
                fill="#1A4DE5"
                filter="drop-shadow(0 4px 6px rgba(0,0,0,0.1))"
              />
              <text
                x="0"
                y="-28"
                textAnchor="middle"
                className="text-[11px] fill-white/80"
              >
                {tooltip.label}
              </text>
              <text
                x="0"
                y="-10"
                textAnchor="middle"
                className="text-[16px] font-bold fill-white"
              >
                {Math.round(tooltip.value).toLocaleString('ko-KR')}원
              </text>
            </g>
          </>
        )}

        {/* Gradient definition */}
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {/* X-axis labels */}
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
