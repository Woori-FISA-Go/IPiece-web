"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { OfferingStatusFilter } from '@/components/offering/offering-status-filter';
import { OfferingCard } from '@/components/offering/offering-card';
import type { OfferingItem, OfferingStatus } from '@/lib/mock-offering';
import { apiFetch } from '@/lib/api-client';
import { getAccessToken } from '@/lib/auth';
import { deriveOfferingStatus } from './utils';

type ApiOfferingItem = {
  productId: number;
  productName: string;
  owner: string;
  thumbnailImg?: string;
  status?: 'OFFERING' | 'TRADE' | string;
  progressRate?: number;
  offeringStartDate?: string;
  offeringEndDate?: string;
  offeringPrice: number;
  isFavorite?: boolean;
};

type OfferingListResponse = {
  items: ApiOfferingItem[];
  hasNext?: boolean;
  nextCursor?: number;
  totalCount?: number;
  beforeCount?: number;
  ingCount?: number;
  afterCount?: number;
};

export type OfferingListItem = OfferingItem & {
  startDate?: string;
  endDate?: string;
};

const STATUS_OPTIONS: OfferingStatus[] = ['UPCOMING', 'ONGOING', 'ENDED'];

export default function OfferingPage() {
  const router = useRouter();
  const [selectedStatuses, setSelectedStatuses] = useState<OfferingStatus[]>([]);
  const [items, setItems] = useState<OfferingListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isNavigatingId, setIsNavigatingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [hasNext, setHasNext] = useState(false);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [countSummary, setCountSummary] = useState<{
    total: number | null;
    upcoming: number | null;
    ongoing: number | null;
    ended: number | null;
  }>({
    total: null,
    upcoming: null,
    ongoing: null,
    ended: null,
  });

  type LoadOptions = {
    cursor?: number;
    append?: boolean;
    signal?: AbortSignal;
  };

  const loadOfferings = useCallback(
    async ({ cursor, append = false, signal }: LoadOptions = {}) => {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
        setToastMessage(null);
      }

      const baseError = '공모 목록을 불러오지 못했습니다.';
      const appendError = '추가 공모 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.';

      try {
        const token = getAccessToken();
        const params = cursor !== undefined ? `?cursor=${cursor}` : '';
        const res = await apiFetch(`/v1/offerings${params}`, {
          signal,
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!res.ok) {
          let message = append ? appendError : baseError;
          try {
            const err = (await res.json()) as { detail?: string; message?: string };
            message = err.detail || err.message || message;
          } catch {
            /* ignore parse errors */
          }
          if (!append) {
            setItems([]);
            setToastMessage(message);
          } else {
            setHasNext(false);
          }
          return;
        }
        const data = (await res.json()) as OfferingListResponse;
        const mapped = (data.items || []).map(mapOfferingItem);
        setItems((prev) => (append ? [...prev, ...mapped] : mapped));
        setHasNext(Boolean(data.hasNext));
        setNextCursor(data.nextCursor ?? null);
        setCountSummary({
          total: data.totalCount ?? null,
          upcoming: data.beforeCount ?? null,
          ongoing: data.ingCount ?? null,
          ended: data.afterCount ?? null,
        });
        setToastMessage(null);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          console.error('Failed to fetch offerings', error);
          if (!append) {
            setItems([]);
            setToastMessage(error instanceof Error ? error.message : baseError);
          } else {
            setHasNext(false);
          }
        }
      } finally {
        if (append) {
          setIsLoadingMore(false);
        } else {
          setIsLoading(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    const controller = new AbortController();
    loadOfferings({ signal: controller.signal });
    return () => controller.abort();
  }, [loadOfferings]);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 2200);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  useEffect(() => {
    if (!hasNext || nextCursor == null || isLoading || isLoadingMore) return;
    const target = sentinelRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !isLoading && !isLoadingMore && nextCursor != null) {
          loadOfferings({ cursor: nextCursor, append: true });
        }
      },
      { rootMargin: '200px' },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasNext, nextCursor, isLoading, isLoadingMore, loadOfferings]);

  const filteredItems = useMemo(() => {
    const showAll =
      selectedStatuses.length === 0 || selectedStatuses.length === STATUS_OPTIONS.length;
    const list = showAll ? items : items.filter((item) => selectedStatuses.includes(item.status));
    return [...list].sort((a, b) => {
      const rank = (status: OfferingStatus) => {
        if (status === 'UPCOMING') return 0;
        if (status === 'ONGOING') return 1;
        return 2; // ENDED
      };
      const ra = rank(a.status);
      const rb = rank(b.status);
      if (ra !== rb) return ra - rb;
      const aStart = a.startDate ? new Date(a.startDate).getTime() : 0;
      const bStart = b.startDate ? new Date(b.startDate).getTime() : 0;
      return bStart - aStart;
    });
  }, [items, selectedStatuses]);

  const displayCount = useMemo(() => {
    const allSelected =
      selectedStatuses.length === 0 || selectedStatuses.length === STATUS_OPTIONS.length;
    if (allSelected) {
      return countSummary.total ?? filteredItems.length;
    }

    const sum = selectedStatuses.reduce((acc, status) => {
      if (status === 'UPCOMING') {
        return acc + (countSummary.upcoming ?? 0);
      }
      if (status === 'ONGOING') {
        return acc + (countSummary.ongoing ?? 0);
      }
      if (status === 'ENDED') {
        return acc + (countSummary.ended ?? 0);
      }
      return acc;
    }, 0);

    return sum > 0 ? sum : filteredItems.length;
  }, [selectedStatuses, countSummary, filteredItems.length]);

  const handleFavoriteToggle = async (productId: string, nextLiked: boolean) => {
    const token = getAccessToken();
    if (!token) {
      setToastMessage('로그인이 필요합니다. 먼저 로그인해 주세요.');
      return false;
    }

    try {
      const res = await apiFetch(`/v1/products/${productId}/favorite`, {
        method: nextLiked ? 'POST' : 'DELETE',
      });
      if (!res.ok) {
        let message: string | undefined;
        try {
          const err = (await res.json()) as { detail?: string; message?: string };
          message = err.detail || err.message;
        } catch {
          /* ignore */
        }
        throw new Error(message || '관심 등록 처리에 실패했습니다.');
      }
      setItems((prev) =>
        prev.map((item) =>
          item.id === productId
            ? {
                ...item,
                liked: nextLiked,
              }
            : item,
        ),
      );
      return true;
    } catch (error) {
      console.error('Failed to toggle favorite', error);
      setToastMessage(error instanceof Error ? error.message : '관심 등록 처리에 실패했습니다.');
      return false;
    }
  };

  const handleNavigate = async (productId: string) => {
    if (isNavigatingId === productId) return;
    setIsNavigatingId(productId);
    try {
      const res = await apiFetch(`/v1/offerings/${productId}/detail`);
      if (!res.ok) {
        let message: string | undefined;
        try {
          const err = (await res.json()) as { detail?: string; message?: string };
          message = err.detail || err.message;
        } catch {
          /* ignore */
        }
        throw new Error(message || '상세 정보를 불러오지 못했습니다.');
      }
      const detail = await res.json().catch(() => null);
      if (detail) {
        sessionStorage.setItem(`offering-detail:${productId}`, JSON.stringify(detail));
      }
      router.push(`/offering/${productId}`);
    } catch (error) {
      console.error('Failed to open offering detail', error);
      setToastMessage(error instanceof Error ? error.message : '상세 정보를 불러오지 못했습니다.');
    } finally {
      setIsNavigatingId(null);
    }
  };

  return (
    <main className="flex-1 bg-white">
      <div className="max-w-[1280px] mx-auto px-6 py-8">
        <div className="grid grid-cols-[200px_1fr] gap-8">
          <aside className="border-r border-gray-200 pr-6">
            <OfferingStatusFilter selected={selectedStatuses} onChange={setSelectedStatuses} />
          </aside>

          <section>
            <div className="mb-6 text-sm text-gray-700">
              <span className="inline-flex items-center justify-center bg-gray-100 text-gray-900 font-medium px-3 py-1 rounded text-sm">
                {isLoading ? '불러오는 중...' : `총 ${displayCount}건`}
              </span>
            </div>

            {isLoading ? (
              <div className="text-center py-12 text-gray-400">공모 목록을 불러오는 중입니다.</div>
            ) : filteredItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {filteredItems.map((item) => (
                  <OfferingCard
                    key={item.id}
                    item={item}
                    onLikeToggle={handleFavoriteToggle}
                    onNavigate={handleNavigate}
                    isNavigating={isNavigatingId === item.id}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400">조건에 맞는 공모가 없습니다.</p>
              </div>
            )}
            <div ref={sentinelRef} className="h-10" />
            {isLoadingMore ? <p className="mt-4 text-center text-sm text-gray-400">불러오는 중...</p> : null}
          </section>
        </div>
      </div>
      {toastMessage ? (
        <div className="fixed bottom-6 right-6 z-50 rounded-md bg-black/80 px-4 py-2 text-sm text-white shadow-lg">
          {toastMessage}
        </div>
      ) : null}
    </main>
  );
}

function mapOfferingItem(item: ApiOfferingItem): OfferingListItem {
  const derivedStatus = deriveOfferingStatus({
    progressRate: item.progressRate,
    offeringStartDate: item.offeringStartDate,
    offeringEndDate: item.offeringEndDate,
  });
  const finalStatus: OfferingStatus =
    item.status === 'TRADE' ? 'ENDED' : derivedStatus;

  return {
    id: item.productId.toString(),
    title: item.productName,
    author: item.owner || 'IPiece',
    priceKRW: item.offeringPrice,
    progressPct: item.progressRate ?? 0,
    status: finalStatus,
    imageUrl: normalizeThumbnail(item.thumbnailImg) ?? '',
    liked: Boolean(item.isFavorite),
    startDate: item.offeringStartDate,
    endDate: item.offeringEndDate,
  };
}

function normalizeThumbnail(url?: string) {
  if (!url) return undefined;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const base = process.env.NEXT_PUBLIC_API_URL ?? '';
  const normalized = url.startsWith('/') ? url : `/${url}`;
  return `${base}${normalized}`;
}
