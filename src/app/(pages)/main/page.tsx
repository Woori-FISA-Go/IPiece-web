import { Header } from "./layouts/Header"
import { Footer } from "./layouts/Footer"
import { HeroBanner } from "./components/HeroBanner"
import { MarketCard } from "./components/MarketCard"
import type { Item, Banner } from "./constants/data"
import { SAMPLE_OFFERING, SAMPLE_TRADING, SAMPLE_BANNERS } from "./constants/data"
import Image from "next/image"
import iconMore from "./assets/icon_more.png"
export default function Home() {
  const offering: Item[] = SAMPLE_OFFERING
  const trading: Item[] = SAMPLE_TRADING
  const banners: Banner[] = SAMPLE_BANNERS

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <HeroBanner banners={banners} />
      <main className="flex-1 text-[14px]">
        <div className="container mx-auto px-8 sm:px-12 lg:px-16 xl:px-20 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[18px] font-bold">{'\uACF5\uBAA8 \uC911'}</h2>
                <a href="#" className="inline-flex items-center gap-1 text-[12px] text-gray-600 hover:text-gray-900 cursor-pointer">
                  {'\uB354\uBCF4\uAE30'} <Image src={iconMore} alt="" width={12} height={12} className="h-3 w-3" />
                </a>
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
                <a href="#" className="inline-flex items-center gap-1 text-[12px] text-gray-600 hover:text-gray-900 cursor-pointer">
                  {'\uB354\uBCF4\uAE30'} <Image src={iconMore} alt="" width={12} height={12} className="h-3 w-3" />
                </a>
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
      <Footer />
    </div>
  )
}

