'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';

import { Card, CardContent } from '@/components/ui/card';
import myHomeEmptyIcon from '@/assets/images/my_home_empty_state_icon.svg';
import { apiFetch } from '@/lib/api-client';

type OrderTab = 'buy' | 'sell' | 'pending';

interface OrderFormProps {
  currentPrice: number;
  assetSummary: AssetSummary | null;
  productId?: number | string;
  pendingRefreshToken?: number;
}

export type AssetSummary = {
  productName: string;
  quantity: number;
  avgBuyPrice: number;
  totalAmount: number;
  totalProfitAmount: number;
  totalProfitRate: number;
};

type BuyOrderResponse = {
  status_code?: number;
  order_id?: string;
  product_id?: number;
  side?: string;
  order_price?: number;
  order_quantity?: number;
  total_amount?: number;
  filled_quantity?: number;
  remaining_quantity?: number;
  created_at?: string;
  idempotency_key?: string;
};

type PendingOrder = {
  id: string;
  side: Exclude<OrderTab, 'pending'>;
  price: number;
  quantity: number;
  createdAt: number;
};

type PendingOrderResponse = {
  page?: number;
  total?: number;
  has_next?: boolean;
  content?: PendingOrderPayload[];
  orders?: PendingOrderPayload[];
  items?: PendingOrderPayload[];
};

type PendingOrderPayload = {
  order_id: string;
  product_id: number;
  product_name?: string;
  order_type?: 'BUY' | 'SELL' | 'buy' | 'sell';
  side?: 'buy' | 'sell';
  price: number;
  quantity: number;
  filled_quantity?: number;
  remaining_quantity?: number;
  amount?: number;
  order_price?: number;
  order_quantity?: number;
  created_at?: string;
  placed_at?: string;
};

