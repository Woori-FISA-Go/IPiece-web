'use client';

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { TradingChart } from '@/components/trade/chart/chart';
import type { TradeTickMessage } from '@/components/trade/chart/chart';
import { OrderForm } from '@/components/trade/chart/order-form';
import type { AssetSummary as OrderAssetSummary } from '@/components/trade/chart/order-form';
import { OrderBook } from '@/components/trade/chart/orderbook';
import type { OrderBookProps } from '@/components/trade/chart/orderbook';
import {
  RevenueInfoCard,
  IpIntroCard,
} from '@/components/trade/info/info-panel';
import { ImageInfoPanel } from '@/components/trade/info/image-info-panel';
import { NoticePanel } from '@/components/trade/info/notice-panel';
import type { Notice, SecurityInfo } from '@/lib/mock-info';
import { MOCK_INFO } from '@/lib/mock-info';
import { buildHeartMaskStyle } from '@/components/common/heart-mask-style';
import { apiFetch } from '@/lib/api-client';
import { useStompTopics, type StompTopicConfig } from '@/hooks/use-orderbook-subscription';
import { getUserId } from '@/lib/auth';

const wsDebugEnabled = process.env.NEXT_PUBLIC_WS_DEBUG === 'true';

type ProductInfo = {
  product_id: number;
  product_name: string;
  token_unit: string;
  current_price: number;
  change_rate: number;
  thumbnail_img: string;
  is_favorited: boolean;
};

type ProductNotice = {
  disclosure_date: string;
  disclosure_title: string;
  disclosure_url?: string;
};

type ProductDetails = {
  owner: string;
  total_supply: number;
  token_standard: string;
  exchange_listing: string;
  description: string;
  product_page_image?: string;
  detail_image?: string;
  detail_url?: string;
  dividends?: {
    dividend_id: number;
    amount_per_token: number;
    payment_date: string;
  }[];
  notices?: ProductNotice[];
};

type ProductDetailResponse = {
  info: ProductInfo;
  details: ProductDetails;
};

type AssetResponse = {
  product_name: string;
  quantity: number;
  avg_buy_price: number;
  total_amount: number;
  total_profit_amount: number;
  total_profit_rate: number;
};

type OrdersResponse = {
  summary: {
    highest_price: number;
    lowest_price: number;
    last_price: number;
    price_change: number;
    limit_up_price: number;
    limit_down_price: number;
    this_week_volume: number;
    last_week_volume: number;
  };
  orders_sell: Array<{
    order_price: number;
    quantity: number;
    price_change: number;
  }>;
  orders_buy: Array<{
    order_price: number;
    quantity: number;
    price_change: number;
  }>;
};

