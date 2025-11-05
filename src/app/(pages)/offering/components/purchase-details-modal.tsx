"use client"

import Image from "next/image"

import Logo from "@/app/(pages)/main/assets/Logo.png"

import { Dialog, DialogContent, DialogTitle } from "./ui/dialog"
import { Button } from "./ui/button"

interface PurchaseDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function PurchaseDetailsModal({ open, onOpenChange, onConfirm }: PurchaseDetailsModalProps) {
  const purchaseSummary = {
    title: "IPiece Dino Tokens \uad6c\ub9e4\ucc3d",
    subtitle: "\ub2e4\uc774\ub178\ud0f1 IP \uc218\uc775\uc99d\uad8c (DINOT)",
    itemName: "\ub2e4\uc774\ub178\ud0f1",
    itemDetail: "3 Dino Tokens \u00d7 100 \u20a9",
    totalLabel: "Total",
    totalValue: "300 KRW",
    buttonLabel: "\uad6c\ub9e4\ud558\uae30",
    illustrationAlt: "\ub2e4\uc774\ub178\ud0f1 \uc77c\ub7ec\uc2a4\ud2b8"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md gap-0 bg-white p-0">
        <DialogTitle className="sr-only">{purchaseSummary.title}</DialogTitle>
        <div className="space-y-6 p-6">
          <header className="flex items-center">
            <Image src={Logo} alt="\uc544\uc774\ud53c\uc2a4 \ub85c\uace0" width={120} height={32} className="h-8 w-auto object-contain" />
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
                <span className="text-sm text-[#4B5563]">{purchaseSummary.itemDetail}</span>
              </div>
            </div>
            <div className="border-t border-[#E0E4EC] px-5 py-4">
              <div className="flex items-center justify-end gap-2">
                <span className="text-sm font-medium text-[#6B7280]">{purchaseSummary.totalLabel}</span>
                <span className="text-xl font-bold text-[#1F2229]">{purchaseSummary.totalValue}</span>
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
