"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Info } from "lucide-react"
import AssetTableRow from "./AssetTableRow"
import dinosaurRobot from "@/assets/images/dinosaur-robot-character.jpg"
import { StaticImageData } from "next/image"
import Image from "next/image"
import myHomeEmptyState from "@/assets/images/my-home-empty-state.png"

interface AssetTableProps {
  hasAssets?: boolean
}

const mockAssets = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  name: "다이노봇",
  nameEn: "Dino Takana",
  thumbnail: dinosaurRobot,
  quantity: 14,
  quantityUnit: "Dino Takana",
  avgPrice: 100,
  purchaseAmount: 12500,
  evaluationAmount: 12500,
  profitLoss: i % 3 === 0 ? 45.2 : -45.2,
  profitLossAmount: i % 3 === 0 ? 45.2 : -45.2,
}))

export default function AssetTable({ hasAssets = true }: AssetTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const totalPages = Math.ceil(mockAssets.length / itemsPerPage)

  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentAssets = mockAssets.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-medium text-gray-900">보유자산 목록</CardTitle>
          <Info className="w-4 h-4 text-gray-400" />
        </div>
      </CardHeader>
      <CardContent>
        {hasAssets ? (
          <>
            <Table className="table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[30%] text-gray-600">보유자산</TableHead>
                  <TableHead className="w-[14%] text-gray-600 text-center">보유수량</TableHead>
                  <TableHead className="w-[14%] text-gray-600 text-right">매수평균가</TableHead>
                  <TableHead className="w-[14%] text-gray-600 text-right">매수금액</TableHead>
                  <TableHead className="w-[14%] text-gray-600 text-right">평가금액</TableHead>
                  <TableHead className="w-[14%] text-gray-600 text-right">평가손익(%)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentAssets.map((asset) => (
                  <AssetTableRow key={asset.id} asset={asset} />
                ))}
              </TableBody>
            </Table>

            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-8 w-8"
                aria-label="이전 페이지"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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
                    onClick={() => goToPage(pageNum)}
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
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-8 w-8"
                aria-label="다음 페이지"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="text-center mb-8">
              <p className="text-base text-gray-900 mb-1">보유한 캐릭터 IP가 없습니다.</p>
              <p className="text-base text-gray-600"><b>새로운 캐릭터 IP</b>를 구매해보세요.</p>
            </div>

            <div className="mb-8">
              <Image src={myHomeEmptyState} alt="Empty state" width={120} height={120} />
            </div>

            <Button className="bg-[#3386E5] hover:bg-[#2868B5] text-white w-[197px] h-[45px] rounded-md">첫 거래하러 가기</Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}