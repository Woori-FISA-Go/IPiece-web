"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import UserProfileCard from "@/components/mypage/UserProfileCard"
import PortfolioPieChart from "@/components/mypage/PortfolioPieChart"
import AssetTable from "@/components/mypage/AssetTable"
import OfferingParticipationTable from "@/components/mypage/OfferingParticipationTable"
import type { MyHomeResponse } from "@/components/mypage/types"
import walletIcon from "@/assets/images/wallet_icon.svg"
import { Button } from "@/components/ui/button"
import { useTopAssetThumbnail } from "@/app/(pages)/context/TopAssetContext"
import { apiFetch } from "@/lib/api-client"

interface MyPortfolioProps {
  data?: MyHomeResponse | null
  isLoading?: boolean
  error?: string | null
  noAccountUser?: string | null
  currentPage: number
  pageSize: number
  onChangePage?: (page: number) => void
  offeringPage: number
  offeringPageSize: number
  onChangeOfferingPage?: (page: number) => void
}

export default function MyPortfolio({
  data,
  isLoading,
  error,
  currentPage,
  pageSize,
  onChangePage,
  offeringPage,
  offeringPageSize,
  onChangeOfferingPage,
  noAccountUser,
}: MyPortfolioProps) {
  const { setThumbnail } = useTopAssetThumbnail()
  const [isCreatingAccount, setIsCreatingAccount] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  useEffect(() => {
    const ratios = data?.portfolio_ratio ?? []
    if (!ratios.length) {
      setThumbnail(null)
      return
    }
    const sorted = [...ratios].sort((a, b) => (b.ratio ?? 0) - (a.ratio ?? 0))
    const topThumb = sorted.find((item) => item.thumbnailImg)?.thumbnailImg ?? null
    setThumbnail(topThumb ?? null)
  }, [data?.portfolio_ratio, setThumbnail])

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
        {error}
      </div>
    )
  }

  if (noAccountUser) {
    const displayName = noAccountUser || "회원님"

    const handleCreateAccount = async () => {
      if (isCreatingAccount) return
      setCreateError(null)
      setIsCreatingAccount(true)
      try {
        const res = await apiFetch("/v1/mypage/account", { method: "POST" })
        if (!res.ok) {
          const clone = res.clone()
          let message: string | undefined
          try {
            const payload = (await clone.json()) as { detail?: string; message?: string }
            message = payload.detail || payload.message
          } catch {
            /* ignore parse errors */
          }
          throw new Error(message || "가상계좌를 생성하지 못했습니다.")
        }
        // 성공 시 새 데이터 로드를 위해 페이지를 새로고침합니다.
        window.location.reload()
      } catch (error) {
        setCreateError(
          error instanceof Error ? error.message : "가상계좌 생성에 실패했습니다.",
        )
      } finally {
        setIsCreatingAccount(false)
      }
    }

    return (
      <div className="flex flex-col items-center justify-center gap-6 rounded-lg border border-gray-200 bg-white px-6 py-12 text-center">
        <Image src={walletIcon} alt="가상계좌 생성 안내" width={56} height={56} />
        <p className="text-sm text-gray-700">
          <span className="font-semibold text-gray-900">{displayName}</span> 가상계좌를 생성하고 거래를 시작해 보세요.
        </p>
        <Button
          className="h-11 rounded-lg bg-[#3386E5] px-6 text-white hover:bg-[#2a75d0]"
          onClick={handleCreateAccount}
          disabled={isCreatingAccount}
        >
          {isCreatingAccount ? "생성 중..." : "가상계좌 생성하기"}
        </Button>
        {createError ? <p className="text-xs text-red-500">{createError}</p> : null}
      </div>
    )
  }

  const offeringItems = data?.offering_list ?? []
  const rawOfferingTotalCount = data?.offering_total_count ?? data?.offeringTotalCount
  const offeringTotalCount =
    typeof rawOfferingTotalCount === "number" ? rawOfferingTotalCount : offeringItems.length
  const offeringHasNext =
    typeof data?.offeringHasNext === "boolean"
      ? data.offeringHasNext
      : typeof data?.offering_has_next === "boolean"
        ? data.offering_has_next
        : undefined
  const offeringNextPage =
    typeof data?.offeringNextPage === "number"
      ? data.offeringNextPage
      : typeof data?.offering_next_page === "number"
        ? data.offering_next_page
        : undefined
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <UserProfileCard data={data} isLoading={isLoading} />
        <PortfolioPieChart ratios={data?.portfolio_ratio} isLoading={isLoading} />
      </div>
      <AssetTable
        assets={data?.asset_list ?? []}
        totalCount={data?.holding_count ?? 0}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={onChangePage}
        isLoading={isLoading}
      />
      <OfferingParticipationTable
        items={offeringItems}
        totalCount={offeringTotalCount}
        currentPage={offeringPage}
        pageSize={offeringPageSize}
        onPageChange={onChangeOfferingPage}
        isLoading={isLoading}
        hasNext={offeringHasNext}
        nextPage={offeringNextPage}
      />
    </div>
  )
}
