'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';

import { Card, CardContent } from '@/app/(pages)/trading/components/card';
import emptyIcon from '@/assets/empty_icon.svg';

type OrderTab = 'buy' | 'sell' | 'pending';

interface OrderFormProps {
  currentPrice: number;
}

type OrderSummary = {
  totalProfit: number;
  profitRate: number;
  totalAmount: number;
  quantity: number;
  averagePrice: number;
};

export function OrderForm({ currentPrice }: OrderFormProps) {
  const [activeTab, setActiveTab] = useState<OrderTab>('buy');
  const [orderType] = useState('limit');
  const [price, setPrice] = useState(currentPrice);
  const [quantity, setQuantity] = useState(1);
  const [myOrder] = useState<OrderSummary | null>({
    totalProfit: 658_000,
    profitRate: 0.719,
    totalAmount: 1_572_000,
    quantity: 15,
    averagePrice: 60_933,
  });

  const handleSubmit = () => {
    console.log('[v0] Order submitted:', {
      activeTab,
      orderType,
      price,
      quantity,
    });
  };

  const incrementPrice = () => setPrice((p) => p + 100);
  const decrementPrice = () => setPrice((p) => Math.max(100, p - 100));
  const incrementQuantity = () => setQuantity((q) => q + 1);
  const decrementQuantity = () => setQuantity((q) => Math.max(1, q - 1));

  const formatCurrency = (value: number) =>
    `${value.toLocaleString('ko-KR')}원`;

  const formatRate = (value: number) => `${(value * 100).toFixed(1)}%`;

  const tabStyles = useMemo(() => {
    switch (activeTab) {
      case 'buy':
        return {
          accent: '#E94651',
          buttonLabel: '구매하기',
        };
      case 'sell':
        return {
          accent: '#2675EB',
          buttonLabel: '판매하기',
        };
      case 'pending':
        return {
          accent: '#16A34A',
          buttonLabel: '주문 확인',
        };
      default:
        return {
          accent: '#2563EB',
          buttonLabel: '주문하기',
        };
    }
  }, [activeTab]);

  const tabOrder: OrderTab[] = ['buy', 'sell', 'pending'];
  const [prevTab, setPrevTab] = useState<OrderTab>('buy');
  const handleSwitchTab = (tab: OrderTab) => {
    setPrevTab(activeTab);
    setActiveTab(tab);
  };
  const dir =
    tabOrder.indexOf(activeTab) >= tabOrder.indexOf(prevTab) ? 'right' : 'left';

  const tabContainerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<OrderTab, HTMLButtonElement | null>>({
    buy: null,
    sell: null,
    pending: null,
  });
  const [highlightStyle, setHighlightStyle] = useState({
    width: 0,
    left: 0,
  });

  useEffect(() => {
    const update = () => {
      const container = tabContainerRef.current;
      const activeButton = tabRefs.current[activeTab];
      if (!container || !activeButton) return;

      const containerWidth = container.clientWidth;
      const width = Math.min(activeButton.offsetWidth, containerWidth);
      const rawLeft = activeButton.offsetLeft;
      const left = Math.max(0, Math.min(rawLeft, containerWidth - width));

      setHighlightStyle({ width, left });
    };

    requestAnimationFrame(update);
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [activeTab]);

  return (
    <div className="flex h-full w-full flex-col gap-3 lg:w-[320px] lg:h-[var(--panel-height)]">
      {/* Order Form Card */}
      <Card className="flex flex-col rounded-2xl shadow-sm transition-shadow hover:shadow-md">
        <CardContent className="flex flex-col p-6 pb-4 pt-6">
          <div className="mb-5">
            <h3 className="text-base font-semibold text-[#111827]">주문하기</h3>
          </div>

          {/* Tabs */}
          <div
            ref={tabContainerRef}
            className="relative mb-6 flex gap-1 rounded-lg bg-[#F3F4F6] p-1 text-sm font-medium"
          >
            <span
              className={`pointer-events-none absolute top-0 bottom-0 rounded-lg border transition-all duration-300 ${
                activeTab === 'buy'
                  ? 'border-[#E94651]'
                  : activeTab === 'sell'
                    ? 'border-[#2675EB]'
                    : activeTab === 'pending'
                      ? 'border-[#16A34A]'
                      : 'border-[#E5E7EB]'
              } bg-white`}
              style={{
                width: highlightStyle.width,
                left: highlightStyle.left,
                top: 0,
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08)',
              }}
            />
            <button
              onClick={() => handleSwitchTab('buy')}
              ref={(el) => {
                tabRefs.current.buy = el;
              }}
              className={`relative z-10 flex flex-1 items-center justify-center rounded-lg py-[5px] leading-none transition-colors ${
                activeTab === 'buy' ? 'text-[#E94651]' : 'text-[#111827]'
              }`}
            >
              구매
            </button>
            <button
              onClick={() => handleSwitchTab('sell')}
              ref={(el) => {
                tabRefs.current.sell = el;
              }}
              className={`relative z-10 flex flex-1 items-center justify-center rounded-lg py-[5px] leading-none transition-colors ${
                activeTab === 'sell' ? 'text-[#2675EB]' : 'text-[#111827]'
              }`}
            >
              판매
            </button>
            <button
              onClick={() => handleSwitchTab('pending')}
              ref={(el) => {
                tabRefs.current.pending = el;
              }}
              className={`relative z-10 flex flex-1 items-center justify-center rounded-lg py-[5px] leading-none transition-colors ${
                activeTab === 'pending' ? 'text-[#16A34A]' : 'text-[#111827]'
              }`}
            >
              대기
            </button>
          </div>

          {activeTab !== 'pending' && (
            <div
              key={activeTab}
              className={`flex flex-1 flex-col space-y-2 transition-all duration-300 ${
                dir === 'right' ? 'slide-enter-right' : 'slide-enter-left'
              }`}
            >
              {/* Order Type */}
              <div>
                <label className="mb-1 block text-sm font-medium">
                  주문 유형
                </label>
                <div className="rounded-lg border bg-white px-3 py-1.5 text-sm text-[#9CA3AF]">
                  일반주문 · 지정가
                </div>
              </div>

              <div className="space-y-3 rounded-xl bg-[#F9FAFB] p-4">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-[132px] rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                  <span className="text-sm text-[#6B7280]">원</span>
                  <button
                    onClick={decrementPrice}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border bg-white text-lg text-[#6B7280] hover:bg-gray-50"
                    aria-label="가격 감소"
                  >
                    −
                  </button>
                  <button
                    onClick={incrementPrice}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border bg-white text-lg text-[#6B7280] hover:bg-gray-50"
                    aria-label="가격 증가"
                  >
                    +
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Math.max(1, Number(e.target.value)))
                    }
                    placeholder={
                      activeTab === 'sell' ? '최대 15주 가능' : '최대 5주 가능'
                    }
                    className="w-[132px] rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                  <span className="text-sm text-[#6B7280]">주</span>
                  <button
                    onClick={decrementQuantity}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border bg-white text-lg text-[#6B7280] hover:bg-gray-50"
                    aria-label="수량 감소"
                  >
                    −
                  </button>
                  <button
                    onClick={incrementQuantity}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border bg-white text-lg text-[#6B7280] hover:bg-gray-50"
                    aria-label="수량 증가"
                  >
                    +
                  </button>
                </div>

                {/* 퍼센트 버튼 제거 */}
              </div>

              {/* Submit Button */}
              <div className="mt-auto pt-4 pb-1">
                <button
                  onClick={handleSubmit}
                  className="w-full rounded-xl py-3 text-sm font-semibold text-white transition-colors"
                  style={{
                    backgroundColor: tabStyles.accent,
                    boxShadow: `0 8px 16px -12px ${tabStyles.accent}`,
                  }}
                >
                  {tabStyles.buttonLabel}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'pending' && (
            <div
              className={`flex flex-1 flex-col items-center gap-4 py-10 text-sm text-[#6B7280] ${
                dir === 'right' ? 'slide-enter-right' : 'slide-enter-left'
              }`}
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#F1F5F9]">
                <span className="text-2xl text-[#94A3B8]">🗂️</span>
              </div>
              <p>대기중인 주문이 없어요</p>
            </div>
          )}
        </CardContent>
        <style jsx>{`
          @keyframes slideLeft {
            from {
              opacity: 0;
              transform: translateX(-8px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          @keyframes slideRight {
            from {
              opacity: 0;
              transform: translateX(8px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          .slide-enter-left {
            animation: slideLeft 0.25s ease-out both;
          }
          .slide-enter-right {
            animation: slideRight 0.25s ease-out both;
          }
        `}</style>
      </Card>

      {/* My Orders Card */}
      <Card className="flex flex-1 flex-col rounded-2xl shadow-sm transition-shadow hover:shadow-md">
        <CardContent className="flex flex-col p-6 pb-4 pt-4">
          {!myOrder ? (
            <div className="flex flex-col items-center gap-3 py-6 text-sm text-gray-500">
              <Image
                src={emptyIcon}
                alt="주문 없음"
                width={88}
                height={88}
                priority
              />
              <p>아직 등록된 주문이 없어요.</p>
            </div>
          ) : (
            <div className="flex flex-col text-sm text-[#4B5563]">
              <div className="flex items-start justify-between pt-2">
                <h3 className="text-base font-semibold text-[#111827]">
                  내 자산
                </h3>
                <p className="text-xs font-medium text-[#6B7280]">
                  수수료·세금 제외
                </p>
              </div>

              <dl className="mt-auto space-y-2 pt-6">
                <div className="grid grid-cols-[auto_auto] items-baseline gap-x-6">
                  <dt className="text-sm font-medium text-[#111827]">총 수익</dt>
                  <dd className="text-right text-base font-semibold text-[#E53333]">
                    +{formatCurrency(myOrder.totalProfit)} (
                    {formatRate(myOrder.profitRate)})
                  </dd>
                </div>
                <div className="grid grid-cols-[auto_auto] items-baseline gap-x-6 pt-[10px]">
                  <dt className="text-xs text-[#6B7280]">총 금액</dt>
                  <dd className="text-right text-sm font-medium text-[#6B7280]">
                    {formatCurrency(myOrder.totalAmount)}
                  </dd>
                </div>
                <div className="grid grid-cols-[auto_auto] items-baseline gap-x-6">
                  <dt className="text-xs text-[#6B7280]">수량</dt>
                  <dd className="text-right text-sm font-medium text-[#6B7280]">
                    {myOrder.quantity.toLocaleString('ko-KR')}주
                  </dd>
                </div>
                <div className="grid grid-cols-[auto_auto] items-baseline gap-x-6">
                  <dt className="text-xs text-[#6B7280]">1주 평균 금액</dt>
                  <dd className="text-right text-sm font-medium text-[#6B7280]">
                    {formatCurrency(myOrder.averagePrice)}
                  </dd>
                </div>
              </dl>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
