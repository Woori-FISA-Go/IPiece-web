'use client';

import Image from 'next/image';
import type { KeyboardEvent, MouseEvent } from 'react';
import { useRouter } from 'next/navigation';

import { Card, CardContent } from '@/app/(pages)/trading/components/card';
import heartIcon from '@/assets/heart_icon.svg';
import type { IPOItem } from '@/lib/sample-data';

interface IPCardProps {
  item: IPOItem;
  onLikeToggle: (id: string) => void;
}

export function IPCard({ item, onLikeToggle }: IPCardProps) {
  const router = useRouter();

  const isPositive = item.changePct >= 0;
  const changeText = isPositive ? `+${item.changePct}%` : `${item.changePct}%`;

  const handleCardNavigation = () => {
    router.push(`/trading/${item.id}`);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleCardNavigation();
    }
  };

  const handleLikeClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onLikeToggle(item.id);
  };

  return (
    <Card
      className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 rounded-2xl cursor-pointer focus:outline-none"
      onClick={handleCardNavigation}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <CardContent className="p-0">
        <div className="relative aspect-square bg-muted">
          <img
            src={item.imageUrl || '/placeholder.svg?height=300&width=300'}
            alt={item.title}
            className="w-full h-full object-cover"
          />
          <button
            onClick={handleLikeClick}
            className="absolute top-3 right-3 p-0 bg-transparent transition-transform hover:scale-110"
            aria-label={item.liked ? '좋아요 취소' : '좋아요'}
            aria-pressed={item.liked}
            type="button"
          >
            <Image
              src={heartIcon}
              alt="좋아요"
              width={24}
              height={24}
              className={`h-6 w-6 transition-opacity ${
                item.liked ? 'opacity-100' : 'opacity-40'
              }`}
              priority={false}
            />
          </button>
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold mb-0.5 truncate">
                {item.title}
              </h3>
              <p className="text-xs text-muted-foreground truncate">
                by {item.author}
              </p>
            </div>

            <span
              className={`ml-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${
                isPositive
                  ? 'bg-[#FFB8B8]/48 text-[#E53333]'
                  : 'bg-[#B8D9FF]/48 text-[#3386E5]'
              }`}
            >
              {changeText}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/coin_icon-hJAamFpVYZU2EFUDdi4kaW6e5DnZnX.png"
              alt="코인"
              className="h-4 w-4"
            />
            <span className="text-sm font-semibold">
              {item.priceKRW.toLocaleString('ko-KR')}원
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
