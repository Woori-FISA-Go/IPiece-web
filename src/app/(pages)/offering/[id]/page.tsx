"use client"

import { use, useEffect, useState } from "react"

import { OfferingHero } from "../components/offering-hero"
import { OfferingDetails } from "../components/offering-details"
import { PurchaseConfirmModal } from "../components/purchase-confirm-modal"
import { PurchaseDetailsModal } from "../components/purchase-details-modal"
import type { OfferingDetail } from "../types"
import { apiFetch } from "@/lib/api-client"

type OfferingPageProps = {
  params: Promise<{
    id: string
  }>
}

export default function OfferingPage({ params }: OfferingPageProps) {
  const resolvedParams = use(params)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [detail, setDetail] = useState<OfferingDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  const handleConfirmPurchase = () => {
    setShowDetailsModal(false)
    setShowConfirmModal(true)
  }

  const handleFinalPurchase = () => {
    setShowConfirmModal(false)
  }

  return (
    <>
      <main className="flex-1 bg-white" data-offering-id={resolvedParams.id}>
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
      />

      <PurchaseConfirmModal
        open={showConfirmModal}
        onOpenChange={setShowConfirmModal}
        onConfirm={handleFinalPurchase}
      />
    </>
  )
}
