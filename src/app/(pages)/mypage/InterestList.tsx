"use client"

import { useEffect, useMemo, useState } from "react"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import InterestItem from "@/components/mypage/InterestItem"
import InterestListEmpty from "./InterestListEmpty"
import type { StaticImageData } from "next/image"
import { apiFetch } from "@/lib/api-client"

export interface InterestProduct {
  id: string
  name: string
  category: string
  currentPrice: number
  priceChange?: number
  imageUrl: string | StaticImageData
  isFavorite?: boolean
}

type ApiFavoriteItem = {
  product_id: number
  product_name: string
  status?: string
  thumbnail?: string
  current_price?: number
  price_change_rate?: number
  is_favorite?: boolean
}

const PAGE_SIZE = 5

export default function InterestList() {
  const [items, setItems] = useState<InterestProduct[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)

  useEffect(() => {
    const fetchFavorites = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const res = await apiFetch("/v1/mypage/favorites")
        if (!res.ok) {
          let message: string | undefined
          try {
            const body = (await res.json()) as { detail?: string; message?: string }
            message = body.detail || body.message
          } catch {
            /* ignore */
          }
          throw new Error(message || "관심 목록을 불러오지 못했습니다.")
        }
        const data = (await res.json()) as { total_count?: number; items?: ApiFavoriteItem[] }
        const mapped = (data.items ?? []).map(mapFavoriteItem)
        setItems(mapped)
        setTotalCount(data.total_count ?? mapped.length)
        setFavorites(new Set(mapped.filter((item) => item.isFavorite).map((item) => item.id)))
      } catch (err) {
        setError(err instanceof Error ? err.message : "관심 목록을 불러오지 못했습니다.")
        setItems([])
        setTotalCount(0)
      } finally {
        setIsLoading(false)
      }
    }
    fetchFavorites()
  }, [])

  const totalPages = Math.max(1, Math.ceil((totalCount || 0) / PAGE_SIZE))
  const pagedProducts = useMemo(() => {
    if (!items.length) return []
    const start = (currentPage - 1) * PAGE_SIZE
    return items.slice(start, start + PAGE_SIZE)
  }, [items, currentPage])

  const handleToggleFavorite = async (productId: string) => {
    if (!productId || removingId === productId) return
    setActionError(null)
    setRemovingId(productId)
    const numericId = Number(productId)
    try {
      const res = await apiFetch(`/v1/products/${Number.isNaN(numericId) ? productId : numericId}/favorite`, {
        method: "DELETE",
      })
      if (!res.ok) {
        let message: string | undefined
        try {
          const body = (await res.json()) as { detail?: string; message?: string }
          message = body.detail || body.message
        } catch {
          /* ignore */
        }
        throw new Error(message || "관심 상품 해제에 실패했습니다.")
      }
      setItems((prev) => {
        const updated = prev.filter((item) => item.id !== productId)
        const removedCount = prev.length - updated.length
        if (removedCount > 0) {
          setTotalCount((prevTotal) => {
            const nextTotal = Math.max(0, prevTotal - removedCount)
            const nextPageMax = Math.max(1, Math.ceil(Math.max(nextTotal, 1) / PAGE_SIZE))
            setCurrentPage((prevPage) => Math.min(prevPage, nextPageMax))
            return nextTotal
          })
        }
        return updated
      })
      setFavorites((prev) => {
        const next = new Set(prev)
        next.delete(productId)
        return next
      })
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "관심 상품 해제에 실패했습니다.")
    } finally {
      setRemovingId(null)
    }
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  if (isLoading) {
    return <div className="py-12 text-center text-sm text-gray-500">관심 목록을 불러오는 중입니다.</div>
  }

  if (error) {
    return (
      <div className="py-12 text-center text-sm text-red-500">
        {error}
      </div>
    )
  }

  if (!items.length) {
    return <InterestListEmpty />
  }

  return (
    <div className="space-y-6">
      <div className="text-sm text-gray-600">총 {totalCount}개</div>
      {actionError ? <p className="text-sm text-red-500">{actionError}</p> : null}
      <div className="rounded-lg border border-gray-200">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-[40%] font-medium text-gray-700">IP 정보</TableHead>
              <TableHead className="w-[20%] text-center font-medium text-gray-700">상품 분류</TableHead>
              <TableHead className="w-[25%] text-center font-medium text-gray-700">현재가</TableHead>
              <TableHead className="w-[15%] text-center font-medium text-gray-700">관심</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagedProducts.map((product) => (
              <InterestItem
                key={product.id}
                product={product}
                isFavorite={favorites.has(product.id)}
                onToggleFavorite={handleToggleFavorite}
                disabled={removingId === product.id}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-6 flex items-center justify-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-8 w-8"
          aria-label="이전 페이지"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
          let pageNum
          if (totalPages <= 5) {
            pageNum = i + 1
          } else if (currentPage <= 3) {
            pageNum = i + 1
          } else if (currentPage >= totalPages - 2) {
            pageNum = totalPages - 4 + i
          } else {
            pageNum = currentPage - 2 + i
          }

          return (
            <Button
              key={pageNum}
              variant={currentPage === pageNum ? "default" : "ghost"}
              size="icon"
              onClick={() => handlePageChange(pageNum)}
              className={`h-8 w-8 ${currentPage === pageNum ? "bg-black text-white hover:bg-black/90" : "hover:bg-gray-100"}`}
              aria-current={currentPage === pageNum ? "page" : undefined}
            >
              {pageNum}
            </Button>
          )
        })}

        <Button
          variant="ghost"
          size="icon"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-8 w-8"
          aria-label="다음 페이지"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

function mapFavoriteItem(data: ApiFavoriteItem): InterestProduct {
  const fallbackId = `favorite-${Math.random().toString(36).slice(2, 11)}`
  return {
    id: data.product_id?.toString() ?? fallbackId,
    name: data.product_name ?? "알 수 없는 상품",
    category: data.status ?? "-",
    currentPrice: data.current_price ?? 0,
    priceChange: typeof data.price_change_rate === "number" ? data.price_change_rate : undefined,
    imageUrl: data.thumbnail || "",
    isFavorite: Boolean(data.is_favorite),
  }
}
