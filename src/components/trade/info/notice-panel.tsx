'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { MOCK_NOTICES, type Notice } from '@/lib/mock-info';

interface NoticePanelProps {
  notices?: Notice[];
}

export function NoticePanel({ notices }: NoticePanelProps = {}) {
  const sourceNotices = notices ?? MOCK_NOTICES;
  const [visibleCount, setVisibleCount] = useState(
    Math.min(6, sourceNotices.length),
  );
  useEffect(() => {
    setVisibleCount(Math.min(6, sourceNotices.length));
  }, [sourceNotices.length]);
  const containerRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef<HTMLDivElement>(null);

  const groupedEntries = useMemo(() => {
    const grouped = sourceNotices.reduce(
      (acc, notice) => {
        if (!acc[notice.year]) {
          acc[notice.year] = [];
        }
        acc[notice.year].push(notice);
        return acc;
      },
      {} as Record<number, Notice[]>,
    );

    return Object.entries(grouped).sort(([a], [b]) => Number(b) - Number(a));
  }, [sourceNotices]);

  useEffect(() => {
    if (!loadingRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleCount((prev) => Math.min(prev + 8, sourceNotices.length));
          }
        });
      },
      {
        root: containerRef.current,
        threshold: 0.25,
      },
    );

    observer.observe(loadingRef.current);
    return () => observer.disconnect();
  }, [sourceNotices.length]);

  const handleNoticeClick = (id: string) => {
    console.log('open notice', id);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  let rendered = 0;

  return (
    <Card className="flex h-[320px] flex-col rounded-2xl border shadow-sm overflow-hidden">
      <CardContent className="flex flex-1 flex-col p-6 pb-4 overflow-hidden">
        <h3 className="text-[15px] font-semibold text-[#111827] mb-4">공시</h3>
        <div
          ref={containerRef}
          className="notice-scroll flex-1 min-h-0 overflow-y-auto pr-2 space-y-4"
        >
          {sourceNotices.length === 0 ? (
            <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50/50 text-sm text-gray-500">
              데이터가 없습니다.
            </div>
          ) : (
            <>
              {groupedEntries.map(([year, notices]) => {
                const items = notices.slice(
                  0,
                  Math.max(0, visibleCount - rendered),
                );
                rendered += items.length;
                if (items.length === 0) return null;

                return (
                  <div key={year}>
                    <h4 className="text-sm font-bold text-gray-900 mb-2">
                      {year}년
                    </h4>
                    <div className="space-y-2">
                      {items.map((notice) => (
                        <Link
                          key={notice.id}
                          href={notice.url ?? '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex w-full items-start justify-between gap-4 rounded-lg p-3 text-left transition-colors hover:bg-gray-50 group"
                          onClick={() => handleNoticeClick(notice.id)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="text-xs text-gray-500 whitespace-nowrap pt-0.5 min-w-[60px]">
                              {formatDate(notice.date)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-sm text-gray-900 mb-0.5 line-clamp-2">
                                {notice.title}
                              </div>
                              {notice.subtitle && (
                                <div className="text-xs text-gray-500">
                                  {notice.subtitle}
                                </div>
                              )}
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5 group-hover:text-gray-600 transition-colors" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
              <div
                ref={loadingRef}
                className="py-4 text-center text-xs text-gray-400"
              >
                {visibleCount >= sourceNotices.length ? '' : '불러오는 중...'}
              </div>
            </>
          )}
        </div>
      </CardContent>
      <style jsx>{`
        .notice-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(148, 163, 184, 0.6) transparent;
        }
        .notice-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .notice-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .notice-scroll::-webkit-scrollbar-thumb {
          background-color: rgba(148, 163, 184, 0.6);
          border-radius: 9999px;
        }
      `}</style>
    </Card>
  );
}
