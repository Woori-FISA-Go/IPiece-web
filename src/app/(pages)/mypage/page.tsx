"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import InterestList from "@/app/(pages)/mypage/InterestList"
import MyPortfolio from "@/app/(pages)/mypage/MyPortfolio"
import AccountHistory from "@/app/(pages)/mypage/AccountHistory"
import { apiFetch } from "@/lib/api-client"
import type { MyHomeResponse } from "@/components/mypage/types"

const TAB_HOME = "MY HOME"
const TAB_ACCOUNT = "내 계좌"
const TAB_INTEREST = "관심"
const tabs = [TAB_HOME, TAB_ACCOUNT, TAB_INTEREST]
const ASSET_PAGE_SIZE = 10
const OFFERING_PAGE_SIZE = 10

export default function MyPage() {
  const [activeTab, setActiveTab] = useState<string>(tabs[0])
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([])

  const [accountState, setAccountState] =
    useState<"noAccount" | "emptyHistory" | "hasHistory">("noAccount")

  const [myHomeData, setMyHomeData] = useState<MyHomeResponse | null>(null)
  const [assetPage, setAssetPage] = useState(1)
  const [offeringPage, setOfferingPage] = useState(1)
  const [isLoadingHome, setIsLoadingHome] = useState(false)
  const [homeError, setHomeError] = useState<string | null>(null)
  const [noAccountUser, setNoAccountUser] = useState<string | null>(null)

  useEffect(() => {
    const activeTabIndex = tabs.indexOf(activeTab)
    const activeButton = tabsRef.current[activeTabIndex]
    if (activeButton) {
      setIndicatorStyle({ left: activeButton.offsetLeft, width: activeButton.offsetWidth })
    }
  }, [activeTab])

  const fetchMyHome = useCallback(
    async (assetPageValue: number, offeringPageValue: number) => {
      setIsLoadingHome(true)
      setHomeError(null)
      try {
        const res = await apiFetch(`/v1/mypage/myhome?page=${assetPageValue}&offeringPage=${offeringPageValue}`)
        if (!res.ok) {
          const clone = res.clone()
          let message: string | undefined
          let payload: Record<string, unknown> | undefined
          try {
            payload = (await clone.json()) as Record<string, unknown>
            message = (payload.detail as string) || (payload.message as string)
          } catch {
            /* ignore */
          }
          if (res.status === 404) {
            setNoAccountUser((payload?.user_made_id as string) || (payload?.userMadeId as string) || null)
            setMyHomeData(null)
            setHomeError(null)
            return
          }
          throw new Error(message || "마이홈 정보를 불러오지 못했습니다.")
        }
        setNoAccountUser(null)
        const data = (await res.json()) as MyHomeResponse
        setMyHomeData(data)
      } catch (error) {
        console.error("failed to fetch my home", error)
        setNoAccountUser(null)
        setHomeError(error instanceof Error ? error.message : "마이홈 정보를 불러오지 못했습니다.")
      } finally {
        setIsLoadingHome(false)
      }
    },
    [],
  )

  useEffect(() => {
    fetchMyHome(assetPage, offeringPage)
  }, [assetPage, offeringPage, fetchMyHome])

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
          <MyPortfolio
            data={myHomeData}
            isLoading={isLoadingHome}
            error={homeError}
            noAccountUser={noAccountUser}
            currentPage={assetPage}
            pageSize={ASSET_PAGE_SIZE}
            onChangePage={setAssetPage}
            offeringPage={offeringPage}
            offeringPageSize={OFFERING_PAGE_SIZE}
            onChangeOfferingPage={setOfferingPage}
          />
        )}
        {activeTab === TAB_ACCOUNT && (
          <AccountHistory accountState={accountState} setAccountState={setAccountState} />
        )}
        {activeTab === TAB_INTEREST && <InterestList />}
      </section>
    </main>
  )
}
