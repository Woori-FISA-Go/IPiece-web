"use client"

import { useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import InterestList from "@/app/(pages)/mypage/InterestList"
import MyPortfolio from "@/app/(pages)/mypage/MyPortfolio"
import AccountHistory from "@/app/(pages)/mypage/AccountHistory"

const TAB_HOME = "MY HOME"
const TAB_ACCOUNT = "내 계좌"
const TAB_INTEREST = "관심"
const tabs = [TAB_HOME, TAB_ACCOUNT, TAB_INTEREST]

export default function MyPage() {
  const [activeTab, setActiveTab] = useState<string>(tabs[0])
  const [hasAssets, setHasAssets] = useState(true)
  const [accountState, setAccountState] =
    useState<"noAccount" | "emptyHistory" | "hasHistory">("noAccount")
  const [hasInterestItems, setHasInterestItems] = useState(true)
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([])

  useEffect(() => {
    const activeTabIndex = tabs.indexOf(activeTab)
    const activeButton = tabsRef.current[activeTabIndex]
    if (activeButton) {
      setIndicatorStyle({ left: activeButton.offsetLeft, width: activeButton.offsetWidth })
    }
  }, [activeTab])

  return (
    <main className="flex-1 bg-white">
      <div className="mt-8 border-b border-[#FAFAFA]">
        <div className="mx-auto flex max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative flex gap-8">
            {tabs.map((tab, index) => (
              <button
                key={tab}
                ref={(el) => {
                  tabsRef.current[index] = el
                }}
                onClick={() => setActiveTab(tab)}
                className={`relative py-3 text-sm ${
                  activeTab === tab ? "font-bold text-black" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <span className="relative z-10 px-4">{tab}</span>
              </button>
            ))}
            <div
              className="absolute top-0 z-0 h-full rounded-full bg-[#F3F4F5]"
              style={{ ...indicatorStyle, transition: "left 0.3s ease, width 0.3s ease" }}
            />
          </div>
        </div>
      </div>

      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {activeTab === TAB_HOME && (
          <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                디자인 확인 모드: 포트폴리오 상태 전환
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={hasAssets ? "default" : "outline"}
                  onClick={() => setHasAssets(true)}
                  className={hasAssets ? "bg-blue-500 text-white hover:bg-blue-600" : ""}
                >
                  자산 있음
                </Button>
                <Button
                  size="sm"
                  variant={!hasAssets ? "default" : "outline"}
                  onClick={() => setHasAssets(false)}
                  className={!hasAssets ? "bg-blue-500 text-white hover:bg-blue-600" : ""}
                >
                  자산 없음
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === TAB_ACCOUNT && (
          <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                디자인 확인 모드: 계좌 상태 전환
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={accountState === "noAccount" ? "default" : "outline"}
                  onClick={() => setAccountState("noAccount")}
                  className={accountState === "noAccount" ? "bg-blue-500 text-white hover:bg-blue-600" : ""}
                >
                  계좌 없음
                </Button>
                <Button
                  size="sm"
                  variant={accountState === "emptyHistory" ? "default" : "outline"}
                  onClick={() => setAccountState("emptyHistory")}
                  className={accountState === "emptyHistory" ? "bg-blue-500 text-white hover:bg-blue-600" : ""}
                >
                  거래 내역 없음
                </Button>
                <Button
                  size="sm"
                  variant={accountState === "hasHistory" ? "default" : "outline"}
                  onClick={() => setAccountState("hasHistory")}
                  className={accountState === "hasHistory" ? "bg-blue-500 text-white hover:bg-blue-600" : ""}
                >
                  거래 내역 있음
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === TAB_INTEREST && (
          <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                디자인 확인 모드: 관심 목록 상태 전환
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={hasInterestItems ? "default" : "outline"}
                  onClick={() => setHasInterestItems(true)}
                  className={hasInterestItems ? "bg-blue-500 text-white hover:bg-blue-600" : ""}
                >
                  관심 있음
                </Button>
                <Button
                  size="sm"
                  variant={!hasInterestItems ? "default" : "outline"}
                  onClick={() => setHasInterestItems(false)}
                  className={!hasInterestItems ? "bg-blue-500 text-white hover:bg-blue-600" : ""}
                >
                  관심 없음
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === TAB_HOME && <MyPortfolio hasAssets={hasAssets} />}
        {activeTab === TAB_ACCOUNT && (
          <AccountHistory accountState={accountState} setAccountState={setAccountState} />
        )}
        {activeTab === TAB_INTEREST && <InterestList products={hasInterestItems ? undefined : []} />}
      </section>
    </main>
  )
}
