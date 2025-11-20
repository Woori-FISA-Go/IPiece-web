'use client';

import type { KeyboardEvent, MouseEvent } from 'react';
import { useRouter } from 'next/navigation';

import { Card, CardContent } from '@/components/ui/card';
import type { IPOItem } from '@/lib/sample-data';
import { buildHeartMaskStyle } from '@/components/common/heart-mask-style';

const DEFAULT_CARD_IMAGE =
  'https://cafe24img.poxo.com/dinotaeng/web/product/medium/202402/1a99099cfbb60588334407718ab59b7c.png';

interface TradeCardProps {
  item: IPOItem;
  onLikeToggle: (id: string) => void;
}

export function TradeCard({ item, onLikeToggle }: TradeCardProps) {
  const router = useRouter();

  const changePct = Number(item.changePct);
  const formattedChange = changePct.toFixed(1);
  const isZero = changePct === 0;
  const isPositive = changePct > 0;
  const changeText = isZero
    ? '0.0%'
    : isPositive
      ? `+${formattedChange}%`
      : `${formattedChange}%`;

  const badgeClass = isZero
    ? 'bg-gray-100 text-gray-600'
    : isPositive
      ? 'bg-[#FFB8B8]/48 text-[#E53333]'
      : 'bg-[#B8D9FF]/48 text-[#3386E5]';

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
      className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A4DE5]"
      onClick={handleCardNavigation}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <CardContent className="p-0">
        <div className="relative aspect-square bg-muted">
          <img
            src={
              !item.imageUrl || item.imageUrl.includes('placeholder.svg')
                ? DEFAULT_CARD_IMAGE
                : item.imageUrl
            }
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
            <span
              aria-hidden="true"
              className="transition-opacity"
              style={buildHeartMaskStyle(
                item.liked ? '#F9595F' : '#29293A',
                item.liked ? 1 : 0.23,
              )}
            />
          </button>
        </div>

        <div className="p-3">
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
              className={`ml-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${badgeClass}`}
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
