'use client';

import { useMemo, useState } from 'react';

import { Card, CardContent } from '@/app/(pages)/trading/components/card';
import { ORDERBOOK, SUMMARY_STATS } from '@/lib/mock-trading';

type ActiveSide = 'sell' | 'buy';

export function OrderBook() {
  const [activeSide, setActiveSide] = useState<ActiveSide>('sell');

  const askRows = useMemo(
    () =>
      ORDERBOOK.filter(
        (row) => typeof row.askQty === 'number' && row.askQty > 0,
      ),
    [],
  );
  const bidRows = useMemo(
    () =>
      ORDERBOOK.filter(
        (row) => typeof row.bidQty === 'number' && row.bidQty > 0,
      ),
    [],
  );

  const totals = useMemo(
    () => ({
      sell: askRows.reduce((acc, row) => acc + (row.askQty ?? 0), 0),
      buy: bidRows.reduce((acc, row) => acc + (row.bidQty ?? 0), 0),
    }),
    [askRows, bidRows],
  );

  const formatNumber = (value: number) => value.toLocaleString('ko-KR');

  return (
    <Card className="flex h-full flex-col rounded-2xl shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="flex h-full flex-col space-y-6 p-6 pt-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900">호가</h3>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>총 판매</span>
            <span className="font-semibold text-slate-700">
              {formatNumber(totals.sell)}주
            </span>
            <span className="mx-1 h-3 w-px bg-slate-200" />
            <span>총 구매</span>
            <span className="font-semibold text-slate-700">
              {formatNumber(totals.buy)}주
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border bg-white/80">
          <div className="grid grid-cols-3 border-b px-6 py-3 text-xs font-medium text-slate-500">
            <span className="text-left">판매 수량</span>
            <span className="text-center">가격</span>
            <span className="text-right">구매 수량</span>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto px-4 py-2">
            {askRows.map((row) => (
              <div
                key={`ask-${row.price}`}
                className="grid grid-cols-3 items-center rounded-lg px-3 py-2 text-sm transition-colors hover:bg-[#F2F4F7]"
              >
                <span className="pl-4 text-left font-semibold text-[#2563EB]">
                  {formatNumber(row.askQty!)}
                </span>
                <span className="flex items-center justify-center gap-2">
                  <span className="font-semibold text-[#E94651]">
                    {formatNumber(row.price)}
                  </span>
                  <span className="text-xs text-[#E94651]">
                    ({row.changePct >= 0 ? '+' : ''}
                    {row.changePct.toFixed(1)}%)
                  </span>
                </span>
                <span className="pr-4 text-right font-semibold text-slate-300">
                  —
                </span>
              </div>
            ))}

            <div className="my-1 h-px rounded-full bg-slate-200" />

            {bidRows.map((row) => (
              <div
                key={`bid-${row.price}`}
                className="grid grid-cols-3 items-center rounded-lg px-3 py-2 text-sm transition-colors hover:bg-[#F2F4F7]"
              >
                <span className="pl-4 text-left font-semibold text-slate-300">—</span>
                <span className="flex items-center justify-center gap-2">
                  <span className="font-semibold text-[#2675EB]">
                    {formatNumber(row.price)}
                  </span>
                  <span className="text-xs text-[#2675EB]">
                    ({row.changePct >= 0 ? '+' : ''}
                    {row.changePct.toFixed(1)}%)
                  </span>
                </span>
                <span className="pr-4 text-right font-semibold text-[#E53333]">
                  {formatNumber(row.bidQty!)}
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
                  {formatNumber(SUMMARY_STATS.weekHigh)}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>최저가</dt>
                <dd className="font-semibold text-[#2563EB]">
                  {formatNumber(SUMMARY_STATS.weekLow)}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm">
            <dl className="space-y-1.5">
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">상한가</dt>
                <dd className="font-semibold text-[#E53333]">
                  {formatNumber(SUMMARY_STATS.upper)}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">하한가</dt>
                <dd className="font-semibold text-[#2563EB]">
                  {formatNumber(SUMMARY_STATS.lower)}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">전일종가</dt>
                <dd className="font-semibold text-slate-900">
                  {formatNumber(SUMMARY_STATS.prevClose)}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
