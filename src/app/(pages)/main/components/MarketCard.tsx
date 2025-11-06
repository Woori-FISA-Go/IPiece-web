"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import type { Item } from "../constants/data"
import { StatusPill } from "./StatusPill"
import iconCoin from "../assets/icon_coin.png"
import iconHeartDefault from "../assets/icon_heart.svg"
import iconHeartActive from "../assets/icon_heart_active.svg"

interface MarketCardProps {
  item: Item
}

export function MarketCard({ item }: MarketCardProps) {
  const [liked, setLiked] = useState(item.liked || false)

  return (
    <div className="group">
      <Link href={`/product/${item.id}`} className="block">
        <div className="relative aspect-[4/3] lg:aspect-[5/4] bg-gray-100 rounded-lg mb-3 overflow-hidden">
          {item.imageUrl ? (
            <Image src={item.imageUrl || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-900 text-lg">image</div>
          )}
          <button
            onClick={(e) => {
              e.preventDefault()
              setLiked((prev) => !prev)
            }}
            type="button"
            className="absolute top-2 right-2 z-10 p-0 bg-transparent border-0 appearance-none cursor-pointer"
            aria-label={liked ? '\uCC2C \uCDE8\uC18C' : '\uCC2C\uD558\uAE30'}
          >
            <Image src={liked ? iconHeartActive : iconHeartDefault} alt="" width={24} height={24} />
          </button>
        </div>
      </Link>
      <div className="flex items-start justify-between mb-1">
        <Link href={`/product/${item.id}`}>
          <h3 className="font-semibold text-base text-gray-900 hover:text-[#3386E5] transition-colors">{item.title}</h3>
        </Link>
        <StatusPill status={item.status} />
      </div>
      <div className="flex items-center gap-1">
        <Image src={iconCoin} alt="" width={16} height={16} />
        <span className="text-sm font-semibold text-gray-900">{item.priceKRW}{'\uC6D0'}</span>
      </div>
    </div>
  )
}


