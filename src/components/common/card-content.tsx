import { isValidElement, type ReactNode } from 'react';

interface CardContentProps {
  title: string;
  author: string;
  price: number;
  badgeContent?: ReactNode;
  badgeType?: 'positive' | 'negative';
  statusBadge?: ReactNode;
}

export function CardContent({
  title,
  author,
  price,
  badgeContent,
  badgeType,
  statusBadge,
}: CardContentProps) {
  let badgeClassName = '';
  if (badgeContent === undefined && isValidElement(statusBadge)) {
    const className = (statusBadge.props as { className?: string })?.className;
    if (typeof className === 'string') {
      badgeClassName = className;
    }
  }

  const isProgressBadge = badgeClassName.includes('relative');

  return (
    <div className="px-4 pt-4 pb-3">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="space-y-1.5">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold truncate">{title}</h3>
              <p className="text-xs text-muted-foreground truncate">
                by {author}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/coin_icon-hJAamFpVYZU2EFUDdi4kaW6e5DnZnX.png"
                alt="코인"
                className="h-4 w-4"
              />
              <span className="text-sm font-semibold">
                {price.toLocaleString('ko-KR')}원
              </span>
            </div>
          </div>
        </div>

        {(badgeContent || statusBadge) && (
          <div
            className={`flex shrink-0 items-center ${
              isProgressBadge ? '' : 'self-start'
            }`}
          >
            {badgeContent ? (
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${
                  badgeType === 'positive'
                    ? 'bg-[#FFB8B8]/48 text-[#E53333]'
                    : badgeType === 'negative'
                      ? 'bg-[#B8D9FF]/48 text-[#3386E5]'
                      : ''
                }`}
              >
                {badgeContent}
              </span>
            ) : (
              statusBadge
            )}
          </div>
        )}
      </div>
    </div>
  );
}
