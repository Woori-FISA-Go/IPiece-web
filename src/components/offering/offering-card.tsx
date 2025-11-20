"use client";

import { useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { CardImage } from "@/components/common/card-image";
import { CardContent } from "@/components/common/card-content";
import type { OfferingItem } from "@/lib/mock-offering";
import { Card } from "@/components/ui/card";

interface OfferingCardProps {
  item: OfferingItem;
  onLikeToggle?: (id: string, nextLiked: boolean) => Promise<boolean>;
  onNavigate?: (id: string) => void;
  isNavigating?: boolean;
}

export function OfferingCard({ item, onLikeToggle, onNavigate, isNavigating }: OfferingCardProps) {
  const [liked, setLiked] = useState(Boolean(item.liked));
  const [isProcessingFavorite, setIsProcessingFavorite] = useState(false);
  const router = useRouter();
  const productId = item.id?.trim() || "dino-tang";

  const handleLikeClick = async () => {
    if (!onLikeToggle || isProcessingFavorite) return;
    setIsProcessingFavorite(true);
    const nextLiked = !liked;
    const success = await onLikeToggle(item.id, nextLiked);
    if (success) {
      setLiked(nextLiked);
    }
    setIsProcessingFavorite(false);
  };

  const handleNavigate = () => {
    if (isNavigating) return;
    if (onNavigate) {
      onNavigate(productId);
      return;
    }
    router.push(`/offering/${productId}`);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleNavigate();
    }
  };

  const renderStatusBadge = () => {
    if (item.status === "UPCOMING") {
      return (
        <div
          className="rounded-full px-2.5 py-0.5 text-xs font-medium"
          style={{
            backgroundColor: "rgba(184, 217, 255, 0.48)",
            color: "#3386E5",
          }}
        >
          시작 전
        </div>
      );
    }

    if (item.status === "ONGOING" && typeof item.progressPct === "number") {
      return (
        <div className="relative w-14 h-14">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 56 56">
            <circle
              cx="28"
              cy="28"
              r="24"
              fill="none"
              stroke="rgba(184, 217, 255, 0.30)"
              strokeWidth="4"
            />
            <circle
              cx="28"
              cy="28"
              r="24"
              fill="none"
              stroke="#1A4DE5"
              strokeWidth="4"
              strokeDasharray={`${(item.progressPct / 100) * (2 * Math.PI * 24)} ${2 * Math.PI * 24}`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-semibold text-[#525252]">{item.progressPct}%</span>
          </div>
        </div>
      );
    }

    if (item.status === "ENDED") {
      return (
        <div
          className="rounded-full px-2.5 py-0.5 text-xs font-medium"
          style={{
            backgroundColor: "rgba(41, 41, 58, 0.23)",
            color: "#5A5A5A",
          }}
        >
          종료
        </div>
      );
    }
    return null;
  };

  return (
    <Card
      role="button"
      tabIndex={0}
      aria-label={`${item.title} - ${item.author}`}
      onClick={handleNavigate}
      onKeyDown={handleKeyDown}
      className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A4DE5]"
    >
      <CardImage
        imageUrl={item.imageUrl}
        title={item.title}
        liked={liked}
        onLikeToggle={handleLikeClick}
        status={item.status}
      />
      {isNavigating ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-sm">
          이동 중...
        </div>
      ) : null}
      <CardContent title={item.title} author={item.author} price={item.priceKRW} statusBadge={renderStatusBadge()} />
    </Card>
  );
}
