'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent } from '@/app/(pages)/TradingPage/components/card';
import { TradingChart } from '@/components/trade/chart';
import { OrderForm } from '@/components/trade/order-form';
import { OrderBook } from '@/components/trade/orderbook';
import { MOCK_ITEMS } from '@/lib/mock-trading';

export default function TradingDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [liked, setLiked] = useState(false);
  const [activeTab, setActiveTab] = useState<'chart' | 'info'>('chart');

  // Find the item from mock data
  const item = MOCK_ITEMS.find((i) => i.id === id) || MOCK_ITEMS[0];

  const changePct = item.changePct;
  const isPositive = changePct >= 0;
  const changeText = isPositive ? `+${changePct}%` : `${changePct}%`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-500">
                logo
              </div>
              <div>
                <h1 className="text-xl font-bold">{item.title}</h1>
                <p className="text-sm text-gray-600">
                  1 Dino Tokens 당 {item.priceKRW.toLocaleString('ko-KR')}원{' '}
                  <span className="text-[#E53333] font-medium">
                    {changeText}
                  </span>
                </p>
              </div>
            </div>
            <button
              onClick={() => setLiked(!liked)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label={liked ? '좋아요 취소' : '좋아요'}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill={liked ? '#F9595F' : '#29293A'}
                fillOpacity={liked ? 1 : 0.23}
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-6 mt-4 border-b -mb-px">
            <button
              onClick={() => setActiveTab('chart')}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'chart'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              차트·호가
            </button>
            <button
              onClick={() => setActiveTab('info')}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'info'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              종목정보·공시
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      {activeTab === 'chart' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
            {/* Chart - Left Column */}
            <div className="lg:col-span-6">
              <TradingChart />
            </div>

            {/* Order Form - Middle Column */}
            <div className="lg:col-span-3">
              <OrderForm currentPrice={item.priceKRW} />
            </div>

            {/* Order Book - Right Column */}
            <div className="lg:col-span-3">
              <OrderBook />
            </div>
          </div>
        </main>
      )}

      {activeTab === 'info' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Card className="rounded-2xl">
            <CardContent className="p-8 text-center text-gray-500">
              종목정보·공시 페이지 준비 중입니다.
            </CardContent>
          </Card>
        </main>
      )}
    </div>
  );
}
