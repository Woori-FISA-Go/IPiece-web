"use client"

import { use, useState } from "react"

import { OfferingHero } from "../components/offering-hero"
import { OfferingDetails } from "../components/offering-details"
import { PurchaseConfirmModal } from "../components/purchase-confirm-modal"
import { PurchaseDetailsModal } from "../components/purchase-details-modal"

type OfferingPageProps = {
  params: Promise<{
    id: string
  }>
}

export default function OfferingPage({ params }: OfferingPageProps) {
  const resolvedParams = use(params)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

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
        <OfferingHero onParticipate={handleParticipate} />
        <OfferingDetails />
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
