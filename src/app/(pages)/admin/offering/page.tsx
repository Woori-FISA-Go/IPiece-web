"use client"

import Image from "next/image"
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react"
import Link from "next/link"
import { format } from "date-fns"
import {
  Search,
  Plus,
  MoreHorizontal,
  ArrowRightLeft,
  LayoutGrid,
  Clock3,
  PlayCircle,
  CheckCircle2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { apiFetch } from "@/lib/api-client"

type OfferingItem = {
  productId: number
  productName: string
  owner: string
  projectName: string
  status?: "OFFERING" | "TRADE" | string
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
  status: "active" | "ended"
  current_price: number
  change_rate: number
  listed_date: string
  thumbnailImg?: string | null
}

type MarketProduct = {
  productId: number
  productName: string
  owner: string
  thumbnailImg?: string
  currentPrice?: number
  changeRate?: number
  isFavorited?: boolean
  startAt?: string
}

type MarketProductsResponse = {
  products?: MarketProduct[]
  totalCount?: number
  page?: number
}

const statusClassNames = {
  running: "bg-[#fef3c7] text-[#d97706] hover:bg-[#fef3c7]",
  pending: "bg-emerald-50 text-emerald-700 hover:bg-emerald-50",
  closed: "bg-gray-200 text-gray-600 hover:bg-gray-200",
} as const

export default function ProductManagementPage() {
  const [activeTab, setActiveTab] = useState<"contest" | "market">("contest")
  const [offerings, setOfferings] = useState<OfferingItem[]>([])
  const [marketItems, setMarketItems] = useState<MarketItem[]>([])
  const [marketLoading, setMarketLoading] = useState(false)
  const [marketError, setMarketError] = useState<string | null>(null)
  const [marketLoaded, setMarketLoaded] = useState(false)
  const [totals, setTotals] = useState({
    total: 0,
    pending: 0,
    running: 0,
    closed: 0,
  })
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "running" | "closed">("all")
  const [isLoading, setIsLoading] = useState(false)
  const [hasNext, setHasNext] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchValue, setSearchValue] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const loadMoreRef = useRef<HTMLDivElement | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const nextCursorRef = useRef<number | null>(null)
  const loadingRef = useRef(false)

  const formatCurrency = useCallback((value: number) => {
    return `${value.toLocaleString()} KRW`
  }, [])

  function getOfferingStatus(item: OfferingItem) {
    if (item.status === "TRADE") {
      return { label: "종료", variant: "closed" as const }
    }
    const now = new Date()
    const start = item.offeringStartDate ? new Date(item.offeringStartDate) : null
    const end = item.offeringEndDate ? new Date(item.offeringEndDate) : null
    if (item.progressRate >= 100 || (end && now > end)) {
      return { label: "종료", variant: "closed" as const }
    }
    if (start && now < start) {
      return { label: "시작 전", variant: "pending" as const }
    }
    return { label: "진행중", variant: "running" as const }
  }

  const rankStatus = (item: OfferingItem) => {
    const st = getOfferingStatus(item).label
    if (st === "시작 전") return 0
    if (st === "진행중") return 1
    return 2
  }

  const sortOfferings = (items: OfferingItem[]) => {
    return [...items].sort((a, b) => {
      const aStatus = rankStatus(a)
      const bStatus = rankStatus(b)
      if (aStatus !== bStatus) return aStatus - bStatus

      if (aStatus === 2 && bStatus === 2) {
        const closedPriority = (item: OfferingItem) =>
          getSimpleStatusInfo(item.status).label === "공모" ? -1 : 0
        const aClosed = closedPriority(a)
        const bClosed = closedPriority(b)
        if (aClosed !== bClosed) return aClosed - bClosed
      }

      const aStart = a.offeringStartDate ? new Date(a.offeringStartDate).getTime() : 0
      const bStart = b.offeringStartDate ? new Date(b.offeringStartDate).getTime() : 0
      return bStart - aStart
    })
  }

  function getSimpleStatusInfo(status?: OfferingItem["status"]) {
    if (status === "OFFERING") {
      return {
        label: "공모",
        textClassName: "text-[#1A4DE5]",
        dotClassName: "bg-[#1A4DE5]",
      }
    }
    if (status === "TRADE") {
      return {
        label: "거래",
        textClassName: "text-gray-500",
        dotClassName: "bg-gray-400",
      }
    }
    return {
      label: status ?? "-",
      textClassName: "text-gray-900",
      dotClassName: "bg-gray-300",
    }
  }

  const fetchOfferings = useCallback(
    async (options?: { reset?: boolean }) => {
      if (loadingRef.current) return
      loadingRef.current = true
      setIsLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        params.set("limit", "10")
        if (!options?.reset && nextCursorRef.current !== null) {
          params.set("cursor", String(nextCursorRef.current))
        }
        if (debouncedSearch.trim()) {
          params.set("keyword", debouncedSearch.trim())
        }
        const res = await apiFetch(`/v1/offerings?${params.toString()}`)
        if (!res.ok) {
          throw new Error("공모 목록을 불러오지 못했습니다.")
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
        setOfferings((prev) => {
          const next = options?.reset ? data.items : [...prev, ...data.items]
          return sortOfferings(next)
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load offerings.")
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
    const term = debouncedSearch.trim().toLowerCase()
    return offerings.filter((item) => {
      const matchesStatus = statusFilter === "all" || getOfferingStatus(item).variant === statusFilter
      const matchesKeyword =
        !term ||
        item.productName.toLowerCase().includes(term) ||
        item.projectName.toLowerCase().includes(term)
      return matchesStatus && matchesKeyword
    })
  }, [offerings, debouncedSearch, statusFilter])

  const mapMarketProduct = useCallback((item: MarketProduct): MarketItem => {
    const listedDate = item.startAt ? format(new Date(item.startAt), "yyyy-MM-dd") : "-"
    return {
      id: item.productId,
      product_name: item.productName,
      project_name: item.owner || "-",
      owner: item.owner || "-",
      status: "active",
      current_price: item.currentPrice ?? 0,
      change_rate: item.changeRate ?? 0,
      listed_date: listedDate,
      thumbnailImg: item.thumbnailImg ?? null,
    }
  }, [])

  const fetchMarketProducts = useCallback(async () => {
    setMarketLoading(true)
    setMarketError(null)
    try {
      const collected: MarketItem[] = []
      let page = 1
      const MAX_PAGES = 50
      let totalCount: number | undefined

      while (page <= MAX_PAGES) {
        const params = new URLSearchParams({ page: String(page) })
        const res = await apiFetch(`/v1/market/products?${params.toString()}`)
        if (!res.ok) {
          let message = "2차거래 목록을 불러오지 못했습니다."
          try {
            const payload = (await res.json()) as { detail?: string; message?: string }
            message = payload.detail || payload.message || message
          } catch {
            /* ignore parse errors */
          }
          throw new Error(message)
        }
        const data = (await res.json()) as MarketProductsResponse
        if (typeof data.totalCount === "number") {
          totalCount = data.totalCount
        }
        const mapped = (data.products || []).map(mapMarketProduct)
        collected.push(...mapped)

        const noMore =
          mapped.length === 0 || (typeof totalCount === "number" && collected.length >= totalCount)
        if (noMore) {
          break
        }
        page += 1
      }

      setMarketItems(collected)
    } catch (error) {
      setMarketItems([])
      setMarketError(
        error instanceof Error ? error.message : "2차거래 목록을 불러오지 못했습니다.",
      )
    } finally {
      setMarketLoading(false)
      setMarketLoaded(true)
    }
  }, [mapMarketProduct])

  useEffect(() => {
    if (activeTab === "market" && !marketLoaded) {
      fetchMarketProducts()
    }
  }, [activeTab, marketLoaded, fetchMarketProducts])

  const sortedFilteredOfferings = useMemo(
    () => sortOfferings(filteredOfferings),
    [filteredOfferings],
  )

  const handleTransferToMarket = async (productId: number) => {
    const target = offerings.find((item) => item.productId === productId)
    if (!target) return

    try {
      setError(null)
      const res = await apiFetch(`/v1/admin/products/${productId}/enable-offering`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ confirm: true }),
      })
      if (!res.ok) {
        let message = "2차거래로 전환에 실패했습니다."
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
          status: "active",
          current_price: target.offeringPrice,
          change_rate: 0,
          listed_date: target.offeringStartDate
            ? format(new Date(target.offeringStartDate), "yyyy-MM-dd")
            : "-",
        },
      ])
    } catch (err) {
      setError(err instanceof Error ? err.message : "2차거래로 전환에 실패했습니다.")
    }
  }

  const formatDuration = (start?: string, end?: string) => {
    if (!start || !end) return "-"
    return `${format(new Date(start), "yyyy.MM.dd")} ~ ${format(new Date(end), "yyyy.MM.dd")}`
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">상품 관리</h2>
          <p className="text-sm text-gray-500 mt-1">공모 및 2차 거래 상품을 관리합니다.</p>
        </div>
        <Link href="/admin/offering/new">
          <Button className="bg-[#1d4ed8] hover:bg-[#153ba8]">
            <Plus className="w-4 h-4 mr-2" />
            상품 생성
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border">
        <div className="border-b">
          <div className="flex">
            <button
              onClick={() => setActiveTab("contest")}
              className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === "contest"
                  ? "border-[#1A4DE5] text-[#1A4DE5]"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              공모 관리
            </button>
            <button
              onClick={() => setActiveTab("market")}
              className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === "market"
                  ? "border-[#1A4DE5] text-[#1A4DE5]"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              2차거래 관리
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {activeTab === "contest" && (
            <>
              <div className="bg-white rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.08)] p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { key: "all", label: "전체", value: totals.total, icon: LayoutGrid, activeBg: "bg-[#e8f1ff]", activeText: "text-[#0d6efd]", iconColor: "text-[#0d6efd]", bg: "bg-[#e8f1ff]", hoverColor: "#0d6efd" },
                    { key: "pending", label: "시작 전", value: totals.pending, icon: Clock3, activeBg: "bg-emerald-50", activeText: "text-emerald-700", iconColor: "text-emerald-600", bg: "bg-emerald-50", hoverColor: "#059669" },
                    { key: "running", label: "진행 중", value: totals.running, icon: PlayCircle, activeBg: "bg-[#fef3c7]", activeText: "text-[#d97706]", iconColor: "text-[#d97706]", bg: "bg-[#fef3c7]", hoverColor: "#d97706" },
                    { key: "closed", label: "종료", value: totals.closed, icon: CheckCircle2, activeBg: "bg-gray-100", activeText: "text-gray-600", iconColor: "text-gray-500", bg: "bg-gray-100", hoverColor: "#6b7280" },
                  ].map((item) => {
                    const isActive = statusFilter === item.key
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setStatusFilter(item.key as typeof statusFilter)}
                        style={{ "--btn-color": item.hoverColor } as CSSProperties}
                        className={`flex items-center gap-3 rounded-full border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0d6efd] ${
                          isActive
                            ? `border-transparent ${item.activeBg} ${item.activeText}`
                            : "border-slate-200 bg-white text-slate-800 hover:border-[var(--btn-color)] hover:text-[var(--btn-color)]"
                        }`}
                      >
                        <span
                          className={`flex h-11 w-11 items-center justify-center rounded-full ${
                            isActive ? "bg-white/60 text-current border border-white/60" : `${item.bg} ${item.iconColor}`
                          }`}
                        >
                          <item.icon className="w-5 h-5" />
                        </span>
                        <div className="flex flex-col leading-tight">
                          <span className={`text-sm font-semibold ${isActive ? "text-current" : "text-slate-900"}`}>
                            {item.label}
                          </span>
                          <span className={`text-base font-bold ${isActive ? "text-current" : "text-slate-700"}`}>
                            {item.value.toLocaleString()} 건
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="상품명 혹은 프로젝트명 검색"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50">
                      <TableHead className="w-[240px]">상품 정보</TableHead>
                      <TableHead className="text-center">진행 상태</TableHead>
                      <TableHead className="text-center">상태</TableHead>
                      <TableHead className="text-center">진행률</TableHead>
                      <TableHead className="text-center">총 모집 금액</TableHead>
                      <TableHead className="text-center">참여가</TableHead>
                      <TableHead className="text-center">기간</TableHead>
                      <TableHead className="w-[80px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedFilteredOfferings.map((offering) => {
                      const status = getOfferingStatus(offering)
                      const simpleStatus = getSimpleStatusInfo(offering.status)
                      const totalAmount = offering.offeringPrice * offering.offeringAmount
                      const progress = Math.min(100, Math.max(0, Math.round(offering.progressRate)))
                      return (
                        <TableRow key={offering.productId}>
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900">{offering.productName}</div>
                              <div className="text-sm text-gray-500">
                                {offering.projectName} | {offering.owner}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              <span className={`h-2 w-2 rounded-full ${simpleStatus.dotClassName}`} />
                              <span className={`text-sm font-medium ${simpleStatus.textClassName}`}>
                                {simpleStatus.label}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary" className={statusClassNames[status.variant]}>
                              {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className={`w-24 h-2 rounded-full overflow-hidden ${status.variant === "closed" ? "bg-gray-300" : "bg-gray-200"}`}>
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{
                                    width: `${progress}%`,
                                    backgroundColor: status.variant === "closed" && progress >= 100 ? "#9ca3af" : "#1A4DE5",
                                  }}
                                />
                              </div>
                              <span className="text-sm font-medium text-gray-700">{progress}%</span>
                            </div>
                          </TableCell>
                          <TableCell className="w-[15%] text-center font-medium">
                            {formatCurrency(totalAmount)}
                          </TableCell>
                          <TableCell className="w-[12%] text-center">
                            {formatCurrency(offering.offeringPrice)}
                          </TableCell>
                          <TableCell className="text-center text-sm text-gray-500">
                            {formatDuration(offering.offeringStartDate, offering.offeringEndDate)}
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
                                <DropdownMenuItem>상세 보기</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleTransferToMarket(offering.productId)}>
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
                {error ? <div className="py-6 text-center text-sm text-red-500">{error}</div> : null}
                {isLoading && (
                  <div className="py-6 text-center text-sm text-gray-500">불러오는 중...</div>
                )}
                {!hasNext && !isLoading && filteredOfferings.length > 0 && (
                  <div className="py-6 text-center text-xs text-gray-400">더 이상 불러올 내용이 없습니다.</div>
                )}
              </div>
            </>
          )}

          {activeTab === "market" && (
            <>
              <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
                <div className="relative flex-1 w-full sm:max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input placeholder="상품명 혹은 프로젝트명 검색" className="pl-10" />
                </div>
              </div>

              <div className="rounded-md border">
                {marketLoading ? (
                  <div className="py-6 text-center text-sm text-gray-500">불러오는 중...</div>
                ) : marketError ? (
                  <div className="py-6 text-center text-sm text-red-500">{marketError}</div>
                ) : marketItems.length === 0 ? (
                  <div className="py-6 text-center text-sm text-gray-500">
                    조회된 2차거래 상품이 없습니다.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/50 text-sm">
                        <TableHead className="w-[280px] px-4 py-3">상품 정보</TableHead>
                        <TableHead className="px-4 py-3 text-center pl-6">상태</TableHead>
                        <TableHead className="px-4 py-3 text-center pr-6">현재가</TableHead>
                        <TableHead className="px-4 py-3 text-center pr-6">등락률</TableHead>
                        <TableHead className="px-4 py-3 text-center">상장일</TableHead>
                        <TableHead className="w-[80px] px-4 py-3" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {marketItems.map((item, index) => (
                        <TableRow key={`${item.id}-${index}`} className="align-middle">
                          <TableCell className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="relative h-12 w-12 rounded-lg bg-slate-100 border overflow-hidden flex-shrink-0">
                                {item.thumbnailImg ? (
                                  <Image
                                    src={item.thumbnailImg}
                                    alt={`${item.product_name} 썸네일`}
                                    fill
                                    className="object-cover"
                                    sizes="48px"
                                  />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center text-sm font-semibold text-slate-500">
                                    {item.product_name?.slice(0, 1) ?? "?"}
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{item.product_name}</div>
                                <div className="text-sm text-gray-500">{item.owner}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-3 text-center pl-6">
                            <Badge
                              variant="secondary"
                              className={
                                item.status === "active"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-200 text-gray-600"
                              }
                            >
                              {item.status === "active" ? "거래중" : "종료"}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-4 py-3 text-center pr-6 font-medium">
                            {item.current_price.toLocaleString()}원
                          </TableCell>
                          <TableCell className="px-4 py-3 text-center pr-6">
                            {`${(item.change_rate ?? 0).toFixed(1)}%`}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-center text-sm text-gray-500">
                            {item.listed_date}
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">메뉴 열기</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>상세 보기</DropdownMenuItem>
                                <DropdownMenuItem>거래 정지</DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600 focus:text-red-600">
                                  삭제
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
