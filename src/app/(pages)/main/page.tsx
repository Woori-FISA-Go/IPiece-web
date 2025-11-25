"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { HeroBanner } from "./components/HeroBanner"
import { MarketCard } from "./components/MarketCard"
import type { Item, Banner, ItemStatus } from "./constants/data"
import { SAMPLE_BANNERS, SAMPLE_OFFERING, SAMPLE_TRADING } from "./constants/data"
import iconMore from "./assets/icon_more.png"
import { getAccessToken } from "@/lib/auth"

const apiBase = process.env.NEXT_PUBLIC_API_URL ?? ""

type HomeResponse = {
  banners?: Array<{
    bannerId: number
    imageUrl?: string
    title?: string
    description?: string
  }>
  offeringProducts?: ApiProduct[]
  tradingProducts?: ApiProduct[]
}

type ApiProduct = {
  productId: number
  productName: string
  currentPrice: number
  thumbnailImg?: string
  favorite?: boolean
}

export default function Home() {
  const [banners, setBanners] = useState<Banner[]>(SAMPLE_BANNERS)
  const [offering, setOffering] = useState<Item[]>(SAMPLE_OFFERING)
  const [trading, setTrading] = useState<Item[]>(SAMPLE_TRADING)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const loadData = async () => {
      try {
        const token = getAccessToken()
        const res = await fetch(`${apiBase}/v1/main/home`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        })
        if (!res.ok) {
          throw new Error(`Failed to fetch home data: ${res.status}`)
        }
        const data = (await res.json()) as HomeResponse
        if (!mounted) return

        const nextBanners = mapBanners(data.banners)
        const nextOffering = mapProducts(data.offeringProducts, "OFFERING")
        const nextTrading = mapProducts(data.tradingProducts, "TRADING")

        setBanners(nextBanners.length ? nextBanners : SAMPLE_BANNERS)
        setOffering(nextOffering.length ? nextOffering : SAMPLE_OFFERING)
        setTrading(nextTrading.length ? nextTrading : SAMPLE_TRADING)
        setErrorMessage(null)
      } catch (error) {
        console.error("Failed to load home data", error)
        if (!mounted) return
        setBanners(SAMPLE_BANNERS)
        setOffering(SAMPLE_OFFERING)
        setTrading(SAMPLE_TRADING)
        setErrorMessage("메인 데이터를 불러오지 못해 임시 배너를 표시하고 있어요. API 서버 상태를 확인해주세요.")
      }
    }

    loadData()

    return () => {
      mounted = false
    }
  }, [])

  return (
    <main className="text-[14px]">
      {errorMessage ? <div className="bg-[#FFF6E6] text-[#8A5800] px-6 py-3 text-center text-[13px]">{errorMessage}</div> : null}
      <HeroBanner banners={banners} />
      <div className="container mx-auto px-8 sm:px-12 lg:px-16 xl:px-20 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[18px] font-bold">{'\uACF5\uBAA8 \uC911'}</h2>
              <Link href="/offering" className="inline-flex items-center gap-1 text-[12px] text-gray-600 hover:text-gray-900 cursor-pointer">
                {'\uB354\uBCF4\uAE30'} <Image src={iconMore} alt="" width={12} height={12} className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {offering.slice(0, 4).map((item) => (
                <MarketCard key={item.id} item={item} />
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[18px] font-bold">{'\uAC70\uB798 \uC911'}</h2>
              <Link href="/trading" className="inline-flex items-center gap-1 text-[12px] text-gray-600 hover:text-gray-900 cursor-pointer">
                {'\uB354\uBCF4\uAE30'} <Image src={iconMore} alt="" width={12} height={12} className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {trading.slice(0, 4).map((item) => (
                <MarketCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

function resolveAssetUrl(path?: string) {
  if (!path) return undefined
  if (path.startsWith("http://") || path.startsWith("https://")) return path
  const normalized = path.startsWith("/") ? path : `/${path}`
  return `${apiBase}${normalized}`
}

function mapBanners(banners?: HomeResponse["banners"]): Banner[] {
  if (!banners) return []
  return banners.map((banner, index) => ({
    id: banner.bannerId?.toString() ?? `banner-${index}`,
    alt: banner.title || banner.description || "메인 배너",
    imageUrl: resolveAssetUrl(banner.imageUrl),
  }))
}

function mapProducts(products: ApiProduct[] | undefined, status: ItemStatus): Item[] {
  if (!products) return []
  return products.map((product) => ({
    id: product.productId.toString(),
    title: product.productName,
    priceKRW: product.currentPrice,
    status,
    liked: Boolean(product.favorite),
    imageUrl: resolveAssetUrl(product.thumbnailImg),
  }))
}
