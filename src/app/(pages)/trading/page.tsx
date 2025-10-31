'use client';

import { useState, useEffect, useRef } from 'react';
// TODO: 추푸 NavTabs, Footer 파일 추가
// import { NavTabs } from '@/components/nav-tabs';
import { IPCard } from './components/ip-card';
// import { Footer } from '@/components/footer';
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
    <div className="min-h-screen flex flex-col">
      {/* <NavTabs /> */}

      <main className="flex-1 py-6 md:py-8">
        <div className="mx-auto w-full max-w-[1560px] px-6 lg:px-12 xl:px-16">
          <div className="mb-6">
            <span className="inline-flex items-center justify-center text-foreground font-medium px-3 py-1 rounded text-sm">
              {allItems.length}개
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {displayedItems.map((item) => (
              <IPCard
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

      {/* <Footer /> */}
    </div>
  );
}