export default function TradingDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [liked, setLiked] = useState(false);
  const [favoritePending, setFavoritePending] = useState(false);
  const [activeTab, setActiveTab] = useState<'chart' | 'info'>('chart');
  const [productInfo, setProductInfo] = useState<ProductInfo | null>(null);
  const [productDetails, setProductDetails] = useState<ProductDetails | null>(null);
  const [notices, setNotices] = useState<Notice[] | undefined>(undefined);
  const [assetSummary, setAssetSummary] = useState<OrderAssetSummary | null>(null);
  const [orderBookData, setOrderBookData] = useState<OrderBookProps | null>(null);
  const [pendingRefreshToken, setPendingRefreshToken] = useState(0);
  const [latestTick, setLatestTick] = useState<TradeTickMessage | null>(null);
  const [userId, setUserId] = useState<number | string | null>(null);
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
    setUserId(getUserId());
  }, []);

  useEffect(() => {
    const handleResize = () => updateHighlightPosition();
    window.addEventListener('resize', handleResize);
    requestAnimationFrame(updateHighlightPosition);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await apiFetch(`/v1/market/${id}/details`);
        if (!res.ok) {
          throw new Error(`Failed to load product details: ${res.status}`);
        }

        const data = (await res.json()) as ProductDetailResponse;
        setProductInfo(data.info);
        setProductDetails(data.details);
        setLiked(Boolean(data.info?.is_favorited));

        const mappedNotices: Notice[] | undefined = data.details?.notices?.map(
          (notice, idx) => {
            const date = notice.disclosure_date;
            const year = new Date(date).getFullYear();
            return {
              id: `notice-${idx}-${date}`,
              date,
              title: notice.disclosure_title,
              subtitle: undefined,
              year,
              url: notice.disclosure_url,
            } satisfies Notice;
          },
        );
        setNotices(mappedNotices);
      } catch (error) {
        console.error('Failed to fetch product details', error);
      }
    };

    fetchDetails();
  }, [id]);

  useEffect(() => {
    const fetchAsset = async () => {
      try {
        const res = await apiFetch(`/v1/market/${id}/asset`);
        if (!res.ok) {
          console.warn(`Failed to load asset summary: ${res.status}`);
          setAssetSummary(null);
          return;
        }
        const data = (await res.json()) as AssetResponse;
        setAssetSummary({
          productName: data.product_name,
          quantity: data.quantity,
          avgBuyPrice: data.avg_buy_price,
          totalAmount: data.total_amount,
          totalProfitAmount: data.total_profit_amount,
          totalProfitRate: data.total_profit_rate,
        });
      } catch (error) {
        console.error('Failed to fetch asset summary', error);
        setAssetSummary(null);
      }
    };

    fetchAsset();
  }, [id]);

  const handleOrderBookPayload = useCallback(
    (data?: Partial<OrdersResponse>) => {
      if (!data) return;
      const mapOrders = (orders: OrdersResponse['orders_sell']) =>
        orders?.map((order) => ({
          price: order.order_price,
          quantity: order.quantity,
          changePct: order.price_change,
        })) ?? [];

      setOrderBookData({
        summary: {
          highestPrice: data.summary?.highest_price ?? 0,
          lowestPrice: data.summary?.lowest_price ?? 0,
          lastPrice: data.summary?.last_price ?? 0,
          priceChange: data.summary?.price_change ?? 0,
          limitUpPrice: data.summary?.limit_up_price ?? 0,
          limitDownPrice: data.summary?.limit_down_price ?? 0,
          thisWeekVolume: data.summary?.this_week_volume ?? 0,
          lastWeekVolume: data.summary?.last_week_volume ?? 0,
        },
        ordersSell: mapOrders(data.orders_sell ?? []),
        ordersBuy: mapOrders(data.orders_buy ?? []),
      });

      if (data.summary) {
        setProductInfo((prev) =>
          prev
            ? {
                ...prev,
                current_price: data.summary?.last_price ?? prev.current_price,
                change_rate: data.summary?.price_change ?? prev.change_rate,
              }
            : prev,
        );
      }
    },
    [],
  );

  const handleHoldingPayload = useCallback((payload: unknown) => {
    if (!payload) {
      setAssetSummary(null);
      return;
    }
    const data = payload as Record<string, unknown>;
    const toNumber = (value: unknown) => {
      const num = Number(value);
      return Number.isFinite(num) ? num : 0;
    };
    setAssetSummary({
      productName: (data.product_name ?? data.productName ?? '') as string,
      quantity: toNumber(data.quantity),
      avgBuyPrice: toNumber(data.avg_buy_price ?? data.avgBuyPrice),
      totalAmount: toNumber(data.total_amount ?? data.totalAmount),
      totalProfitAmount: toNumber(
        data.total_profit_amount ?? data.totalProfitAmount,
      ),
      totalProfitRate: toNumber(
        data.total_profit_rate ?? data.totalProfitRate,
      ),
    });
  }, []);

  const handlePendingRealtime = useCallback(() => {
    setPendingRefreshToken(Date.now());
  }, []);

  const handleChartTick = useCallback((payload: unknown) => {
    setLatestTick(payload as TradeTickMessage);
  }, []);

  const handleProductPriceUpdate = useCallback((payload: unknown) => {
    const price =
      typeof payload === 'number' ? payload : Number(payload ?? NaN);
    if (Number.isNaN(price)) return;
    setProductInfo((prev) =>
      prev ? { ...prev, current_price: price } : prev,
    );
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await apiFetch(`/v1/market/${id}/orders`);
        if (!res.ok) {
          console.warn(`Failed to load order book: ${res.status}`);
          setOrderBookData(null);
          return;
        }
        const data = (await res.json()) as OrdersResponse;
        handleOrderBookPayload(data);
      } catch (error) {
        console.error('Failed to fetch order book data', error);
        setOrderBookData(null);
      }
    };

    fetchOrders();
  }, [handleOrderBookPayload, id]);

  const numericProductId = productInfo?.product_id ?? Number(id);

  const stompTopics = useMemo(() => {
    const topics: StompTopicConfig[] = [];
    if (Number.isFinite(numericProductId)) {
      topics.push({
        destination: `/topic/orderbook/${numericProductId}`,
        handler: (message: unknown) =>
          handleOrderBookPayload(message as Partial<OrdersResponse>),
      });
      topics.push({
        destination: `/topic/chart/${numericProductId}`,
        handler: handleChartTick,
      });
      topics.push({
        destination: `/topic/product/${numericProductId}/price`,
        handler: handleProductPriceUpdate,
        parseJson: false,
      });
    }
    if (userId != null && Number.isFinite(numericProductId)) {
      topics.push({
        destination: `/topic/holding/${userId}/${numericProductId}`,
        handler: handleHoldingPayload,
      });
      topics.push({
        destination: `/topic/pending-orders/${userId}/${numericProductId}`,
        handler: handlePendingRealtime,
      });
    }
    return topics;
  }, [
    handleChartTick,
    handleHoldingPayload,
    handleOrderBookPayload,
    handlePendingRealtime,
    handleProductPriceUpdate,
    numericProductId,
    userId,
  ]);

  useStompTopics({
    debug: wsDebugEnabled,
    topics: stompTopics,
  });

  const mappedInfo = useMemo<SecurityInfo | null>(() => {
    if (!productInfo || !productDetails) return null;

    const dividends = productDetails.dividends ?? [];
    const revenueMonthly = dividends
      .map((dividend) => {
        const date = new Date(dividend.payment_date);
        const monthLabel = `${date.getMonth() + 1}월`;
        return {
          t: monthLabel,
          value: dividend.amount_per_token,
          date: dividend.payment_date,
        };
      })
      .sort((a, b) => {
        const aMonth = Number(a.t.replace('월', ''));
        const bMonth = Number(b.t.replace('월', ''));
        return aMonth - bMonth;
      });

    return {
      id: String(productInfo.product_id ?? id),
      name: productInfo.product_name,
      issueDate: '',
      publisher: productDetails.owner ?? '',
      totalIssue: productDetails.total_supply
        ? productDetails.total_supply.toLocaleString('ko-KR')
        : '',
      tokenStandard: productDetails.token_standard ?? '',
      listing: productDetails.exchange_listing ?? '',
      summary: productDetails.description ?? '',
      heroImage:
        productDetails.product_page_image ||
        productDetails.detail_image ||
        productDetails.detail_url ||
        productInfo.thumbnail_img,
      revenueMonthly,
    };
  }, [id, productDetails, productInfo]);

  const changeRate = Number(productInfo?.change_rate ?? 0);
  const formattedChange = changeRate.toFixed(1);
  const isZeroChange = changeRate === 0;
  const isPositiveChange = changeRate > 0;
  const changeText = isZeroChange
    ? '0.0%'
    : isPositiveChange
      ? `+${formattedChange}%`
      : `${formattedChange}%`;
  const changeClass = isZeroChange
    ? 'text-gray-500'
    : isPositiveChange
      ? 'text-[#E53333]'
      : 'text-[#2563EB]';

  const infoForCards: SecurityInfo = mappedInfo ?? MOCK_INFO;
  const fallbackThumbnail = 'https://via.placeholder.com/64x64.png?text=IP';
  const [thumbnailSrc, setThumbnailSrc] = useState(fallbackThumbnail);

  useEffect(() => {
    const candidate = productInfo?.thumbnail_img || infoForCards.heroImage || '';
    const nextSrc = candidate.trim().length > 0 ? candidate : fallbackThumbnail;
    setThumbnailSrc(nextSrc);
  }, [productInfo?.thumbnail_img, infoForCards.heroImage]);

  const handleFavoriteToggle = useCallback(async () => {
    if (favoritePending) return;
    const productId = productInfo?.product_id ?? Number(id);
    if (!productId || Number.isNaN(productId)) return;
    const previousLiked = liked;
    const nextLiked = !previousLiked;
    setLiked(nextLiked);
    setFavoritePending(true);
    try {
      const res = await apiFetch(`/v1/products/${productId}/favorite`, {
        method: nextLiked ? 'POST' : 'DELETE',
        headers: { accept: '*/*' },
      });
      if (!res.ok) {
        throw new Error(`Favorite toggle failed: ${res.status}`);
      }
    } catch (error) {
      console.error('Failed to toggle favorite', error);
      setLiked(previousLiked);
    } finally {
      setFavoritePending(false);
    }
  }, [favoritePending, id, liked, productInfo?.product_id]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="mx-auto w-full max-w-[1680px] px-6 lg:px-12 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={thumbnailSrc}
                  alt={`${productInfo?.product_name ?? infoForCards.name} 썸네일`}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold">
                  {productInfo?.product_name ?? infoForCards.name}
                </h1>
                <p className="text-sm text-gray-600" suppressHydrationWarning>
                  1 {productInfo?.token_unit ?? ''} 당{' '}
                  {productInfo?.current_price?.toLocaleString('ko-KR') ?? '-'}원{' '}
                  <span
                    className={`ml-2 ${changeClass} text-base font-semibold`}
                    suppressHydrationWarning
                  >
                    {changeText}
                  </span>
                </p>
              </div>
            </div>
            <button
              onClick={handleFavoriteToggle}
              disabled={favoritePending}
              className="rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2563EB]"
              aria-label={liked ? '좋아요 취소' : '좋아요'}
              aria-pressed={liked}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-[5px] bg-[#EAECF0]">
                <span
                  aria-hidden="true"
                  className="transition-opacity"
                  style={buildHeartMaskStyle(
                    liked ? '#F9595F' : '#29293A',
                    liked ? 1 : 0.23,
                  )}
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
              <TradingChart
                productId={productInfo?.product_id ?? Number(id)}
                liveTick={latestTick}
              />
            </div>

            {/* Order Form - Middle Column */}
            <div className="lg:h-[var(--panel-height)] lg:w-[320px]">
              <OrderForm
                currentPrice={productInfo?.current_price ?? 0}
                assetSummary={assetSummary}
                productId={productInfo?.product_id ?? Number(id)}
                pendingRefreshToken={pendingRefreshToken}
              />
            </div>

            {/* Order Book - Right Column */}
            <div className="lg:h-[var(--panel-height)]">
              <OrderBook
                summary={orderBookData?.summary}
                ordersSell={orderBookData?.ordersSell}
                ordersBuy={orderBookData?.ordersBuy}
              />
            </div>
          </div>
        </main>
      )}

      {activeTab === 'info' && (
        <main className="mx-auto w-full max-w-[1680px] px-6 lg:px-12 py-6">
          <div className="space-y-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(320px,2fr)] items-start">
              <RevenueInfoCard info={infoForCards} />
              <ImageInfoPanel info={infoForCards} />
            </div>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-start">
              <IpIntroCard info={infoForCards} />
              <NoticePanel notices={notices} />
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
