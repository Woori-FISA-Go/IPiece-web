"use client"

import { useState } from "react"
import AccountHistoryTable from "@/components/mypage/AccountHistoryTable"
import AccountDepositPanel from "@/components/mypage/AccountDepositPanel"
import AccountFilter from "@/components/mypage/AccountFilter"

export default function AccountHistory({
  accountState,
  setAccountState,
}: {
  accountState: "noAccount" | "emptyHistory" | "hasHistory"
  setAccountState: (value: "noAccount" | "emptyHistory" | "hasHistory") => void
}) {
  const [startDate, setStartDate] = useState("2025/10/23")
  const [endDate, setEndDate] = useState("2025/10/23")
  const [activeFilter, setActiveFilter] = useState("당일")

  return (
    <div className="space-y-6">
      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Section - Transaction History */}
        <div className="lg:col-span-2 space-y-4 flex flex-col">
          <h2 className="text-lg font-bold text-gray-900">거래내역</h2>

          <AccountFilter
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
          />

          <AccountHistoryTable accountState={accountState} />
        </div>

        {/* Right Section - Virtual Account Summary */}
        <AccountDepositPanel accountState={accountState} setAccountState={setAccountState} />
      </div>
    </div>
  )
}