"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

import Logo from "@/app/(pages)/main/assets/Logo.png"
import { apiFetch } from "@/lib/api-client"
import { getAccessToken } from "@/lib/auth"

import { Dialog, DialogContent, DialogTitle } from "./ui/dialog"
import { Button } from "./ui/button"
import type { OfferingDetail } from "../types"

interface PurchaseConfirmModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  detail?: OfferingDetail | null
  quantity: number
  onSuccess?: () => void
}

export function PurchaseConfirmModal({
  open,
  onOpenChange,
  detail,
  quantity,
  onSuccess,
}: PurchaseConfirmModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setIsSubmitting(false)
      setErrorMessage(null)
    }
  }, [open])

  const handlePurchase = async () => {
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

    setIsSubmitting(true)
    setErrorMessage(null)
    try {
      const query = new URLSearchParams({ quantity: String(quantity) }).toString()
      const res = await apiFetch(`/v1/offerings/${detail.productId}/purchase?${query}`, {
        method: "POST",
      })
      if (!res.ok) {
        let message: string | undefined
        try {
          const body = (await res.json()) as { detail?: string; message?: string }
          message = body.detail || body.message
        } catch {
          /* ignore parse error */
        }
        throw new Error(message || "구매 처리에 실패했습니다.")
      }
      await res.json().catch(() => null)
      onSuccess?.()
    } catch (error) {
      console.error("purchase failed", error)
      setErrorMessage(error instanceof Error ? error.message : "구매 처리에 실패했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-sm gap-0 bg-white p-0">
        <DialogTitle className="sr-only">구매 확인</DialogTitle>
        <div className="space-y-8 px-6 py-10">
          <header className="flex items-center">
            <Image src={Logo} alt="아이피스 로고" width={120} height={32} className="h-8 w-auto object-contain" />
          </header>

          <div className="space-y-1 text-left">
            <h2 className="text-lg font-semibold text-[#1F2229]">구매하시겠습니까?</h2>
            <p className="text-sm text-[#6B7280]">버튼을 클릭하면 가상계좌를 통해 구매가 진행됩니다.</p>
          </div>

          <div className="space-y-3 pt-3">
            <Button
              onClick={handlePurchase}
              disabled={isSubmitting || !detail || quantity <= 0}
              className="h-12 w-full rounded-[10px] bg-[#3386E5] text-base font-semibold text-white hover:bg-[#2a75d0] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "처리 중..." : "구매하기"}
            </Button>
            {errorMessage ? <p className="text-center text-sm text-red-500">{errorMessage}</p> : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
