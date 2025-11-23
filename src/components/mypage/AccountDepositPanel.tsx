"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import walletIcon from "@/assets/images/wallet_icon.svg"
import { CustomCard as Card } from "@/components/ui/custom-card"
import { Button } from "@/components/ui/button"
import type { AccountJournalEntry, AccountJournalSummary } from "./types"

interface AccountDepositPanelProps {
  accountState: "noAccount" | "emptyHistory" | "hasHistory"
  summary?: AccountJournalSummary | null
  items: AccountJournalEntry[]
  isLoading?: boolean
  error?: string | null
  userName?: string | null
}

const numberFormatter = new Intl.NumberFormat("ko-KR")

function formatAmount(value?: number) {
  if (typeof value !== "number") return "0 KRW"
  const sign = value > 0 ? "+" : value < 0 ? "-" : ""
  return `${sign}${numberFormatter.format(Math.abs(value))} KRW`
}

function formatDate(value?: string) {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  const yyyy = date.getFullYear()
  const mm = `${date.getMonth() + 1}`.padStart(2, "0")
  const dd = `${date.getDate()}`.padStart(2, "0")
  const hh = `${date.getHours()}`.padStart(2, "0")
  const min = `${date.getMinutes()}`.padStart(2, "0")
  return `${yyyy}.${mm}.${dd} ${hh}:${min}`
}

function getJournalLabel(txType?: string) {
  const key = (txType ?? "").toUpperCase()
  if (key === "DEPOSIT" || key === "TRADE_SELL") return { text: "입금 완료", theme: "positive" }
  if (key === "WITHDRAW" || key === "TRADE_BUY" || key === "OFFERING_BUY") return { text: "출금 완료", theme: "negative" }
  if (key === "DIVIDEND") return { text: "배당금", theme: "positive" }
  return { text: "내역", theme: "neutral" }
}

export default function AccountDepositPanel({
  accountState,
  summary,
  items,
  isLoading,
  error,
  userName,
}: AccountDepositPanelProps) {
  const [activeTab, setActiveTab] = useState<"ALL" | "DEPOSIT" | "WITHDRAW">("ALL")

  const filteredItems = useMemo(() => {
    const ordered = [...items].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    if (activeTab === "ALL") return ordered
    return ordered.filter((item) => {
      const key = (item.txType ?? "").toUpperCase()
      if (activeTab === "DEPOSIT") {
        return key === "DEPOSIT" || key === "TRADE_SELL" || key === "DIVIDEND"
      }
      return key === "WITHDRAW" || key === "TRADE_BUY" || key === "OFFERING_BUY"
    })
  }, [items, activeTab])

  if (accountState === "noAccount") {
    const displayName = userName || "회원"
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900">가상계좌 입출금 내역</h2>
        <Card className="flex flex-col items-center gap-4 border border-gray-200 px-6 py-10 text-center">
          <Image src={walletIcon} alt="가상계좌 없음" width={56} height={56} />
          <p className="text-sm text-gray-700">
            <span className="font-semibold text-gray-900">{displayName}</span>님, 가상 계좌를 생성하고 거래를 시작해보세요.
          </p>
          <Button className="h-11 rounded-lg bg-[#3386E5] px-6 text-white hover:bg-[#2a75d0]">가상계좌 생성하기</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-900">가상계좌 입출금 내역</h2>

      <Card className="flex flex-col border border-gray-200 p-6">
        {summary ? (
          <div className="mb-6 space-y-3 border-b border-gray-200 pb-6">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>계좌 번호</span>
              <span className="font-medium text-gray-900">{summary.accountNo ?? "-"}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">총 보유</span>
              <span className="text-lg font-bold text-gray-900">
                {numberFormatter.format(summary.totalBalance ?? summary.totalPrice ?? summary.balanceKrw ?? 0)}{" "}
                <span className="text-xs font-normal text-gray-500">KRW</span>
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">거래대기</span>
              <span className="text-lg font-bold text-gray-900">
                {numberFormatter.format(summary.pendingPrice ?? 0)} <span className="text-xs font-normal text-gray-500">KRW</span>
              </span>
            </div>
          </div>
        ) : null}

        <div className="mb-6 flex border-b border-gray-200">
          {[
            { key: "ALL", label: "내역" },
            { key: "DEPOSIT", label: "입금" },
            { key: "WITHDRAW", label: "출금" },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex-1 py-2 text-sm font-medium ${
                activeTab === tab.key ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex flex-1 items-center justify-center py-12 text-sm text-gray-500">
            입출금 내역을 불러오는 중입니다.
          </div>
        ) : error ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 py-12 text-sm text-red-500">
            {error}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 py-12 text-sm text-gray-500">
            조회된 입출금 내역이 없습니다.
          </div>
        ) : (
          <div className="flex max-h-[400px] flex-col gap-4 overflow-y-auto">
            {filteredItems.map((item) => {
              const journalLabel = getJournalLabel(item.txType)
              const amountValue = item.amountKrw ?? 0
              const amountClass =
                journalLabel.theme === "positive"
                  ? "text-blue-500"
                  : journalLabel.theme === "negative"
                    ? "text-red-500"
                    : "text-gray-800"
              return (
                <div key={item.id} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0">
                  <div>
                    <div className="text-xs text-gray-500">{formatDate(item.createdAt)}</div>
                    <div className="text-sm font-medium text-gray-900">{journalLabel.text}</div>
                    {item.description ? <div className="text-xs text-gray-500">{item.description}</div> : null}
                  </div>
                  <div className={`text-sm font-semibold ${amountClass}`}>{formatAmount(amountValue)}</div>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
