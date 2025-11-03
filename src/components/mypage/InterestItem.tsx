"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { TableCell, TableRow } from "@/components/ui/table"
import { Heart } from "lucide-react"
import type { InterestProduct } from "@/app/(pages)/mypage/InterestList"

interface InterestItemProps {
  product: InterestProduct
  isFavorite: boolean
  onToggleFavorite: (productId: string) => void
}

export default function InterestItem({ product, isFavorite, onToggleFavorite }: InterestItemProps) {
  return (
    <TableRow className="hover:bg-gray-50">
      {/* IP Info with Avatar and Name */}
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="w-16 h-16 rounded-lg">
            <AvatarImage src={typeof product.imageUrl === 'string' ? product.imageUrl : product.imageUrl.src} alt={product.name} />
            <AvatarFallback className="rounded-lg bg-gray-200">{product.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="font-medium text-gray-900">{product.name}</span>
        </div>
      </TableCell>

      {/* Category */}
      <TableCell className="text-center text-gray-700">{product.category}</TableCell>

      {/* Current Price */}
      <TableCell className="text-center">
        <div className="flex flex-col items-center">
          <div className="font-medium text-gray-900">
            {product.currentPrice} <span className="text-xs text-gray-500">KRW</span>
          </div>
          {product.priceChange !== undefined && (
            <div
              className={`text-xs ${
                product.priceChange > 0
                  ? "text-[#E53333]"
                  : product.priceChange < 0
                    ? "text-[#3386E5]"
                    : "text-gray-500"
              }`}
            >
              {product.priceChange > 0 ? "+" : ""}
              {product.priceChange.toFixed(2)}%
            </div>
          )}
        </div>
      </TableCell>

      {/* Favorite Button */}
      <TableCell className="text-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onToggleFavorite(product.id)}
          className="hover:bg-transparent"
          aria-label={isFavorite ? "관심 해제" : "관심 추가"}
        >
          <Heart className={`w-6 h-6 ${isFavorite ? "fill-[#F9595F] text-[#F9595F]" : "text-gray-300"}`} />
        </Button>
      </TableCell>
    </TableRow>
  )
}
