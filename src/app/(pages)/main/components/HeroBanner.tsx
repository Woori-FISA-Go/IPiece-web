"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import type { Banner } from "../constants/data"

interface HeroBannerProps { banners: Banner[] }

export function HeroBanner({ banners }: HeroBannerProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [previousSlide, setPreviousSlide] = useState(0)
  const [direction, setDirection] = useState<1 | -1>(1) // 1: next(우측), -1: prev(좌측)
  const touchStartX = useRef<number | null>(null)
  const touchCurrentX = useRef<number | null>(null)
  const pointerStartX = useRef<number | null>(null)
  const pointerCurrentX = useRef<number | null>(null)
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const nextSlide = () => {
    setDirection(1)
    setPreviousSlide(currentSlide)
    setCurrentSlide((prev) => (prev + 1) % banners.length)
  }

  const prevSlide = () => {
    setDirection(-1)
    setPreviousSlide(currentSlide)
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)
  }

  useEffect(() => {
    if (banners.length <= 1) return
    if (autoplayRef.current) clearInterval(autoplayRef.current)
    autoplayRef.current = setInterval(nextSlide, 5000)
    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current)
    }
  }, [currentSlide, banners.length])

  return (
    <div
      className="relative w-full h-[480px] bg-gray-200 overflow-hidden"
      style={{ touchAction: "pan-y" }}
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0]?.clientX ?? null
        touchCurrentX.current = touchStartX.current
      }}
      onTouchMove={(e) => {
        touchCurrentX.current = e.touches[0]?.clientX ?? null
      }}
      onTouchEnd={(e) => {
        const endX = touchCurrentX.current ?? touchStartX.current ?? e.changedTouches[0]?.clientX ?? null
        if (touchStartX.current === null || endX === null) return
        const diff = endX - touchStartX.current
        if (Math.abs(diff) > 40) {
          diff < 0 ? nextSlide() : prevSlide()
        }
        touchStartX.current = null
        touchCurrentX.current = null
      }}
      onPointerDown={(e) => {
        pointerStartX.current = e.clientX
        pointerCurrentX.current = e.clientX
      }}
      onPointerMove={(e) => {
        pointerCurrentX.current = e.clientX
      }}
      onPointerUp={(e) => {
        const endX = pointerCurrentX.current ?? pointerStartX.current ?? e.clientX
        if (pointerStartX.current === null) return
        const diff = endX - pointerStartX.current
        if (Math.abs(diff) > 40) {
          diff < 0 ? nextSlide() : prevSlide()
        }
        pointerStartX.current = null
        pointerCurrentX.current = null
      }}
    >
      {banners.map((banner, index) => {
        const isActive = index === currentSlide
        const wasActive = index === previousSlide
        const exitDir = direction === 1 ? "-translate-x-full" : "translate-x-full"
        const enterDir = direction === 1 ? "translate-x-full" : "-translate-x-full"
        return (
          <div
            key={banner.id ?? index}
            className={`absolute inset-0 transition-all duration-700 ease-out ${
              isActive
                ? "opacity-100 translate-x-0 z-10"
                : wasActive
                  ? `opacity-0 ${exitDir} z-0`
                  : `opacity-0 ${enterDir} z-0`
            }`}
          >
            {banner.imageUrl ? (
              <Image
                src={banner.imageUrl || "/placeholder.svg"}
                alt={banner.alt}
                fill
                className="object-cover"
                priority={isActive}
                unoptimized
              />
            ) : (
              <div className="absolute inset-0 bg-gray-200" />
            )}
          </div>
        )
      })}

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
