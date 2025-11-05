"use client"
import { useEffect } from "react"

import { Header } from "../../main/layouts/Header"

const OFFERING_LINK_SELECTOR = 'a[href="/main?tab=offering"]'

export function OfferingHeader() {
  useEffect(() => {
    if (typeof document === "undefined") return
    const link = document.querySelector<HTMLElement>(OFFERING_LINK_SELECTOR)
    if (!link) return

    const originalClasses = link.className
    link.classList.remove("after:w-0")
    link.classList.add("after:w-full")

    return () => {
      link.className = originalClasses
    }
  }, [])

  return <Header />
}

