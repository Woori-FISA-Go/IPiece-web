'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
// TODO: 추푸 NavTabs, Footer ?�일 추�?
// import { NavTabs } from '@/components/nav-tabs';
import { TradeCard } from '@/components/trade/trade-card';
import type { IPOItem } from '@/lib/sample-data';
import { apiFetch } from '@/lib/api-client';

type MarketProduct = {
  productId: number;
  thumbnailImg: string;
  productName: string;
  owner: string;
  currentPrice: number;
  changeRate: number;
  isFavorited: boolean;
  startAt: string;
};

type MarketProductsResponse = {
  products: MarketProduct[];
  totalCount: number;
  page: number;
};

const mapProductToIPOItem = (product: MarketProduct): IPOItem => ({
  id: `${product.productId}`,
  title: product.productName,
  author: product.owner,
  priceKRW: product.currentPrice,
  changePct: product.changeRate,
  imageUrl: product.thumbnailImg,
  liked: product.isFavorited,
});

export default function HomePage() {
  const [items, setItems] = useState<IPOItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const isRequestingRef = useRef(false);

  const fetchProducts = useCallback(async (pageToFetch: number) => {
    if (isRequestingRef.current) return;

    isRequestingRef.current = true;
    setIsLoading(true);
    try {
      const res = await apiFetch(`/v1/market/products?page=${pageToFetch}`);
      if (!res.ok) {
        throw new Error(`Failed to load products: ${res.status}`);
      }

      const data = (await res.json()) as MarketProductsResponse;
      const mapped = Array.isArray(data.products)
        ? data.products.map(mapProductToIPOItem)
        : [];

      let mergedLength = 0;
      setItems((prev) => {
        const existingIds = new Set(prev.map((item) => item.id));
        const merged = [...prev];
        mapped.forEach((item) => {
          if (!existingIds.has(item.id)) {
            merged.push(item);
            existingIds.add(item.id);
          }
        });
        mergedLength = merged.length;
        return merged;
      });

      const total = typeof data.totalCount === 'number' ? data.totalCount : null;
      setTotalCount((current) => (total !== null ? total : current));

      const shouldLoadMore =
        total !== null ? mapped.length > 0 && mergedLength < total : mapped.length > 0;
      setHasMore(shouldLoadMore);
      setPage(pageToFetch);
    } catch (error) {
      console.error('Failed to fetch products', error);
    } finally {
      setIsLoading(false);
      isRequestingRef.current = false;
    }
  }, []);

  const fetchNextPage = useCallback(() => {
    if (!hasMore || isRequestingRef.current) return;
    fetchProducts(page + 1);
  }, [fetchProducts, hasMore, page]);

  useEffect(() => {
    fetchProducts(1);
  }, [fetchProducts]);

  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isRequestingRef.current && hasMore) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(sentinelRef.current);

    return () => observer.disconnect();
  }, [hasMore, fetchNextPage]);

  const handleLikeToggle = (id: string) => {
    setItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, liked: !item.liked } : item,
      ),
    );
  };

  const totalItems = totalCount ?? items.length;

  return (
    <main className="flex-1 bg-white">
      <div className="mx-auto w-full max-w-[1280px] px-6 py-6">
        {/* <NavTabs /> */}
        <div className="mb-6">
          <span className="inline-flex items-center justify-center bg-gray-100 text-gray-900 font-medium px-3 py-1 rounded text-sm">
            {totalItems}개
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <TradeCard
              key={item.id}
              item={item}
              onLikeToggle={handleLikeToggle}
            />
          ))}
        </div>

        {hasMore && (
          <div ref={sentinelRef} className="flex justify-center py-8">
            {isLoading && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span>로딩 중...</span>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
