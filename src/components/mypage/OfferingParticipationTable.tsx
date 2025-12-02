"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import offeringEmpty from "@/assets/images/interest_empty_icon.svg"
import type { OfferingParticipationItem } from "./types"

interface OfferingParticipationTableProps {
  items: OfferingParticipationItem[]
  totalCount: number
  currentPage: number
  pageSize: number
  onPageChange?: (page: number) => void
  isLoading?: boolean
  hasNext?: boolean
  nextPage?: number
}

const currencyFormatter = new Intl.NumberFormat("ko-KR")
const dateFormatter = new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" })

function formatCurrency(value?: number) {
  if (typeof value !== "number") return "-"
  return `${currencyFormatter.format(value)} KRW`
}

function formatDate(value?: string) {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  return dateFormatter.format(date)
}

export default function OfferingParticipationTable({
  items,
  totalCount,
  currentPage,
  pageSize,
  onPageChange,
  isLoading,
  hasNext,
  nextPage,
}: OfferingParticipationTableProps) {
  const safePageSize = pageSize || 1
  const totalPages = Math.max(1, Math.ceil((totalCount || 0) / safePageSize))
  const nextCursorPage = typeof nextPage === "number" ? nextPage : null
  const canGoNext =
    hasNext === true ? nextCursorPage !== null : hasNext === false ? false : currentPage < totalPages
  const hasItems = items.length > 0

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return
    onPageChange?.(page)
  }

  const handleNextPage = () => {
    if (!canGoNext) return
    if (hasNext === true) {
      if (nextCursorPage === null) return
      onPageChange?.(nextCursorPage)
      return
    }
    const next = Math.min(currentPage + 1, totalPages)
    if (next !== currentPage) {
      onPageChange?.(next)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold text-gray-900">공모 참여 목록</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && !hasItems ? (
          <div className="flex h-48 items-center justify-center text-gray-400">불러오는 중...</div>
        ) : hasItems ? (
          <>
            <Table className="table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[12%] text-gray-600">참여자산</TableHead>
                  <TableHead className="w-[12%] text-center text-gray-600">참여수량</TableHead>
                  <TableHead className="w-[13%] text-right text-gray-600">공모가</TableHead>
                  <TableHead className="w-[15%] text-right text-gray-600">총 구매가</TableHead>
                  <TableHead className="w-[12%] text-right text-gray-600">진행률</TableHead>
                  <TableHead className="w-[18%] text-right text-gray-600">공모 시작일</TableHead>
                  <TableHead className="w-[18%] text-center text-gray-600">공모 종료일</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => {
                  return (
                    <TableRow key={`${item.productId}-${item.tokenName}`}>
                      <TableCell className="w-[12%]">
                        <a href={`/offering/${item.productId}`} className="flex items-center gap-3" onClick={(event) => event.stopPropagation()}>
                          <div className="h-10 w-10 overflow-hidden rounded-lg bg-gray-100">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={item.thumbnailImg || "/placeholder.svg"} alt={item.productName} className="h-full w-full object-cover" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 hover:underline">{item.productName}</div>
                            <div className="text-xs text-gray-500">{item.tokenName}</div>
                          </div>
                        </a>
                      </TableCell>
                      <TableCell className="w-[12%] text-center">
                        <div className="font-medium text-gray-900">{item.quantity.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">{item.tokenName || "토큰"}</div>
                      </TableCell>
                      <TableCell className="w-[13%] text-right">
                        <div className="font-medium text-gray-900">{formatCurrency(item.offeringPrice)}</div>
                      </TableCell>
                      <TableCell className="w-[16%] text-right">
                        <div className="font-medium text-gray-900">{formatCurrency(item.buyPrice)}</div>
                      </TableCell>
                      <TableCell className="w-[12.57%] text-right font-medium text-gray-900">
                        {item.progressRate.toFixed(0)}%
                      </TableCell>
                      <TableCell className="w-[18%] text-right text-gray-900">{formatDate(item.offeringStartDate)}</TableCell>
                      <TableCell className="w-[18%] text-center text-gray-900">{formatDate(item.offeringEndDate)}</TableCell>
                    </TableRow>
                  )
                })}
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
                onClick={handleNextPage}
                disabled={!canGoNext}
                className="h-8 w-8"
                aria-label="다음 페이지"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 py-16 text-center text-gray-500">
            <Image src={offeringEmpty} alt="공모 참여 없음" width={80} height={80} />
            <div>
              <p className="text-base text-gray-900">참여 중인 공모가 없습니다.</p>
              <p className="text-sm text-gray-600">캐릭터 IP 공모에 참여해보세요.</p>
            </div>
            <Button asChild className="h-11 rounded-lg bg-[#3386E5] px-6 text-white hover:bg-[#2a75d0]">
              <Link href="/offering">공모 참여하러 가기</Link>
            </Button>
          </div>
        )}
     </CardContent>
   </Card>
 )
}
