"use client"

import Image from "next/image"

import Logo from "@/app/(pages)/main/assets/Logo.png"

import { Dialog, DialogContent, DialogTitle } from "./ui/dialog"
import { Button } from "./ui/button"

interface PurchaseConfirmModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function PurchaseConfirmModal({ open, onOpenChange, onConfirm }: PurchaseConfirmModalProps) {
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
            <p className="text-sm text-[#6B7280]">버튼을 클릭하면 가상계좌를 통해 구매 진행됩니다.</p>
          </div>

          <div className="pt-3">
            <Button
              onClick={onConfirm}
              className="h-12 w-full rounded-[10px] bg-[#3386E5] text-base font-semibold text-white hover:bg-[#2a75d0]"
            >
              구매하기
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}