export function OrderForm({ currentPrice, assetSummary, productId, pendingRefreshToken = 0 }: OrderFormProps) {
  const [activeTab, setActiveTab] = useState<OrderTab>('buy');
  const [price, setPrice] = useState(currentPrice);
  const [priceInput, setPriceInput] = useState(() => String(currentPrice ?? 0));
  const [quantity, setQuantity] = useState(1);
  const [quantityInput, setQuantityInput] = useState('1');
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  const handlePriceChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!/^\d*$/.test(value)) return;
    setPriceInput(value);
    setPrice(value === '' ? 0 : Number(value));
  };

  const handlePriceBlur = () => {
    const normalized = priceInput === '' ? 0 : Number(priceInput);
    setPrice(normalized);
    setPriceInput(String(normalized));
  };

  const handleQuantityChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!/^\d*$/.test(value)) return;
    setQuantityInput(value);
    setQuantity(value === '' ? 0 : Number(value));
  };

  const handleQuantityBlur = () => {
    const normalized = Math.max(1, Number(quantityInput) || 1);
    setQuantity(normalized);
    setQuantityInput(String(normalized));
  };

  useEffect(() => {
    setPrice(currentPrice);
    setPriceInput(String(currentPrice ?? 0));
  }, [currentPrice]);

  const fetchPendingOrders = useCallback(async () => {
    const numericProductId = Number(productId);
    if (!Number.isFinite(numericProductId)) return;

    try {
      const res = await apiFetch(
        `/v1/market/${numericProductId}/orders/pending?page=1`,
      );
      if (!res.ok) {
        console.warn(`Failed to load pending orders: ${res.status}`);
        return;
      }
      const data = (await res.json()) as PendingOrderResponse;
      const entries = data.items ?? data.content ?? data.orders ?? [];
      const normalized = entries.map((order) => {
        const price = order.price ?? order.order_price ?? 0;
        const quantity = order.quantity ?? order.order_quantity ?? 0;
        const timestamp = order.placed_at ?? order.created_at ?? '';
        const sideValue =
          order.side?.toLowerCase() ?? order.order_type?.toLowerCase() ?? 'buy';
        return {
          id: order.order_id,
          side: sideValue === 'sell' ? 'sell' : 'buy',
          price,
          quantity,
          createdAt: timestamp ? Date.parse(timestamp) || Date.now() : Date.now(),
        } satisfies PendingOrder;
      });
      setPendingOrders(normalized);
    } catch (error) {
      console.error('Failed to fetch pending orders', error);
    }
  }, [productId]);

  useEffect(() => {
    fetchPendingOrders();
  }, [fetchPendingOrders, pendingRefreshToken]);

  const handleSubmit = async () => {
    if (activeTab === 'pending' || isSubmitting) return;

    const numericProductId = Number(productId);
    if (!Number.isFinite(numericProductId)) {
      setSubmitError('상품 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    const normalizedPrice = priceInput === '' ? 0 : Number(priceInput);
    const normalizedQuantity = Math.max(1, quantityInput === '' ? 0 : Number(quantityInput));
    setPrice(normalizedPrice);
    setPriceInput(String(normalizedPrice));
    setQuantity(normalizedQuantity);
    setQuantityInput(String(normalizedQuantity));

    const payload = {
      order_price: normalizedPrice,
      order_quantity: normalizedQuantity,
      client_time: new Date().toISOString(),
    };

    const idempotencyKey =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

    const endpoint = activeTab === 'sell' ? 'sell' : 'buy';

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await apiFetch(`/v1/market/${numericProductId}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const actionLabel = activeTab === 'sell' ? '판매' : '구매';
        let errMsg = `${actionLabel} 주문에 실패했습니다. (코드 ${res.status})`;
        try {
          const errorBody = (await res.json()) as { detail?: string };
          if (errorBody?.detail) errMsg = errorBody.detail;
        } catch {
          // ignore
        }
        setSubmitError(errMsg);
        return;
      }

      await fetchPendingOrders();
      setPrevTab(activeTab);
      setActiveTab('pending');
    } catch (error) {
      console.error('Order failed', error);
      setSubmitError('주문 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const incrementPrice = () =>
    setPrice((prev) => {
      const current = Number.isFinite(prev) ? prev : 0;
      const next = current + 100;
      setPriceInput(String(next));
      return next;
    });
  const decrementPrice = () =>
    setPrice((prev) => {
      const current = Number.isFinite(prev) ? prev : 0;
      const next = Math.max(0, current - 100);
      setPriceInput(String(next));
      return next;
    });
  const incrementQuantity = () =>
    setQuantity((prev) => {
      const base = prev && prev > 0 ? prev : 0;
      const next = base + 1;
      setQuantityInput(String(next));
      return next;
    });
  const decrementQuantity = () =>
    setQuantity((prev) => {
      const base = prev && prev > 0 ? prev : 1;
      const next = Math.max(1, base - 1);
      setQuantityInput(String(next));
      return next;
    });

  const formatCurrency = (value: number) => `${value.toLocaleString('ko-KR')}원`;

  const formatProfitAmount = (value: number) => {
    if (value === 0) return formatCurrency(0);
    const sign = value > 0 ? '+' : '−';
    return `${sign}${formatCurrency(Math.abs(value))}`;
  };

  const formatRate = (value: number) => `${value.toFixed(1)}%`;
  const formatTimestamp = (value: number) =>
    new Date(value).toLocaleString('ko-KR', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

  const tabStyles = useMemo(() => {
    switch (activeTab) {
      case 'buy':
        return {
          accent: '#E94651',
          buttonLabel: '구매하기',
        };
      case 'sell':
        return {
          accent: '#2563EB',
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
                    ? 'border-[#2563EB]'
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
                activeTab === 'sell' ? 'text-[#2563EB]' : 'text-[#111827]'
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
                    value={priceInput}
                    onChange={handlePriceChange}
                    onBlur={handlePriceBlur}
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
                    value={quantityInput}
                    onChange={handleQuantityChange}
                    onBlur={handleQuantityBlur}
                    placeholder={
                      activeTab === 'sell' ? '최대 15토큰 가능' : '최대 5토큰 가능'
                    }
                    className="w-[120px] rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                  <span className="text-sm text-[#6B7280] whitespace-nowrap">토큰</span>
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
                  disabled={isSubmitting}
                  className="w-full rounded-xl py-3 text-sm font-semibold text-white transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: tabStyles.accent,
                    boxShadow: `0 8px 16px -12px ${tabStyles.accent}`,
                  }}
                >
                  {isSubmitting ? '주문 중...' : tabStyles.buttonLabel}
                </button>
                {submitError ? (
                  <p className="mt-2 text-xs text-red-500">{submitError}</p>
                ) : null}
              </div>
            </div>
          )}

          {activeTab === 'pending' && (
            <div
              className={`flex flex-1 flex-col gap-3 pt-2 pb-4 text-sm text-[#6B7280] ${
                dir === 'right' ? 'slide-enter-right' : 'slide-enter-left'
              }`}
            >
              {pendingOrders.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-4 py-6 text-sm">
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#F1F5F9]">
                    <span className="text-2xl text-[#94A3B8]">🗂️</span>
                  </div>
                  <p>대기중인 주문이 없어요</p>
                </div>
              ) : (
                <div className="max-h-[240px] space-y-3 overflow-y-auto pr-1">
                  {pendingOrders.map((order) => (
                    <div
                      key={order.id}
                      className="rounded-xl border bg-white px-4 py-3 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-sm font-semibold ${
                            order.side === 'buy'
                              ? 'text-[#E94651]'
                              : 'text-[#2563EB]'
                          }`}
                        >
                          {order.side === 'buy' ? '매수' : '매도'} 주문
                        </span>
                        <span className="text-xs font-medium text-[#16A34A]">
                          체결 대기
                        </span>
                      </div>
                      <div className="mt-3 space-y-2 text-xs text-[#6B7280]">
                        <div className="flex justify-between">
                          <span>가격</span>
                          <span className="text-sm font-medium text-[#111827]">
                            {formatCurrency(order.price)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>수량</span>
                          <span className="text-sm font-medium text-[#111827]">
                            {order.quantity.toLocaleString('ko-KR')}토큰
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>총 금액</span>
                          <span className="text-sm font-semibold text-[#111827]">
                            {formatCurrency(order.price * order.quantity)}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 text-right text-[11px] text-[#9CA3AF]">
                        {formatTimestamp(order.createdAt)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
          {assetSummary ? (
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
                  <dt className="text-sm font-medium text-[#111827]">
                    총 수익
                  </dt>
                  <dd
                    className={`text-right text-base font-semibold ${
                      assetSummary.totalProfitAmount > 0
                        ? 'text-[#E53333]'
                        : assetSummary.totalProfitAmount < 0
                          ? 'text-[#2563EB]'
                          : 'text-[#6B7280]'
                    }`}
                  >
                    {formatProfitAmount(assetSummary.totalProfitAmount)} (
                    {formatRate(Number(assetSummary.totalProfitRate ?? 0))})
                  </dd>
                </div>
                <div className="grid grid-cols-[auto_auto] items-baseline gap-x-6 pt-[10px]">
                  <dt className="text-xs text-[#6B7280]">총 금액</dt>
                  <dd className="text-right text-sm font-medium text-[#6B7280]">
                    {formatCurrency(assetSummary.totalAmount)}
                  </dd>
                </div>
                <div className="grid grid-cols-[auto_auto] items-baseline gap-x-6">
                  <dt className="text-xs text-[#6B7280]">수량</dt>
                  <dd className="text-right text-sm font-medium text-[#6B7280]">
                    {assetSummary.quantity.toLocaleString('ko-KR')}토큰
                  </dd>
                </div>
                <div className="grid grid-cols-[auto_auto] items-baseline gap-x-6">
                  <dt className="text-xs text-[#6B7280]">1토큰 평균 금액</dt>
                  <dd className="text-right text-sm font-medium text-[#6B7280]">
                    {formatCurrency(assetSummary.avgBuyPrice)}
                  </dd>
                </div>
              </dl>
            </div>
          ) : hasHydrated ? (
            <div className="flex flex-col items-center gap-4 py-8 text-sm text-gray-500">
              <Image
                src={myHomeEmptyIcon}
                alt="내 자산 정보 없음"
                width={64}
                height={64}
                priority
              />
              <p className="mt-3 text-[#5A6A86]">내 자산 정보가 없습니다.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 py-8 text-sm text-gray-500">
              <div className="h-12 w-12 rounded-full bg-gray-200" />
              <div className="h-3 w-24 rounded-full bg-gray-100" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
