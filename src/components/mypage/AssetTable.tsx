"use client"

import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import myHomeEmptyState from "@/assets/images/my_home_empty_state_icon.svg"
import AssetTableRow from "./AssetTableRow"
import type { AssetListItem } from "./types"

interface AssetTableProps {
  assets: AssetListItem[]
  totalCount: number
  currentPage: number
  pageSize: number
  onPageChange?: (page: number) => void
  isLoading?: boolean
}

export default function AssetTable({
  assets,
  totalCount,
  currentPage,
  pageSize,
  onPageChange,
  isLoading,
}: AssetTableProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / (pageSize || 1)))
  const hasAssets = assets.length > 0

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return
    onPageChange?.(page)
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold text-gray-900">보유자산 목록</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && !hasAssets ? (
          <div className="flex h-48 items-center justify-center text-gray-400">불러오는 중...</div>
        ) : hasAssets ? (
          <>
            <Table className="table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/6 text-gray-600">보유자산</TableHead>
                  <TableHead className="w-1/6 text-center text-gray-600">보유수량</TableHead>
                  <TableHead className="w-1/6 text-right text-gray-600">매수평균가</TableHead>
                  <TableHead className="w-1/6 text-right text-gray-600">매수금액</TableHead>
                  <TableHead className="w-1/6 text-right text-gray-600">평가금액</TableHead>
                  <TableHead className="w-1/6 text-right text-gray-600">평가손익(%)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assets.map((asset) => (
                  <AssetTableRow key={`${asset.productId}-${asset.tokenName}`} asset={asset} />
                ))}
              </TableBody>
            </Table>

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

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNumber
                if (totalPages <= 5) {
                  pageNumber = i + 1
                } else if (currentPage <= 3) {
                  pageNumber = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i
                } else {
                  pageNumber = currentPage - 2 + i
                }
                return (
                  <Button
                    key={pageNumber}
                    variant={currentPage === pageNumber ? "default" : "ghost"}
                    size="icon"
                    onClick={() => handlePageChange(pageNumber)}
                    className={`h-8 w-8 ${
                      currentPage === pageNumber ? "bg-black text-white hover:bg-black/90" : "hover:bg-gray-100"
                    }`}
                    aria-current={currentPage === pageNumber ? "page" : undefined}
                  >
                    {pageNumber}
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
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="mb-8 text-center">
              <p className="mb-1 text-base text-gray-900">보유 중인 캐릭터 IP가 없습니다.</p>
              <p className="text-base text-gray-600">
                <b>주요 캐릭터 IP</b>를 구매해보세요.
              </p>
            </div>
            <div className="mb-8">
              <Image src={myHomeEmptyState} alt="Empty state" width={120} height={120} />
            </div>
            <Button asChild className="h-[45px] w-[197px] rounded-md bg-[#3386E5] text-white hover:bg-[#2868B5]">
              <Link href="/trading">IP 거래하러 가기</Link>
            </Button>
         </div>
        )}
      </CardContent>
    </Card>
  )
}
