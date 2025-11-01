'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent } from '@/app/(pages)/trading/components/card';
import { TradingChart } from '@/app/(pages)/trading/components/trade/chart';
import { OrderForm } from '@/app/(pages)/trading/components/trade/order-form';
import { OrderBook } from '@/app/(pages)/trading/components/trade/orderbook';
import {
  RevenueInfoCard,
  IpIntroCard,
} from '@/app/(pages)/trading/components/trading/info-panel';
import { HeroPanel } from '@/app/(pages)/trading/components/trading/hero-panel';
import { NoticePanel } from '@/app/(pages)/trading/components/trading/notice-panel';
import { MOCK_INFO } from '@/lib/mock-info';
import { MOCK_ITEMS } from '@/lib/mock-trading';
import styles from './heart-icon.module.css';

export default function TradingDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [liked, setLiked] = useState(false);
  const [activeTab, setActiveTab] = useState<'chart' | 'info'>('chart');
  const tabContainerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<'chart' | 'info', HTMLButtonElement | null>>({
    chart: null,
    info: null,
  });
  const [highlightStyle, setHighlightStyle] = useState<{
    width: number;
    left: number;
    height: number;
  }>({
    width: 0,
    left: 0,
    height: 0,
  });

  const updateHighlightPosition = () => {
    const container = tabContainerRef.current;
    const activeButton = tabRefs.current[activeTab];
    if (!container || !activeButton) return;

    const containerRect = container.getBoundingClientRect();
    const activeRect = activeButton.getBoundingClientRect();
    const width = activeRect.width;
    const rawLeft = activeRect.left - containerRect.left;
    const height = containerRect.height;
    setHighlightStyle({
      width,
      left: Math.max(0, Math.min(rawLeft, containerRect.width - width)),
      height,
    });
  };

  useEffect(() => {
    requestAnimationFrame(updateHighlightPosition);
  }, [activeTab]);

  useEffect(() => {
    const handleResize = () => updateHighlightPosition();
    window.addEventListener('resize', handleResize);
    requestAnimationFrame(updateHighlightPosition);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Find the item from mock data
  const item = MOCK_ITEMS.find((i) => i.id === id) || MOCK_ITEMS[0];

  const changePct = item.changePct;
  const isPositive = changePct >= 0;
  const changeText = isPositive ? `+${changePct}%` : `${changePct}%`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="mx-auto w-full max-w-[1560px] px-4 sm:px-8 lg:px-16 py-4">
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
              className="rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A4DE5]"
              aria-label={liked ? '좋아요 취소' : '좋아요'}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-[5px] bg-[#EAECF0]">
                <span
                  aria-hidden="true"
                  className={`${styles.heartMask} transition-opacity`}
                  style={{
                    backgroundColor: liked ? '#F9595F' : '#29293A',
                    opacity: liked ? 1 : 0.23,
                  }}
                />
              </span>
            </button>
          </div>

          {/* Tabs */}
          <div
            ref={tabContainerRef}
            className="relative inline-flex gap-3 mt-4 rounded-full bg-transparent"
          >
            <span
              className="pointer-events-none absolute rounded-full bg-[#EAEDF4] transition-all duration-300 ease-out"
              style={{
                width: highlightStyle.width,
                height: highlightStyle.height,
                transform: `translateX(${highlightStyle.left}px)`,
                left: 0,
                top: 0,
                opacity: highlightStyle.width > 0 ? 1 : 0,
              }}
            />
            <button
              onClick={() => setActiveTab('chart')}
              ref={(el) => {
                tabRefs.current.chart = el;
              }}
              className={`relative z-10 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
                activeTab === 'chart'
                  ? 'text-[#111827]'
                  : 'text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              차트·호가
            </button>
            <button
              onClick={() => setActiveTab('info')}
              ref={(el) => {
                tabRefs.current.info = el;
              }}
              className={`relative z-10 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
                activeTab === 'info'
                  ? 'text-[#111827]'
                  : 'text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              종목정보·공시
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      {activeTab === 'chart' && (
        <main className="mx-auto w-full max-w-[1680px] px-6 lg:px-12 py-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-[620px_320px_minmax(0,1fr)] lg:[--panel-height:640px] items-stretch">
            {/* Chart - Left Column */}
            <div className="lg:h-[var(--panel-height)] lg:w-[620px]">
              <TradingChart />
            </div>

            {/* Order Form - Middle Column */}
            <div className="lg:h-[var(--panel-height)] lg:w-[320px]">
              <OrderForm currentPrice={item.priceKRW} />
            </div>

            {/* Order Book - Right Column */}
            <div className="lg:h-[var(--panel-height)]">
              <OrderBook />
            </div>
          </div>
        </main>
      )}

      {activeTab === 'info' && (
        <main className="mx-auto w-full max-w-[1680px] px-6 lg:px-12 py-6">
          <div className="space-y-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(320px,2fr)] items-start">
              <RevenueInfoCard info={MOCK_INFO} />
              <HeroPanel info={MOCK_INFO} />
            </div>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-start">
              <IpIntroCard info={MOCK_INFO} />
              <NoticePanel />
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
