"use client"

import dynamic from "next/dynamic"
import Link from "next/link"
import { use, useEffect, useState } from "react"

import { Dialog, DialogContent, DialogTitle } from "../components/ui/dialog"
import { Button } from "../components/ui/button"
import { OfferingHero } from "../components/offering-hero"
import { OfferingDetails } from "../components/offering-details"
import { PurchaseConfirmModal } from "../components/purchase-confirm-modal"
import { PurchaseDetailsModal } from "../components/purchase-details-modal"
import type { OfferingDetail } from "../types"
import cashbackAnimation from "@/assets/lottie/Cashback.json"
import { apiFetch } from "@/lib/api-client"

type OfferingPageProps = {
  params: Promise<{
    id: string
  }>
}

const Lottie = dynamic(() => import("lottie-react"), { ssr: false })

export default function OfferingPage({ params }: OfferingPageProps) {
  const resolvedParams = use(params)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [detail, setDetail] = useState<OfferingDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedQuantity, setSelectedQuantity] = useState(1)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false
    const cacheKey = `offering-detail:${resolvedParams.id}`
    if (typeof window !== "undefined") {
      const cached = sessionStorage.getItem(cacheKey)
      if (cached) {
        try {
          const parsed = JSON.parse(cached) as OfferingDetail
          setDetail(parsed)
          setIsLoading(false)
        } catch {
          /* ignore cache parse error */
        }
      }
    }

    const controller = new AbortController()
    const fetchDetail = async () => {
      setIsLoading(true)
      try {
        const res = await apiFetch(`/v1/offerings/${resolvedParams.id}/detail`, {
          signal: controller.signal,
        })
        if (!res.ok) {
          let message: string | undefined
          try {
            const body = (await res.json()) as { detail?: string; message?: string }
            message = body.detail || body.message
          } catch {
            /* ignore */
          }
          throw new Error(message || "상세 정보를 불러오지 못했습니다.")
        }
        const data = (await res.json()) as OfferingDetail
        if (!ignore) {
          setDetail(data)
          setError(null)
          if (typeof window !== "undefined") {
            sessionStorage.setItem(cacheKey, JSON.stringify(data))
          }
        }
      } catch (err) {
        if (ignore) return
        setError(err instanceof Error ? err.message : "상세 정보를 불러오지 못했습니다.")
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    fetchDetail()

    return () => {
      ignore = true
      controller.abort()
    }
  }, [resolvedParams.id])

  const handleParticipate = () => {
    setShowDetailsModal(true)
  }

  const handleConfirmPurchase = (validatedQuantity: number) => {
    setSelectedQuantity(validatedQuantity)
    setShowDetailsModal(false)
    setShowConfirmModal(true)
  }

  const handleFinalPurchase = () => {
    setShowConfirmModal(false)
    setToastMessage(null)
    setShowSuccessModal(true)
  }

  return (
    <>
      <main className="flex-1 bg-white" data-offering-id={resolvedParams.id} data-selected-quantity={selectedQuantity}>
        {error ? (
          <div className="bg-red-50 px-6 py-3 text-sm text-red-600">{error}</div>
        ) : null}
        <OfferingHero onParticipate={handleParticipate} detail={detail} isLoading={isLoading} />
        <OfferingDetails detail={detail} isLoading={isLoading} />
      </main>

      <PurchaseDetailsModal
        open={showDetailsModal}
        onOpenChange={setShowDetailsModal}
        onConfirm={handleConfirmPurchase}
        detail={detail}
      />

      <PurchaseConfirmModal
        open={showConfirmModal}
        onOpenChange={setShowConfirmModal}
        detail={detail}
        quantity={selectedQuantity}
        onSuccess={handleFinalPurchase}
      />

      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="w-full max-w-sm gap-0 bg-white p-0 rounded-2xl">
          <DialogTitle className="sr-only">공모 참여 완료</DialogTitle>
          <div className="flex flex-col items-center gap-4 px-6 py-8">
            <div className="h-48 w-48">
              <Lottie animationData={cashbackAnimation} loop={false} autoplay />
            </div>
            <div className="space-y-1 text-center">
              <h3 className="text-lg font-semibold text-[#0f172a]">공모 참여가 완료되었습니다.</h3>
              <p className="text-sm text-[#6b7280]">
                참여 내역은{" "}
                <Link href="/mypage" className="text-[#1d4ed8] font-semibold hover:underline">
                  마이페이지
                </Link>
                에서 확인할 수 있습니다.
              </p>
            </div>
            <Button
              className="h-11 w-full rounded-lg bg-[#3386E5] hover:bg-[#2a75d0]"
              onClick={() => setShowSuccessModal(false)}
            >
              확인
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
