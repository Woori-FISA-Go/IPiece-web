"use client"

import { useState } from "react"

import { OfferingHeader } from "../components/offering-header"
import { OfferingHero } from "../components/offering-hero"
import { InvestmentPoints } from "../components/investment-points"
import { OfferingDetails } from "../components/offering-details"
import { PurchaseConfirmModal } from "../components/purchase-confirm-modal"
import { PurchaseDetailsModal } from "../components/purchase-details-modal"
import { OfferingFooter } from "../components/offering-footer"

type OfferingPageProps = {
  params: {
    id: string
  }
}

export default function OfferingPage({ params }: OfferingPageProps) {
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
    <div className="min-h-screen bg-white" data-offering-id={params.id}>
      <OfferingHeader />

      <main>
        <OfferingHero onParticipate={handleParticipate} />
        <InvestmentPoints />
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

      <OfferingFooter />
    </div>
  )
}
