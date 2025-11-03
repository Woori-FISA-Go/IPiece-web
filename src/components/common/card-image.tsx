'use client';

import { buildHeartMaskStyle } from '@/components/common/heart-mask-style';

const DEFAULT_CARD_IMAGE =
  'https://cafe24img.poxo.com/dinotaeng/web/product/medium/202402/1a99099cfbb60588334407718ab59b7c.png';

interface CardImageProps {
  imageUrl?: string;
  title: string;
  liked: boolean;
  onLikeToggle: () => void;
  status?: 'UPCOMING' | 'ONGOING' | 'ENDED';
}

export function CardImage({
  imageUrl,
  title,
  liked,
  onLikeToggle,
  status,
}: CardImageProps) {
  return (
    <div className="relative aspect-square bg-muted">
      <img
        src={
          !imageUrl || imageUrl.includes('placeholder.svg')
            ? DEFAULT_CARD_IMAGE
            : imageUrl
        }
        alt={title}
        className="w-full h-full object-cover"
      />
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onLikeToggle();
        }}
        className="absolute top-3 right-3 p-0 bg-transparent transition-transform hover:scale-110"
        aria-label={liked ? '좋아요 취소' : '좋아요'}
        aria-pressed={liked}
      >
        <span
          aria-hidden="true"
          className="transition-opacity"
          style={buildHeartMaskStyle(
            liked ? '#F9595F' : '#29293A',
            liked ? 1 : 0.23,
          )}
        />
      </button>

      {status === 'ENDED' && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-5">
          <span className="text-white text-lg font-semibold">마감</span>
        </div>
      )}
    </div>
  );
}
