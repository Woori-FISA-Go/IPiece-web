"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"

import type { OfferingItem } from "@/lib/tmp-mock-offering"

interface OfferingCardProps {
  item: OfferingItem
  onLikeToggle: (id: string) => void
}

export function OfferingCard({ item, onLikeToggle }: OfferingCardProps) {
  const [liked, setLiked] = useState(item.liked)

  const handleLike = () => {
    setLiked((prev) => !prev)
    onLikeToggle(item.id)
  }

  return (
    <article className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="relative mb-3 aspect-[4/3] w-full overflow-hidden rounded-lg bg-gray-100">
        {item.thumbnail ? (
          <Image src={item.thumbnail} alt={item.title} fill className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-500">썸네일</div>
        )}
        <button
          type="button"
          onClick={handleLike}
          className="absolute right-2 top-2 rounded-full bg-white/80 p-2 text-sm shadow hover:bg-white"
          aria-label={liked ? '찜 취소' : '찜하기'}
        >
          {liked ? "♥" : "♡"}
        </button>
      </div>

      <div className="mb-2 flex items-center gap-2 text-xs text-gray-500">
        <span className="rounded-full bg-gray-100 px-2 py-1 text-[11px] font-medium text-gray-700">{item.statusLabel}</span>
        <span>{item.timeline}</span>
      </div>

      <Link href={`/offering/${item.id}`} className="block">
        <h3 className="mb-1 text-base font-semibold text-gray-900">{item.title}</h3>
        <p className="text-sm text-gray-500">{item.subtitle}</p>
      </Link>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm text-gray-500">공모가</span>
        <span className="text-base font-semibold text-gray-900">{item.priceKRW.toLocaleString()}원</span>
      </div>
    </article>
  )
}
