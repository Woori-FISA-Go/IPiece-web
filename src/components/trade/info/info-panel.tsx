'use client';

import { Card, CardContent } from '@/components/ui/card';
import { RevenueChart } from './revenue-chart';
import type { SecurityInfo } from '@/lib/mock-info';

interface InfoCardProps {
  info: SecurityInfo;
}

export function RevenueInfoCard({ info }: InfoCardProps) {
  return (
    <Card className="flex h-[380px] flex-col rounded-2xl border shadow-sm">
      <CardContent className="flex flex-1 flex-col p-6">
        <div className="mb-4">
          <h3 className="text-[15px] font-semibold text-[#111827]">
            1토큰당 수익료 정보
          </h3>
          <p className="text-xs text-gray-500 mt-1">{info.issueDate} 발행</p>
        </div>
        <div className="mb-2">
          <p className="text-xs text-gray-500 mb-2">월별 수익료</p>
        </div>
        <RevenueChart data={info.revenueMonthly} />
      </CardContent>
    </Card>
  );
}

export function IpIntroCard({ info }: InfoCardProps) {
  const hasSummary = Boolean(info.summary && info.summary.trim().length > 0);
  return (
    <Card className="flex h-[320px] flex-col rounded-2xl border shadow-sm overflow-hidden">
      <CardContent className="flex flex-1 flex-col p-6 pb-4 overflow-hidden">
        <h3 className="text-[15px] font-semibold text-[#111827] mb-3">
          IP 소개
        </h3>
        {hasSummary ? (
          <p className="flex-1 text-sm text-gray-700 leading-relaxed overflow-y-auto pr-1">
            {info.summary}
          </p>
        ) : (
          <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50/50 text-sm text-gray-500">
            데이터가 없습니다.
          </div>
        )}
        <div className="space-y-0 border rounded-lg overflow-hidden mt-2">
          {[
            { label: '발행인', value: info.publisher },
            { label: '발행총액', value: info.totalIssue },
            { label: '토큰 표준', value: info.tokenStandard },
            { label: '거래소 상장', value: info.listing },
          ].map((row, idx) => (
            <div
              key={row.label}
              className={`grid grid-cols-[140px_1fr] text-sm ${idx !== 3 ? 'border-b' : ''}`}
            >
              <div className="bg-gray-50/40 p-3 text-gray-600 font-medium">
                {row.label}
              </div>
              <div className="p-3 text-gray-900">{row.value}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
