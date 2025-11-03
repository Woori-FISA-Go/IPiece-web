"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import InterestList from "@/app/(pages)/mypage/InterestList"
import MyPortfolio from "@/app/(pages)/mypage/MyPortfolio"
import AccountEmpty from "@/app/(pages)/mypage/AccountEmpty"
import AccountHistory from "@/app/(pages)/mypage/AccountHistory"
import Image from "next/image"
import profilePicture from "@/assets/images/profile-picture.png"

const tabs = ["MY HOME", "내 계좌", "관심"]

export default function MyPage() {
  const [activeTab, setActiveTab] = useState<string>(tabs[0])
  const [hasAssets, setHasAssets] = useState(true)
  const [accountState, setAccountState] = useState<"noAccount" | "emptyHistory" | "hasHistory">("noAccount")
  const [hasInterestItems, setHasInterestItems] = useState(true)
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const activeTabIndex = tabs.indexOf(activeTab);
    const activeButton = tabsRef.current[activeTabIndex];
    if (activeButton) {
      setIndicatorStyle({ left: activeButton.offsetLeft, width: activeButton.offsetWidth });
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="border-b border-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Navigation */}
            <div className="flex items-center gap-8">
              <div className="bg-gray-200 px-6 py-2 rounded text-sm font-medium text-gray-700">Logo</div>
              <nav className="flex gap-6">
                <button className="text-gray-700 hover:text-gray-900 text-sm font-medium">공모</button>
                <button className="text-gray-700 hover:text-gray-900 text-sm font-medium">증권 거래</button>
              </nav>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-2">
              <Image src={profilePicture} alt="Profile picture" width={24} height={24} />
              <span className="text-sm text-gray-700">마이 페이지</span>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8 relative">
            {tabs.map((tab, index) => (
              <button
                key={tab}
                ref={el => tabsRef.current[index] = el}
                onClick={() => setActiveTab(tab)}
                className={`py-3 text-sm relative ${activeTab === tab ? "font-bold text-black" : "text-gray-500 hover:text-gray-700"}`}>
                <span className="px-4 relative z-10">{tab}</span>
              </button>
            ))}
            <div
              className="absolute top-0 h-full bg-[#F3F4F5] rounded-full z-0"
              style={{ ...indicatorStyle, transition: 'left 0.3s ease-in-out, width 0.3s ease-in-out' }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {activeTab === "MY HOME" && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">테스트 모드: 포트폴리오 상태 전환</span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={hasAssets ? "default" : "outline"}
                  onClick={() => setHasAssets(true)}
                  className={hasAssets ? "bg-blue-500 hover:bg-blue-600" : ""}
                >
                  자산 있음
                </Button>
                <Button
                  size="sm"
                  variant={!hasAssets ? "default" : "outline"}
                  onClick={() => setHasAssets(false)}
                  className={!hasAssets ? "bg-blue-500 hover:bg-blue-600" : ""}
                >
                  자산 없음
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "내 계좌" && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">테스트 모드: 가상계좌 상태 전환</span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={accountState === "noAccount" ? "default" : "outline"}
                  onClick={() => setAccountState("noAccount")}
                  className={accountState === "noAccount" ? "bg-blue-500 hover:bg-blue-600" : ""}
                >
                  계좌 없음
                </Button>
                <Button
                  size="sm"
                  variant={accountState === "emptyHistory" ? "default" : "outline"}
                  onClick={() => setAccountState("emptyHistory")}
                  className={accountState === "emptyHistory" ? "bg-blue-500 hover:bg-blue-600" : ""}
                >
                  거래 내역 없음
                </Button>
                <Button
                  size="sm"
                  variant={accountState === "hasHistory" ? "default" : "outline"}
                  onClick={() => setAccountState("hasHistory")}
                  className={accountState === "hasHistory" ? "bg-blue-500 hover:bg-blue-600" : ""}
                >
                  거래 내역 있음
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "관심" && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">테스트 모드: 관심 목록 상태 전환 (총 5개)</span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={hasInterestItems ? "default" : "outline"}
                  onClick={() => setHasInterestItems(true)}
                  className={hasInterestItems ? "bg-blue-500 hover:bg-blue-600" : ""}
                >
                  관심 있음
                </Button>
                <Button
                  size="sm"
                  variant={!hasInterestItems ? "default" : "outline"}
                  onClick={() => setHasInterestItems(false)}
                  className={!hasInterestItems ? "bg-blue-500 hover:bg-blue-600" : ""}
                >
                  관심 없음
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "MY HOME" && <MyPortfolio hasAssets={hasAssets} />}

        {activeTab === "내 계좌" && <AccountHistory accountState={accountState} setAccountState={setAccountState} />}

        {activeTab === "관심" && <InterestList products={hasInterestItems ? undefined : []} />}
      </main>

      {/* Footer */}
      <footer className="bg-blue-50 border-t border-blue-100 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-gray-200 px-6 py-2 rounded text-sm font-medium text-gray-700 inline-block mb-4">Logo</div>

          <div className="text-xs text-gray-600 space-y-1 mb-4">
            <p>대표자 : Masterpiece(주) | 제휴문의 : sto@ipiece.com, 전화문의 : 02-5643-2523</p>
            <p>서울특별시 마포구 월드컵북로 434 IPiece</p>
          </div>

          <div className="text-xs text-gray-500">
            <p>Copyright © IPiece INVESTMENT SECURITIES CO., LTD. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
