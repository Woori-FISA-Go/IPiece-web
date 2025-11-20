'use client';

import { Card, CardContent } from '@/components/ui/card';

export type OrderBookSummary = {
  highestPrice: number;
  lowestPrice: number;
  lastPrice: number;
  priceChange: number;
  limitUpPrice: number;
  limitDownPrice: number;
  thisWeekVolume: number;
  lastWeekVolume: number;
};

export type OrderBookEntry = {
  price: number;
  quantity: number;
  changePct: number;
};

export interface OrderBookProps {
  summary?: OrderBookSummary | null;
  ordersSell?: OrderBookEntry[];
  ordersBuy?: OrderBookEntry[];
}

export function OrderBook({ summary, ordersSell = [], ordersBuy = [] }: OrderBookProps) {
  const totalSell = ordersSell.reduce((acc, row) => acc + row.quantity, 0);
  const totalBuy = ordersBuy.reduce((acc, row) => acc + row.quantity, 0);
  const formatNumber = (value: number) => value.toLocaleString('ko-KR');
  const formatChange = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  const hasData = ordersSell.length > 0 || ordersBuy.length > 0;

  return (
    <Card className="flex h-full flex-col rounded-2xl shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="flex h-full flex-col space-y-6 p-6 pt-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900">호가</h3>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>총 판매</span>
            <span className="font-semibold text-slate-700">
              {formatNumber(totalSell)}주
            </span>
            <span className="mx-1 h-3 w-px bg-slate-200" />
            <span>총 구매</span>
            <span className="font-semibold text-slate-700">
              {formatNumber(totalBuy)}주
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border bg-white/80">
          <div className="grid grid-cols-3 border-b px-6 py-3 text-xs font-medium text-slate-500 text-center">
            <span>판매 수량</span>
            <span>가격</span>
            <span>구매 수량</span>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto px-4 py-2">
            {!hasData && (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">
                호가 데이터를 불러오는 중...
              </div>
            )}
            {ordersSell.map((row) => (
              <div
                key={`ask-${row.price}`}
                className="grid grid-cols-3 items-center rounded-lg px-3 py-4 text-sm transition-colors hover:bg-[#F2F4F7] text-center"
              >
                <span className="font-semibold text-[#2563EB]">
                  {formatNumber(row.quantity)}
                </span>
                <span className="flex items-center justify-center gap-2">
                  <span className="font-semibold text-[#E94651]">
                    {formatNumber(row.price)}
                  </span>
                  <span className="text-xs text-[#E94651]">
                    ({formatChange(row.changePct)})
                  </span>
                </span>
                <span className="font-semibold text-slate-300">
                  —
                </span>
              </div>
            ))}

            <div className="my-1 h-px rounded-full bg-slate-200" />

            {ordersBuy.map((row) => (
              <div
                key={`bid-${row.price}`}
                className="grid grid-cols-3 items-center rounded-lg px-3 py-4 text-sm transition-colors hover:bg-[#F2F4F7] text-center"
              >
                <span className="font-semibold text-slate-300">
                  —
                </span>
                <span className="flex items-center justify-center gap-2">
                  <span className="font-semibold text-[#2675EB]">
                    {formatNumber(row.price)}
                  </span>
                  <span className="text-xs text-[#2675EB]">
                    ({formatChange(row.changePct)})
                  </span>
                </span>
                <span className="font-semibold text-[#E53333]">
                  {formatNumber(row.quantity)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[12px] text-slate-500">
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              최근 1주일
            </span>
            <dl className="space-y-1.5">
              <div className="flex items-center justify-between">
                <dt>최고가</dt>
                <dd className="font-semibold text-[#E53333]">
                  {summary ? formatNumber(summary.highestPrice) : '—'}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>최저가</dt>
                <dd className="font-semibold text-[#2563EB]">
                  {summary ? formatNumber(summary.lowestPrice) : '—'}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm">
            <dl className="space-y-1.5">
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">상한가</dt>
                <dd className="font-semibold text-[#E53333]">
                  {summary ? formatNumber(summary.limitUpPrice) : '—'}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">하한가</dt>
                <dd className="font-semibold text-[#2563EB]">
                  {summary ? formatNumber(summary.limitDownPrice) : '—'}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">전일종가</dt>
                <dd className="font-semibold text-slate-900">
                  {summary ? formatNumber(summary.lastPrice) : '—'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
