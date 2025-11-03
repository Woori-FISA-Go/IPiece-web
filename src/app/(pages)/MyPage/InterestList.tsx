"use client"

import { useState } from "react"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import InterestItem from "@/components/mypage/InterestItem"
import InterestListEmpty from "./InterestListEmpty"
import dinosaurRobot from "@/assets/images/dinosaur-robot-character.jpg"
import greenDinosaur from "@/assets/images/green-dinosaur-character.jpg"
import cuteAnimal from "@/assets/images/cute-animal-characters.jpg"
import grayPlaceholder from "@/assets/images/gray-placeholder.png"
import { StaticImageData } from "next/image"

// Mock data type
export interface InterestProduct {
  id: string
  name: string
  category: string
  currentPrice: number
  priceChange?: number
  imageUrl: string | StaticImageData
}

// Mock data
const mockProducts: InterestProduct[] = [
  {
    id: "1",
    name: "다이노봇",
    category: "2차 거래",
    currentPrice: 100,
    priceChange: -0.45,
    imageUrl: dinosaurRobot,
  },
  {
    id: "2",
    name: "초구만",
    category: "공모",
    currentPrice: 120,
    imageUrl: greenDinosaur,
  },
  {
    id: "3",
    name: "미니니",
    category: "2차 거래",
    currentPrice: 100,
    priceChange: 0.45,
    imageUrl: cuteAnimal,
  },
  {
    id: "4",
    name: "다이노봇",
    category: "2차 거래",
    currentPrice: 100,
    priceChange: 0.45,
    imageUrl: grayPlaceholder,
  },
  {
    id: "5",
    name: "다이노봇",
    category: "공모",
    currentPrice: 100,
    imageUrl: grayPlaceholder,
  },
  {
    id: "6",
    name: "다이노봇",
    category: "2차 거래",
    currentPrice: 100,
    priceChange: -0.45,
    imageUrl: dinosaurRobot,
  },
  {
    id: "7",
    name: "초구만",
    category: "공모",
    currentPrice: 120,
    imageUrl: greenDinosaur,
  },
  {
    id: "8",
    name: "미니니",
    category: "2차 거래",
    currentPrice: 100,
    priceChange: 0.45,
    imageUrl: cuteAnimal,
  },
  {
    id: "9",
    name: "다이노봇",
    category: "2차 거래",
    currentPrice: 100,
    priceChange: 0.45,
    imageUrl: grayPlaceholder,
  },
  {
    id: "10",
    name: "다이노봇",
    category: "공모",
    currentPrice: 100,
    imageUrl: grayPlaceholder,
  },
  {
    id: "11",
    name: "다이노봇",
    category: "2차 거래",
    currentPrice: 100,
    priceChange: -0.45,
    imageUrl: dinosaurRobot,
  },
  {
    id: "12",
    name: "초구만",
    category: "공모",
    currentPrice: 120,
    imageUrl: greenDinosaur,
  },
  {
    id: "13",
    name: "미니니",
    category: "2차 거래",
    currentPrice: 100,
    priceChange: 0.45,
    imageUrl: cuteAnimal,
  },
  {
    id: "14",
    name: "다이노봇",
    category: "2차 거래",
    currentPrice: 100,
    priceChange: 0.45,
    imageUrl: grayPlaceholder,
  },
  {
    id: "15",
    name: "다이노봇",
    category: "공모",
    currentPrice: 100,
    imageUrl: grayPlaceholder,
  },
]

interface InterestListProps {
  products?: InterestProduct[]
  itemsPerPage?: number
}

export default function InterestList({ products = mockProducts, itemsPerPage = 5 }: InterestListProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [favorites, setFavorites] = useState<Set<string>>(new Set(products.map((p) => p.id)))

  // If no products, show empty state
  if (products.length === 0) {
    return <InterestListEmpty />
  }

  const totalPages = Math.ceil(products.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentProducts = products.slice(startIndex, endIndex)

  const handleToggleFavorite = (productId: string) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId)
      } else {
        newFavorites.add(productId)
      }
      return newFavorites
    })
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  return (
    <div className="space-y-6">
      {/* Total count */}
      <div className="text-sm text-gray-600">총 {products.length}개</div>

      {/* Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        {/* [수정] table-fixed 적용 */}
        <Table className="table-fixed">
          <TableHeader>
            <TableRow className="bg-gray-50">
              {/* [수정] 기준이 되는 너비로 설정 (40/20/25/15) */}
              <TableHead className="w-[40%] font-medium text-gray-700">IP 정보</TableHead>
              <TableHead className="w-[20%] text-center font-medium text-gray-700">상품 분류</TableHead>
              <TableHead className="w-[25%] text-center font-medium text-gray-700">현재가</TableHead>
              <TableHead className="w-[15%] text-center font-medium text-gray-700">관심</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentProducts.map((product) => (
              <InterestItem
                key={product.id}
                product={product}
                isFavorite={favorites.has(product.id)}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2 mt-6">
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
              className={`h-8 w-8 ${
                currentPage === pageNum ? "bg-black text-white hover:bg-black/90" : "hover:bg-gray-100"
              }`}
              aria-label={`페이지 ${pageNum}`}
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