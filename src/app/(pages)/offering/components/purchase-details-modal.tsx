"use client"

import Image from "next/image"
import { useEffect, useMemo, useState } from "react"

import Logo from "@/app/(pages)/main/assets/Logo.png"
import { apiFetch } from "@/lib/api-client"
import { getAccessToken } from "@/lib/auth"

import { Dialog, DialogContent, DialogTitle } from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import type { OfferingDetail } from "../types"
import { resolveImage } from "../utils"

interface PurchaseDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (quantity: number) => void
  detail?: OfferingDetail | null
}

export function PurchaseDetailsModal({ open, onOpenChange, onConfirm, detail }: PurchaseDetailsModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [isValidating, setIsValidating] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setQuantity(1)
      setErrorMessage(null)
      setIsValidating(false)
    }
  }, [open, detail?.productId])

  const unitPrice = detail?.offeringPrice ?? 0
  const totalPrice = useMemo(() => quantity * unitPrice, [quantity, unitPrice])
  const tokenName = detail?.tokenName ?? "Token"
  const title = detail ? `IPiece ${tokenName} Tokens 구매창` : "구매 정보를 불러오는 중입니다."
  const subtitle = detail
    ? `${detail.productName ?? "상품"} IP 수익증권 (${tokenName})`
    : "상품 정보를 불러오는 중입니다."
  const itemName = detail?.productName ?? "상품 정보 준비 중"
  const formattedUnitPrice = unitPrice > 0 ? `${unitPrice.toLocaleString("ko-KR")}원` : "-"
  const thumbnailImage = useMemo(
    () => resolveImage(detail?.thumbnailImg || detail?.presentImg || detail?.detailImg),
    [detail?.thumbnailImg, detail?.presentImg, detail?.detailImg],
  )

  const handleQuantityChange = (value: string) => {
    const numeric = Number(value)
    if (Number.isNaN(numeric) || numeric <= 0) {
      setQuantity(1)
      return
    }
    setQuantity(Math.floor(numeric))
  }

  const handleSubmit = async () => {
    if (!detail?.productId) return
    if (quantity <= 0) {
      setErrorMessage("1개 이상 입력해주세요.")
      return
    }

    const token = getAccessToken()
    if (!token) {
      setErrorMessage("로그인이 필요한 서비스입니다.")
      return
    }

    setIsValidating(true)
    setErrorMessage(null)
    try {
      const search = new URLSearchParams({ quantity: String(quantity) }).toString()
      const endpoint = `/v1/offerings/${detail.productId}/purchase/validate?${search}`
      const res = await apiFetch(endpoint)
      if (!res.ok) {
        let message: string | undefined
        try {
          const body = (await res.json()) as { detail?: string; message?: string }
          message = body.detail || body.message
        } catch {
          /* ignore */
        }
        throw new Error(message || "구매 가능 여부 확인에 실패했습니다.")
      }
      await res.json().catch(() => null)
      onConfirm(quantity)
    } catch (error) {
      console.error("validate purchase failed", error)
      setErrorMessage(error instanceof Error ? error.message : "구매 가능 여부 확인에 실패했습니다.")
    } finally {
      setIsValidating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md gap-0 bg-white p-0">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <div className="space-y-6 p-6">
          <header className="flex items-center">
            <Image src={Logo} alt="IPiece 로고" width={120} height={32} className="h-8 w-auto object-contain" />
          </header>

          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-[#1F2229]">{title}</h2>
            <p className="text-sm text-[#6B7280]">{subtitle}</p>
          </div>

          <div className="rounded-2xl border border-[#E0E4EC] bg-white">
            <div className="flex flex-col gap-4 p-5">
              <div className="self-start flex h-[132px] w-[132px] items-center justify-center overflow-hidden rounded-[20px] border border-[#E0E4EC] bg-[#FFF7E1] text-left text-xs font-medium text-[#1F2229]">
                {thumbnailImage ? (
                  <img src={thumbnailImage} alt={`${itemName} 썸네일`} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-center leading-tight text-[#4B4E57]">이미지 준비 중</span>
                )}
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-base font-semibold text-[#1F2229]">{itemName}</span>
                <div className="flex items-center gap-2 text-sm text-[#1F2229]">
                  <Input
                    aria-label="구매 수량"
                    type="number"
                    min={1}
                    className="h-10 w-16 text-right"
                    value={quantity}
                    onChange={(event) => handleQuantityChange(event.target.value)}
                  />
                  <span className="whitespace-nowrap">
                    {tokenName} Tokens × {formattedUnitPrice}
                  </span>
                </div>
              </div>
            </div>
            <div className="border-t border-[#E0E4EC] px-5 py-4">
              <div className="flex items-center justify-end gap-2">
                <span className="text-sm font-medium text-[#1F2229]">Total</span>
                <span className="text-xl font-bold text-[#1F2229]">
                  {unitPrice > 0 ? `${totalPrice.toLocaleString("ko-KR")} KRW` : "-"}
                </span>
              </div>
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!detail || unitPrice <= 0 || isValidating}
            className="h-12 w-full rounded-[10px] bg-[#3386E5] text-base font-semibold text-white hover:bg-[#2a75d0] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isValidating ? "확인 중..." : "구매하기"}
          </Button>
          {errorMessage ? <p className="text-right text-sm text-red-500">{errorMessage}</p> : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
