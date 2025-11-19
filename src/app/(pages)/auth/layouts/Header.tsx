"use client"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import Logo from "../../main/assets/Logo.png"
import { Button } from "../components/ui/button"
import { ACCESS_TOKEN_KEY } from "@/lib/auth"

export function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const avatarSrc = 'https://i.pravatar.cc/28'

  const pathname = usePathname()
  const searchParams = useSearchParams()
  const tab = searchParams?.get('tab')
  const onMain = pathname === '/' || pathname?.startsWith('/main')
  const isOfferingActive = onMain && tab === 'offering'
  const isTradingActive = onMain && tab === 'trading'
  const navBase =
    "text-sm font-semibold cursor-pointer relative after:content-[''] after:absolute after:left-0 after:-bottom-1.5 after:h-[2px] after:bg-current after:transition-all after:duration-200"

  useEffect(() => {
    if (typeof window === "undefined") return
    const hasAccessToken = !!localStorage.getItem(ACCESS_TOKEN_KEY)
    setIsLoggedIn(hasAccessToken)
  }, [])

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-8 sm:px-12 lg:px-16 xl:px-20 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/main" className="cursor-pointer">
            <Image src={Logo} alt="iPiece" width={120} height={32} className="h-8 w-auto" />
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/main?tab=offering"
              className={`${navBase} ${isOfferingActive ? 'after:w-full' : 'after:w-0 hover:after:w-full'}`}
            >
              {'공모'}
            </Link>
            <Link
              href="/main?tab=trading"
              className={`${navBase} ${isTradingActive ? 'after:w-full' : 'after:w-0 hover:after:w-full'}`}
            >
              {'증권 거래'}
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
                <Link href="/auth/login">{'로그인'}</Link>
              </Button>
              <Button asChild size="sm" className="bg-[#F2F2F7] text-[#303030] hover:bg-[#e5e5ea] cursor-pointer">
                <Link href="/auth/verification">{'회원가입'}</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
