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
  return (
    <Card className="flex h-[360px] flex-col rounded-2xl border shadow-sm overflow-hidden">
      <CardContent className="flex flex-1 flex-col p-6 pb-4 overflow-hidden">
        <h3 className="text-[15px] font-semibold text-[#111827] mb-4">
          IP 소개
        </h3>
        <p className="flex-1 text-sm text-gray-700 leading-relaxed mb-2 overflow-y-auto pr-1">
          {info.summary}
        </p>
        <div className="space-y-0 border rounded-lg overflow-hidden">
          <div className="grid grid-cols-[140px_1fr] text-sm border-b last:border-b-0">
            <div className="bg-gray-50/40 p-3 text-gray-600 font-medium">
              발행인
            </div>
            <div className="p-3 text-gray-900">{info.publisher}</div>
          </div>
          <div className="grid grid-cols-[140px_1fr] text-sm border-b last:border-b-0">
            <div className="bg-gray-50/40 p-3 text-gray-600 font-medium">
              발행총액
            </div>
            <div className="p-3 text-gray-900">{info.totalIssue}</div>
          </div>
          <div className="grid grid-cols-[140px_1fr] text-sm border-b last:border-b-0">
            <div className="bg-gray-50/40 p-3 text-gray-600 font-medium">
              토큰 표준
            </div>
            <div className="p-3 text-gray-900">{info.tokenStandard}</div>
          </div>
          <div className="grid grid-cols-[140px_1fr] text-sm">
            <div className="bg-gray-50/40 p-3 text-gray-600 font-medium">
              거래소 상장
            </div>
            <div className="p-3 text-gray-900">{info.listing}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
