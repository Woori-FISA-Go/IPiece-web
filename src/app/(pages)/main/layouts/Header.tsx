"use client"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import Logo from "../assets/Logo.png"
import profilePicture from "@/assets/images/profile-picture.png"
import { Button } from "../components/ui/button"
import { ACCESS_TOKEN_KEY } from "@/lib/auth"
import { useTopAssetThumbnail } from "@/app/(pages)/context/TopAssetContext"
import { apiFetch } from "@/lib/api-client"
import type { MyHomeResponse } from "@/components/mypage/types"

type HeaderProps = {
  containerClassName?: string
}

export function Header({ containerClassName }: HeaderProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const { thumbnail, setThumbnail } = useTopAssetThumbnail()
  const avatarSrc = thumbnail || profilePicture.src
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const tab = searchParams?.get('tab')
  const onMain = pathname === '/' || pathname?.startsWith('/main')
  const isOfferingActive = pathname?.startsWith('/offering') || (onMain && tab === 'offering')
  const isTradingActive = pathname?.startsWith('/trading') || (onMain && tab === 'trading')

  const navBase =
    "text-sm font-semibold cursor-pointer relative after:content-[''] after:absolute after:left-0 after:-bottom-1.5 after:h-[2px] after:bg-current after:transition-all after:duration-200"

  useEffect(() => {
    if (typeof window === "undefined") return
    const hasAccessToken = !!localStorage.getItem(ACCESS_TOKEN_KEY)
    setIsLoggedIn(hasAccessToken)
  }, [])

  useEffect(() => {
    if (!isLoggedIn || thumbnail) return
    let isCancelled = false
    const loadTopAsset = async () => {
      try {
        const res = await apiFetch("/v1/mypage/myhome?page=1&offeringPage=1")
        if (!res.ok) return
        const data = (await res.json()) as MyHomeResponse
        const ratios = data?.portfolio_ratio ?? []
        if (!ratios.length) return
        const sorted = [...ratios].sort((a, b) => (b.ratio ?? 0) - (a.ratio ?? 0))
        const topThumb = sorted.find((item) => item.thumbnailImg)?.thumbnailImg ?? null
        if (!isCancelled && topThumb) {
          setThumbnail(topThumb)
        }
      } catch {
        /* ignore top asset fetch failures */
      }
    }
    loadTopAsset()
    return () => {
      isCancelled = true
    }
  }, [isLoggedIn, thumbnail, setThumbnail])
  const defaultSpacing = 'container mx-auto px-10 sm:px-16 lg:px-20 xl:px-24'
  const resolvedContainer = `${containerClassName ?? defaultSpacing} h-16 flex items-center justify-between`

  return (
    <header className="border-b bg-white">
      <div className={resolvedContainer}>
        <div className="flex items-center gap-8">
          <Link href="/" className="cursor-pointer">
            <Image src={Logo} alt="iPiece" width={120} height={32} className="h-8 w-auto" />
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/offering"
              className={`${navBase} ${isOfferingActive ? 'after:w-full' : 'after:w-0 hover:after:w-full'}`}
            >
              {'\uACF5\uBAA8'}
            </Link>
            <Link
              href="/trading"
              className={`${navBase} ${isTradingActive ? 'after:w-full' : 'after:w-0 hover:after:w-full'}`}
            >
              {'2차거래'}
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              <img src={avatarSrc} alt="" className="h-6 w-6 rounded-[4px]" />
              <Link href="/mypage" className="text-sm font-semibold cursor-pointer">마이페이지</Link>
            </div>
          ) : (
            <>
              <Button asChild size="sm" className="bg-[#3386E5] text-white hover:bg-[#2a6bc4] cursor-pointer">
                <Link href="/auth/login">{'\uB85C\uADF8\uC778'}</Link>
              </Button>
              <Button asChild size="sm" className="bg-[#F2F2F7] text-[#303030] hover:bg-[#e5e5ea] cursor-pointer">
                <Link href="/auth/verification">{'\uD68C\uC6D0\uAC00\uC785'}</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
