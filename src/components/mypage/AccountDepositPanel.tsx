"use client"

import { useState, useEffect } from "react"
import Image from "next/image" // 1. Image 컴포넌트 import
import walletIcon from "@/assets/images/wallet_icon.svg" // 2. 새 SVG 파일 import
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// Sample deposit/withdrawal data
const sampleDepositHistory = [
  { date: "2025.09.29", time: "00:36", type: "입금 완료", amount: "236 KRW" },
  { date: "2025.09.29", time: "00:36", type: "입금 완료", amount: "236 KRW" },
  { date: "2025.09.28", time: "00:36", type: "출금 완료", amount: "236 KRW" },
  { date: "2025.09.28", time: "00:36", type: "배당금", amount: "236 KRW" },
  { date: "2025.09.27", time: "00:36", type: "입금 완료", amount: "236 KRW" },
]

export default function AccountDepositPanel({
  accountState,
  setAccountState,
}: {
  accountState: "noAccount" | "emptyHistory" | "hasHistory"
  setAccountState: (value: "noAccount" | "emptyHistory" | "hasHistory") => void
}) {
  const [activeTab, setActiveTab] = useState("내역")
  const [depositHistory, setDepositHistory] = useState<typeof sampleDepositHistory>([])

  useEffect(() => {
    if (accountState === "hasHistory") {
      setDepositHistory(sampleDepositHistory)
    } else {
      setDepositHistory([])
    }
  }, [accountState])

  const filteredHistory = depositHistory.filter((item) => {
    if (activeTab === "입금") return item.type === "입금 완료"
    if (activeTab === "출금") return item.type === "출금 완료"
    return true // Show all for "내역" tab
  })

  if (accountState === "noAccount") {
    return (
      <div className="space-y-4 flex flex-col">
        <h2 className="text-lg font-bold text-gray-900">가상계좌 입출금 내역</h2>
        <Card className="border border-gray-200 p-6 flex-grow flex flex-col">
          {/* Balance Summary (empty) */}
          <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">총 보유</span>
              <div className="text-right">
                <span className="text-lg font-bold text-gray-900">0</span>
                <span className="text-xs text-gray-500 ml-1">KRW</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">거래가능</span>
              <div className="text-right">
                <span className="text-lg font-bold text-gray-900">0</span>
                <span className="text-xs text-gray-500 ml-1">KRW</span>
              </div>
            </div>
          </div>

          {/* Empty state with button */}
          <div className="flex-grow flex flex-col items-center justify-center text-center">
            <Image
              src={walletIcon}
              alt="가상 계좌 없음"
              className="mb-4"
            />
            <p className="text-gray-700 text-sm mb-6">가상 계좌가 아직 없습니다.</p>
            <Button className="bg-blue-500 hover:bg-blue-600 text-white px-6" onClick={() => setAccountState("emptyHistory")}>
              가상 계좌 생성하기
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4 flex flex-col">
      <h2 className="text-lg font-bold text-gray-900">가상계좌 입출금 내역</h2>

      <Card className="border border-gray-200 p-6 flex-grow flex flex-col">
        {/* Balance Summary */}
        <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">총 보유</span>
            <div className="text-right">
              <span className="text-lg font-bold text-gray-900">{depositHistory.length > 0 ? "29,329" : "0"}</span>
              <span className="text-xs text-gray-500 ml-1">KRW</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">거래가능</span>
            <div className="text-right">
              <span className="text-lg font-bold text-gray-900">{depositHistory.length > 0 ? "0" : "0"}</span>
              <span className="text-xs text-gray-500 ml-1">KRW</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab("내역")}
            className={`flex-1 py-2 text-sm font-medium ${
              activeTab === "내역" ? "text-blue-500 border-b-2 border-blue-500" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            내역
          </button>
          <button
            onClick={() => setActiveTab("입금")}
            className={`flex-1 py-2 text-sm font-medium ${
              activeTab === "입금" ? "text-blue-500 border-b-2 border-blue-500" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            입금
          </button>
          <button
            onClick={() => setActiveTab("출금")}
            className={`flex-1 py-2 text-sm font-medium ${
              activeTab === "출금" ? "text-blue-500 border-b-2 border-blue-500" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            출금
          </button>
        </div>

        <div className="space-y-4 max-h-[400px] overflow-y-auto flex-grow">
          {accountState === "emptyHistory" ? (
            <div className="flex flex-col items-center justify-center py-12">
              {/* 4. 두 번째 SVG 교체 */}
              <Image
                src={walletIcon}
                alt="입출금 내역 없음"
                className="mb-4"
                // width/height는 import된 SVG가 자동으로 인식합니다.
              />
              <p className="text-gray-700 text-sm mb-6 text-center">조회된 입출금 내역이 없습니다.</p>
            </div>
          ) : (
            filteredHistory.map((item, index) => (
              <div key={index} className="pb-4 border-b border-gray-100 last:border-0">
                <div className="text-xs text-gray-500 mb-2">{item.date}</div>
                <div className="flex justify-between items-center">
                  <div>
                    <div
                      className={`text-sm font-medium ${
                        item.type === "입금 완료"
                          ? "text-red-500"
                          : item.type === "출금 완료"
                          ? "text-blue-500"
                          : "text-gray-700"
                      }`}
                    >
                      {item.type}
                    </div>
                    <div className="text-xs text-gray-500">{item.time}</div>
                  </div>
                  <div className="text-sm font-medium text-black">{item.amount}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}