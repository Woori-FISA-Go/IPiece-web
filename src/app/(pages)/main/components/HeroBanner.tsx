"use client"

import { useState } from "react"
import Image from "next/image"
import iconLeft from "../assets/icon_left.png"
import iconRight from "../assets/icon_right.png"
import type { Banner } from "../constants/data"

interface HeroBannerProps { banners: Banner[] }

export function HeroBanner({ banners }: HeroBannerProps) {
  const [currentSlide, setCurrentSlide] = useState(0)

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)
  }

  const currentBanner = banners[currentSlide] ?? { alt: "", imageUrl: "" }

  return (
    <div className="relative w-full h-[360px] bg-gray-200 overflow-hidden">
      {currentBanner.imageUrl ? (
        <Image
          src={currentBanner.imageUrl || "/placeholder.svg"}
          alt={currentBanner.alt}
          fill
          className="object-cover"
          priority
        />
      ) : (
        <div className="absolute inset-0" />
      )}

      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/80 hover:bg-white shadow-lg flex items-center justify-center transition-all z-10"
        aria-label="?댁쟾 ?щ씪?대뱶"
      >
        <Image src={iconLeft} alt="" width={24} height={24} />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/80 hover:bg-white shadow-lg flex items-center justify-center transition-all z-10"
        aria-label="?ㅼ쓬 ?щ씪?대뱶"
      >
        <Image src={iconRight} alt="" width={24} height={24} />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-all ${index === currentSlide ? "bg-white w-6" : "bg-white/50"}`}
            aria-label={`?щ씪?대뱶 ${index + 1}濡??대룞`}
          />
        ))}
      </div>
    </div>
  )
}


