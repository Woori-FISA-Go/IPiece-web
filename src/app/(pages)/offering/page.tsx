'use client';

import { useState } from 'react';
import { OfferingStatusFilter } from '@/components/offering/offering-status-filter';
import { OfferingCard } from '@/components/offering/offering-card';
import { MOCK_OFFERINGS, type OfferingStatus } from '@/lib/mock-offering';

export default function OfferingPage() {
  const [selectedStatuses, setSelectedStatuses] = useState<OfferingStatus[]>([]);

  const filteredItems =
    selectedStatuses.length === 0
      ? MOCK_OFFERINGS
      : MOCK_OFFERINGS.filter((item) => selectedStatuses.includes(item.status));

  const handleLikeToggle = (id: string) => {
    const item = MOCK_OFFERINGS.find((item) => item.id === id);
    if (item) {
      item.liked = !item.liked;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-1">
        <div className="max-w-[1280px] mx-auto px-6 py-8">
          <div className="grid grid-cols-[200px_1fr] gap-8">
            {/* Left Sidebar - Filter */}
            <aside className="border-r border-gray-200 pr-6">
              <OfferingStatusFilter
                selected={selectedStatuses}
                onChange={setSelectedStatuses}
              />
            </aside>

            {/* Right Content - Cards Grid */}
            <section>
              {/* Count Badge */}
              <div className="mb-6">
                <span className="inline-flex items-center justify-center bg-gray-100 text-gray-900 font-medium px-3 py-1 rounded text-sm">
                  {filteredItems.length}개
                </span>
              </div>

              {filteredItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {filteredItems.map((item) => (
                    <OfferingCard
                      key={item.id}
                      item={item}
                      onLikeToggle={handleLikeToggle}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-400">조건에 맞는 공모가 없습니다.</p>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
