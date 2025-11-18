"use client"

import { useState, type MouseEvent } from "react"
import Image from "next/image"
import Link from "next/link"

import type { OfferingItem } from "@/lib/tmp-mock-offering"

interface OfferingCardProps {
  item: OfferingItem
  onLikeToggle: (id: string) => void
}

export function OfferingCard({ item, onLikeToggle }: OfferingCardProps) {
  const [liked, setLiked] = useState(item.liked)
  const productId = item.id?.trim() || "dino-tang"
  const detailHref = `/offering/${productId}`

  const handleLike = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setLiked((prev) => !prev)
    onLikeToggle(item.id)
  }

  return (
    <Link
      href={detailHref}
      className="block rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3386E5]"
    >
      <article>
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
            aria-label={liked ? "좋아요 취소" : "좋아요"}
          >
            {liked ? "♥" : "♡"}
          </button>
        </div>

        <div className="mb-2 flex items-center gap-2 text-xs text-gray-500">
          <span className="rounded-full bg-gray-100 px-2 py-1 text-[11px] font-medium text-gray-700">{item.statusLabel}</span>
          <span>{item.timeline}</span>
        </div>

        <h3 className="mb-1 text-base font-semibold text-gray-900">{item.title}</h3>
        <p className="text-sm text-gray-500">{item.subtitle}</p>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-gray-500">최소 금액</span>
          <span className="text-base font-semibold text-gray-900">{item.priceKRW.toLocaleString()}원</span>
        </div>
      </article>
    </Link>
  )
}