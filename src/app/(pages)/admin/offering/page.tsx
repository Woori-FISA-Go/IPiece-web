'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, MoreHorizontal, ArrowRightLeft } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type ContestStatus = 'offering' | 'ended';
type MarketStatus = 'active' | 'ended';

type Contest = {
  id: number;
  product_name: string;
  project_name: string;
  owner: string;
  status: ContestStatus;
  issue_amount: number;
  offering_amount: number;
  current_amount: number;
  offering_price: number;
  start_date: string;
  end_date: string;
};

type MarketItem = {
  id: number;
  product_name: string;
  project_name: string;
  owner: string;
  status: MarketStatus;
  current_price: number;
  volume_24h: number;
  holders: number;
  listed_date: string;
};

const INITIAL_CONTESTS: Contest[] = [
  {
    id: 1,
    product_name: '다이노탱',
    project_name: '맹구 시즌1',
    owner: 'Masterpiece',
    status: 'offering',
    issue_amount: 100000000,
    offering_amount: 100000000,
    current_amount: 75000000,
    offering_price: 1000,
    start_date: '2025-08-07',
    end_date: '2025-12-17',
  },
  {
    id: 2,
    product_name: '겨울 멈무',
    project_name: '윈터 컬렉션',
    owner: 'Artist Kim',
    status: 'ended' as const,
    issue_amount: 50000000,
    offering_amount: 50000000,
    current_amount: 50000000,
    offering_price: 500,
    start_date: '2024-12-01',
    end_date: '2024-12-31',
  },
];

const INITIAL_MARKET: MarketItem[] = [
  {
    id: 3,
    product_name: '봄날의 햇살',
    project_name: '스프링 시리즈',
    owner: 'Studio Flow',
    status: 'active',
    current_price: 1200,
    volume_24h: 35000000,
    holders: 245,
    listed_date: '2025-01-15',
  },
];

export default function ProductManagementPage() {
  const [activeTab, setActiveTab] = useState<'contest' | 'market'>('contest');
  const [contests, setContests] = useState<Contest[]>(INITIAL_CONTESTS);
  const [marketItems, setMarketItems] = useState<MarketItem[]>(INITIAL_MARKET);

  const handleTransferToMarket = (contestId: number) => {
    const contest = contests.find((c) => c.id === contestId);
    if (!contest) return;

    // Remove from contests
    setContests(contests.filter((c) => c.id !== contestId));

    // Add to market items
    const newMarketItem: MarketItem = {
      id: contestId,
      product_name: contest.product_name,
      project_name: contest.project_name,
      owner: contest.owner,
      status: 'active',
      current_price: contest.offering_price,
      volume_24h: 0,
      holders: 0,
      listed_date: new Date().toISOString().split('T')[0],
    };
    setMarketItems([...marketItems, newMarketItem]);

    // Switch to market tab to show the transferred item
    setActiveTab('market');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">상품 관리</h2>
          <p className="text-sm text-gray-500 mt-1">
            공모 및 2차 거래 상품을 관리합니다.
          </p>
        </div>
        <Link href="/admin/offering/new">
          <Button className="bg-[#1A4DE5] hover:bg-[#153eb5]">
            <Plus className="w-4 h-4 mr-2" />
            상품 등록
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border">
        <div className="border-b">
          <div className="flex">
            <button
              onClick={() => setActiveTab('contest')}
              className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'contest'
                  ? 'border-[#1A4DE5] text-[#1A4DE5]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              공모 관리
            </button>
            <button
              onClick={() => setActiveTab('market')}
              className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'market'
                  ? 'border-[#1A4DE5] text-[#1A4DE5]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              2차거래 관리
            </button>
          </div>
        </div>

        <div className="p-4">
          {activeTab === 'contest' && (
            <>
              <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
                <div className="relative flex-1 w-full sm:max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="상품명 또는 프로젝트명 검색"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50">
                      <TableHead className="w-[280px]">상품 정보</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead className="text-center">진행률</TableHead>
                      <TableHead className="text-right">모집 금액</TableHead>
                      <TableHead className="text-right">공모가</TableHead>
                      <TableHead className="text-center">공모 기간</TableHead>
                      <TableHead className="w-[80px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contests.map((contest) => {
                      const progress = Math.round(
                        (contest.current_amount / contest.offering_amount) *
                          100,
                      );
                      return (
                        <TableRow key={contest.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900">
                                {contest.product_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {contest.project_name} | {contest.owner}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={`
                                ${
                                  contest.status === 'offering'
                                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-100'
                                    : ''
                                }
                                ${
                                  contest.status === 'ended'
                                    ? 'bg-gray-200 text-gray-600 hover:bg-gray-200'
                                    : ''
                                }
                              `}
                            >
                              {contest.status === 'offering' && '진행중'}
                              {contest.status === 'ended' && '마감'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-[#1A4DE5] rounded-full transition-all"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium text-gray-700">
                                {progress}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {contest.offering_amount.toLocaleString()}원
                          </TableCell>
                          <TableCell className="text-right">
                            {contest.offering_price.toLocaleString()}원
                          </TableCell>
                          <TableCell className="text-center text-sm text-gray-500">
                            {contest.start_date} ~ {contest.end_date}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">메뉴 열기</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>수정하기</DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleTransferToMarket(contest.id)
                                  }
                                >
                                  <ArrowRightLeft className="w-4 h-4 mr-2" />
                                  2차 거래로 전환
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600 focus:text-red-600">
                                  삭제하기
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </>
          )}

          {activeTab === 'market' && (
            <>
              <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
                <div className="relative flex-1 w-full sm:max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="상품명 또는 프로젝트명 검색"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50">
                      <TableHead className="w-[280px]">상품 정보</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead className="text-right">현재가</TableHead>
                      <TableHead className="text-right">
                        24시간 거래량
                      </TableHead>
                      <TableHead className="text-center">보유자 수</TableHead>
                      <TableHead className="text-center">상장일</TableHead>
                      <TableHead className="w-[80px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {marketItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900">
                              {item.product_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {item.project_name} | {item.owner}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={`
                              ${
                                item.status === 'active'
                                  ? 'bg-green-100 text-green-700 hover:bg-green-100'
                                  : ''
                              }
                              ${
                                item.status === 'ended'
                                  ? 'bg-gray-200 text-gray-600 hover:bg-gray-200'
                                  : ''
                              }
                            `}
                          >
                            {item.status === 'active' && '진행중'}
                            {item.status === 'ended' && '종료'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {item.current_price.toLocaleString()}원
                        </TableCell>
                        <TableCell className="text-right">
                          {item.volume_24h.toLocaleString()}원
                        </TableCell>
                        <TableCell className="text-center">
                          {item.holders.toLocaleString()}명
                        </TableCell>
                        <TableCell className="text-center text-sm text-gray-500">
                          {item.listed_date}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">메뉴 열기</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>상세보기</DropdownMenuItem>
                              <DropdownMenuItem>거래 중지</DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600 focus:text-red-600">
                                상장 폐지
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
