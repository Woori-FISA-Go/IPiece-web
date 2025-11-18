'use client';

import { useState, useEffect, useRef } from 'react';
// TODO: 추푸 NavTabs, Footer ?�일 추�?
// import { NavTabs } from '@/components/nav-tabs';
import { TradeCard } from '@/components/trade/trade-card';
import { sampleIPOData } from '@/lib/sample-data';

export default function HomePage() {
  const [allItems, setAllItems] = useState(() =>
    sampleIPOData.map((item) => ({ ...item })),
  );
  const [displayedCount, setDisplayedCount] = useState(12);
  const [isLoading, setIsLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const displayedItems = allItems.slice(0, displayedCount);
  const hasMore = displayedCount < allItems.length;

  const handleLikeToggle = (id: string) => {
    setAllItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, liked: !item.liked } : item,
      ),
    );
  };

  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && hasMore) {
          setIsLoading(true);
          // Simulate loading delay
          setTimeout(() => {
            setDisplayedCount((prev) => Math.min(prev + 10, allItems.length));
            setIsLoading(false);
          }, 500);
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(sentinelRef.current);

    return () => observer.disconnect();
  }, [hasMore, isLoading, allItems.length]);

  return (
    <main className="flex-1 p-6 md:p-8">
      {/* <NavTabs /> */}
      <div className="mb-6">
        <span className="inline-flex items-center justify-center bg-gray-100 text-gray-900 font-medium px-3 py-1 rounded text-sm">
          {allItems.length}개
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {displayedItems.map((item) => (
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
              <span>로딩 �?..</span>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
