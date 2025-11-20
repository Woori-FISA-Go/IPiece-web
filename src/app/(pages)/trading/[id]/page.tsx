'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { TradingChart } from '@/components/trade/chart/chart';
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
  const [activeTab, setActiveTab] = useState<'chart' | 'info'>('chart');
  const [productInfo, setProductInfo] = useState<ProductInfo | null>(null);
  const [productDetails, setProductDetails] = useState<ProductDetails | null>(null);
  const [notices, setNotices] = useState<Notice[] | undefined>(undefined);
  const [assetSummary, setAssetSummary] = useState<OrderAssetSummary | null>(null);
  const [orderBookData, setOrderBookData] = useState<OrderBookProps | null>(null);
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
      } catch (error) {
        console.error('Failed to fetch order book data', error);
        setOrderBookData(null);
      }
    };

    fetchOrders();
  }, [id]);

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
      : 'text-[#3386E5]';

  const infoForCards: SecurityInfo = mappedInfo ?? MOCK_INFO;
  const fallbackThumbnail = 'https://via.placeholder.com/64x64.png?text=IP';
  const [thumbnailSrc, setThumbnailSrc] = useState(fallbackThumbnail);

  useEffect(() => {
    const candidate = productInfo?.thumbnail_img || infoForCards.heroImage || '';
    const nextSrc = candidate.trim().length > 0 ? candidate : fallbackThumbnail;
    setThumbnailSrc(nextSrc);
  }, [productInfo?.thumbnail_img, infoForCards.heroImage]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="mx-auto w-full max-w-[1560px] px-4 sm:px-8 lg:px-16 py-4">
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
              onClick={() => setLiked(!liked)}
              className="rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A4DE5]"
              aria-label={liked ? '좋아요 취소' : '좋아요'}
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
              <TradingChart productId={productInfo?.product_id ?? Number(id)} />
            </div>

            {/* Order Form - Middle Column */}
            <div className="lg:h-[var(--panel-height)] lg:w-[320px]">
              <OrderForm
                currentPrice={productInfo?.current_price ?? 0}
                assetSummary={assetSummary}
                productId={productInfo?.product_id ?? Number(id)}
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
