'use client';

import { Card, CardContent } from '@/app/(pages)/TradingPage/components/card';
import HeartIcon from '@/assets/heart_icon.svg';
import type { IPOItem } from '@/lib/sample-data';

interface IPCardProps {
  item: IPOItem;
  onLikeToggle: (id: string) => void;
}

export function IPCard({ item, onLikeToggle }: IPCardProps) {
  const isPositive = item.changePct >= 0;
  const changeText = isPositive ? `+${item.changePct}%` : `${item.changePct}%`;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 rounded-2xl">
      <CardContent className="p-0">
        <div className="relative aspect-square bg-muted">
          <img
            src={item.imageUrl || '/placeholder.svg?height=300&width=300'}
            alt={item.title}
            className="w-full h-full object-cover"
          />
          <button
            onClick={() => onLikeToggle(item.id)}
            className="absolute top-3 right-3 p-0 bg-transparent transition-transform hover:scale-110"
            aria-label={item.liked ? '좋아요 취소' : '좋아요'}
            aria-pressed={item.liked}
            type="button"
          >
            <span
              aria-hidden="true"
              className="inline-block h-6 w-6"
              style={{
                maskImage: `url(${HeartIcon.src})`,
                WebkitMaskImage: `url(${HeartIcon.src})`,
                maskSize: 'contain',
                WebkitMaskSize: 'contain',
                maskRepeat: 'no-repeat',
                WebkitMaskRepeat: 'no-repeat',
                maskPosition: 'center',
                WebkitMaskPosition: 'center',
                backgroundColor: item.liked ? '#F9595F' : '#29293A',
                opacity: item.liked ? 1 : 0.23,
              }}
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
