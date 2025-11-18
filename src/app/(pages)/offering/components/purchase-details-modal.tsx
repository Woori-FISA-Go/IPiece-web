"use client"

import { useState } from "react"
import Image from "next/image"

import Logo from "@/app/(pages)/main/assets/Logo.png"

import { Dialog, DialogContent, DialogTitle } from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"

interface PurchaseDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function PurchaseDetailsModal({ open, onOpenChange, onConfirm }: PurchaseDetailsModalProps) {
  const [quantity, setQuantity] = useState(3)
  const unitPrice = 100
  const totalPrice = quantity * unitPrice

  const purchaseSummary = {
    title: "IPiece Dino Tokens 구매창",
    subtitle: "다이노텡 IP 수익증권 (DINOT)",
    itemName: "다이노텡",
    totalLabel: "Total",
    buttonLabel: "구매하기",
    illustrationAlt: "다이노텡 일러스트",
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md gap-0 bg-white p-0">
        <DialogTitle className="sr-only">{purchaseSummary.title}</DialogTitle>
        <div className="space-y-6 p-6">
          <header className="flex items-center">
            <Image src={Logo} alt="아이피스 로고" width={120} height={32} className="h-8 w-auto object-contain" />
          </header>

          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-[#1F2229]">{purchaseSummary.title}</h2>
            <p className="text-sm text-[#6B7280]">{purchaseSummary.subtitle}</p>
          </div>

          <div className="rounded-2xl border border-[#E0E4EC] bg-white">
            <div className="flex flex-col gap-4 p-5">
              <div className="flex h-[132px] w-[132px] items-center justify-center overflow-hidden rounded-[20px] border border-[#E0E4EC] bg-[#FFF3CC] text-left text-xs font-medium text-[#1F2229] self-start">
                {purchaseSummary.illustrationAlt}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-base font-semibold text-[#1F2229]">{purchaseSummary.itemName}</span>
                <div className="flex items-center gap-2 text-sm text-[#1F2229]">
                  <Input
                    aria-label="토큰 수량"
                    type="number"
                    min={1}
                    className="h-10 w-16 text-right"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                  />
                  <span className="whitespace-nowrap">
                    Dino Tokens × {unitPrice.toLocaleString()} ₩
                  </span>
                </div>
              </div>
            </div>
            <div className="border-t border-[#E0E4EC] px-5 py-4">
              <div className="flex items-center justify-end gap-2">
                <span className="text-sm font-medium text-[#1F2229]">{purchaseSummary.totalLabel}</span>
                <span className="text-xl font-bold text-[#1F2229]">{totalPrice.toLocaleString()} KRW</span>
              </div>
            </div>
          </div>

          <Button
            onClick={onConfirm}
            className="h-12 w-full rounded-[10px] bg-[#3386E5] text-base font-semibold text-white hover:bg-[#2a75d0]"
          >
            {purchaseSummary.buttonLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
