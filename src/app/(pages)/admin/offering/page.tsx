'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { Search, Plus, MoreHorizontal, ArrowRightLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { apiFetch } from '@/lib/api-client'

type OfferingItem = {
  productId: number
  productName: string
  owner: string
  projectName: string
  status?: 'OFFERING' | 'TRADE' | string
  thumbnailImg?: string | null
  progressRate: number
  offeringStartDate?: string
  offeringEndDate?: string
  offeringPrice: number
  offeringAmount: number
}

type OfferingsResponse = {
  items: OfferingItem[]
  hasNext: boolean
  nextCursor?: number | null
  totalCount?: number
  beforeCount?: number
  ingCount?: number
  afterCount?: number
}

type MarketItem = {
  id: number
  product_name: string
  project_name: string
  owner: string
  status: 'active' | 'ended'
  current_price: number
  volume_24h: number
  holders: number
  listed_date: string
}

const INITIAL_MARKET: MarketItem[] = [
  {
    id: 1,
    product_name: '봄날의 햇살',
    project_name: '에프터리프',
    owner: 'Studio Flow',
    status: 'active',
    current_price: 1200,
    volume_24h: 35000000,
    holders: 245,
    listed_date: '2025-01-15',
  },
]

export default function ProductManagementPage() {
  const [activeTab, setActiveTab] = useState<'contest' | 'market'>('contest')
  const [offerings, setOfferings] = useState<OfferingItem[]>([])
  const [marketItems, setMarketItems] = useState<MarketItem[]>(INITIAL_MARKET)
  const [totals, setTotals] = useState({
    total: 0,
    pending: 0,
    running: 0,
    closed: 0,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [hasNext, setHasNext] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchValue, setSearchValue] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const loadMoreRef = useRef<HTMLDivElement | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const nextCursorRef = useRef<number | null>(null)
  const loadingRef = useRef(false)

  const formatCurrency = useCallback((value: number) => {
    return `${value.toLocaleString()} KRW`
  }, [])

  const fetchOfferings = useCallback(
    async (options?: { reset?: boolean }) => {
      if (loadingRef.current) return
      loadingRef.current = true
      setIsLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        params.set('limit', '10')
        if (!options?.reset && nextCursorRef.current !== null) {
          params.set('cursor', String(nextCursorRef.current))
        }
        if (debouncedSearch.trim()) {
          params.set('keyword', debouncedSearch.trim())
        }
        const res = await apiFetch(`/v1/offerings?${params.toString()}`)
        if (!res.ok) {
          throw new Error('공모 목록을 불러오지 못했어요.')
        }
        const data = (await res.json()) as OfferingsResponse
        nextCursorRef.current = data.nextCursor ?? null
        setHasNext(Boolean(data.hasNext))
        setTotals({
          total: data.totalCount ?? 0,
          pending: data.beforeCount ?? 0,
          running: data.ingCount ?? 0,
          closed: data.afterCount ?? 0,
        })
        setOfferings((prev) =>
          options?.reset ? data.items : [...prev, ...data.items],
        )
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load offerings.')
      } finally {
        loadingRef.current = false
        setIsLoading(false)
      }
    },
    [debouncedSearch],
  )

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchValue)
    }, 400)
    return () => clearTimeout(handler)
  }, [searchValue])

  useEffect(() => {
    nextCursorRef.current = null
    setOfferings([])
    setHasNext(true)
    fetchOfferings({ reset: true })
  }, [debouncedSearch, fetchOfferings])

  useEffect(() => {
    if (!hasNext) return
    if (observerRef.current) {
      observerRef.current.disconnect()
    }
    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNext && !isLoading) {
        fetchOfferings()
      }
    })
    const node = loadMoreRef.current
    if (node) {
      observerRef.current.observe(node)
    }
    return () => observerRef.current?.disconnect()
  }, [fetchOfferings, hasNext, isLoading])

  const filteredOfferings = useMemo(() => {
    if (!debouncedSearch.trim()) return offerings
    const term = debouncedSearch.trim().toLowerCase()
    return offerings.filter(
      (item) =>
        item.productName.toLowerCase().includes(term) ||
        item.projectName.toLowerCase().includes(term),
    )
  }, [offerings, debouncedSearch])

  const handleTransferToMarket = async (productId: number) => {
    const target = offerings.find((item) => item.productId === productId)
    if (!target) return

    try {
      setError(null)
      const res = await apiFetch(
        `/v1/admin/products/${productId}/enable-offering`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ confirm: true }),
        },
      )
      if (!res.ok) {
        let message = '2차 거래 전환에 실패했습니다.'
        try {
          const data = (await res.json()) as { detail?: string; message?: string }
          message = data.detail || data.message || message
        } catch {
          /* ignore */
        }
        throw new Error(message)
      }
      setOfferings((prev) => prev.filter((item) => item.productId !== productId))
      setMarketItems((prev) => [
        ...prev,
        {
          id: target.productId,
          product_name: target.productName,
          project_name: target.projectName,
          owner: target.owner,
          status: 'active',
          current_price: target.offeringPrice,
          volume_24h: 0,
          holders: 0,
          listed_date: format(new Date(), 'yyyy-MM-dd'),
        },
      ])
      setActiveTab('market')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : '2차 거래 전환 처리 중 오류가 발생했습니다.',
      )
    }
  }

const statusClassNames = {
  running: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
  pending: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100',
  closed: 'bg-gray-200 text-gray-600 hover:bg-gray-200',
} as const

const getOfferingStatus = (item: OfferingItem) => {
  if (item.status === 'TRADE') {
    return { label: '마감', variant: 'closed' as const }
  }
  const now = new Date()
  const start = item.offeringStartDate ? new Date(item.offeringStartDate) : null
  const end = item.offeringEndDate ? new Date(item.offeringEndDate) : null
  if (item.progressRate >= 100 || (end && now > end)) {
    return { label: '마감', variant: 'closed' as const }
  }
  if (start && now < start) {
    return { label: '시작 전', variant: 'pending' as const }
  }
  return { label: '진행중', variant: 'running' as const }
}

const getSimpleStatusInfo = (status?: OfferingItem['status']) => {
  if (status === 'OFFERING') {
    return {
      label: '공모',
      textClassName: 'text-[#E54848]',
      dotClassName: 'bg-[#E54848]',
    }
  }
  if (status === 'TRADE') {
    return {
      label: '거래',
      textClassName: 'text-gray-500',
      dotClassName: 'bg-gray-400',
    }
  }
  return {
    label: status ?? '-',
    textClassName: 'text-gray-900',
    dotClassName: 'bg-gray-300',
  }
}

  const formatDuration = (start?: string, end?: string) => {
    if (!start || !end) return '-'
    return `${format(new Date(start), 'yyyy.MM.dd')} ~ ${format(
      new Date(end),
      'yyyy.MM.dd',
    )}`
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">상품 관리</h2>
          <p className="text-sm text-gray-500 mt-1">
            공모 및 2차 거래 상품을 관리합니다.
          </p>
        </div>
        <Link href="/admin/offering/new">
          <Button className="bg-[#1A4DE5] hover:bg-[#153eb5]">
            <Plus className="w-4 h-4 mr-2" />
            상품 등록
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border">
        <div className="border-b">
          <div className="flex">
            <button
              onClick={() => setActiveTab('contest')}
              className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'contest'
                  ? 'border-[#1A4DE5] text-[#1A4DE5]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              공모 관리
            </button>
            <button
              onClick={() => setActiveTab('market')}
              className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'market'
                  ? 'border-[#1A4DE5] text-[#1A4DE5]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              2차거래 관리
            </button>
          </div>
        </div>

        <div className="p-4">
          {activeTab === 'contest' && (
            <>
              <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
                <div className="relative flex-1 w-full sm:max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="상품명 또는 프로젝트명 검색"
                    className="pl-10"
                    value={searchValue}
                    onChange={(event) => setSearchValue(event.target.value)}
                  />
                </div>
                <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
                  <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                    전체 {totals.total.toLocaleString()}건
                  </Badge>
                  <Badge variant="outline" className="border-blue-200 text-blue-600 bg-blue-50">
                    진행중 {totals.running.toLocaleString()}건
                  </Badge>
                  <Badge variant="outline" className="border-emerald-200 text-emerald-600 bg-emerald-50">
                    시작 전 {totals.pending.toLocaleString()}건
                  </Badge>
                  <Badge variant="outline" className="border-gray-200 text-gray-600">
                    마감 {totals.closed.toLocaleString()}건
                  </Badge>
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50">
                      <TableHead className="w-[280px]">상품정보</TableHead>
                      <TableHead className="w-[120px] text-center">상태</TableHead>
                      <TableHead className="text-center">진행현황</TableHead>
                      <TableHead className="text-center">진행률</TableHead>
                      <TableHead className="w-[15%] text-center">모집금액</TableHead>
                      <TableHead className="w-[12%] text-center">공모가</TableHead>
                      <TableHead className="text-center">공모기간</TableHead>
                      <TableHead className="w-[80px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOfferings.map((offering) => {
                      const status = getOfferingStatus(offering)
                      const simpleStatus = getSimpleStatusInfo(offering.status)
                      const totalAmount =
                        offering.offeringPrice * offering.offeringAmount
                      const progress = Math.min(
                        100,
                        Math.max(0, Math.round(offering.progressRate)),
                      )
                      return (
                        <TableRow key={offering.productId}>
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900">
                                {offering.productName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {offering.projectName} | {offering.owner}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              <span
                                className={`h-2 w-2 rounded-full ${simpleStatus.dotClassName}`}
                              />
                              <span
                                className={`text-sm font-medium ${simpleStatus.textClassName}`}
                              >
                                {simpleStatus.label}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant="secondary"
                              className={statusClassNames[status.variant]}
                            >
                              {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-[#1A4DE5] rounded-full transition-all"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium text-gray-700">
                                {progress}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="w-[15%] text-center font-medium">
                            {formatCurrency(totalAmount)}
                          </TableCell>
                          <TableCell className="w-[12%] text-center">
                            {formatCurrency(offering.offeringPrice)}
                          </TableCell>
                          <TableCell className="text-center text-sm text-gray-500">
                            {formatDuration(
                              offering.offeringStartDate,
                              offering.offeringEndDate,
                            )}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">메뉴 열기</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>상세보기</DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleTransferToMarket(offering.productId)
                                  }
                                >
                                  <ArrowRightLeft className="w-4 h-4 mr-2" />
                                  2차 거래로 전환
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600 focus:text-red-600">
                                  삭제하기
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
                <div ref={loadMoreRef} className="h-10" />
                {error ? (
                  <div className="py-6 text-center text-sm text-red-500">
                    {error}
                  </div>
                ) : null}
                {isLoading && (
                  <div className="py-6 text-center text-sm text-gray-500">
                    불러오는 중...
                  </div>
                )}
                {!hasNext && !isLoading && filteredOfferings.length > 0 && (
                  <div className="py-6 text-center text-xs text-gray-400">
                    모든 공모를 불러왔어요.
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'market' && (
            <>
              <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
                <div className="relative flex-1 w-full sm:max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input placeholder="상품명 또는 프로젝트명 검색" className="pl-10" />
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50">
                      <TableHead className="w-[280px]">상품 정보</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead className="text-right">현재가</TableHead>
                      <TableHead className="text-right">24시간 거래대금</TableHead>
                      <TableHead className="text-center">보유자 수</TableHead>
                      <TableHead className="text-center">상장일</TableHead>
                      <TableHead className="w-[80px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {marketItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900">
                              {item.product_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {item.project_name} | {item.owner}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={
                              item.status === 'active'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-200 text-gray-600'
                            }
                          >
                            {item.status === 'active' ? '진행중' : '종료'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {item.current_price.toLocaleString()}원
                        </TableCell>
                        <TableCell className="text-right">
                          {item.volume_24h.toLocaleString()}원
                        </TableCell>
                        <TableCell className="text-center">
                          {item.holders.toLocaleString()}명
                        </TableCell>
                        <TableCell className="text-center text-sm text-gray-500">
                          {item.listed_date}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">메뉴 열기</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>상세보기</DropdownMenuItem>
                              <DropdownMenuItem>거래 중지</DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600 focus:text-red-600">
                                상장 해제
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
