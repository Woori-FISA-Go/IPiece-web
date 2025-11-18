"use client"

import type { ReactNode } from "react"
import { usePathname } from "next/navigation"

import { Header } from "../main/layouts/Header"
import { Footer } from "../main/layouts/Footer"

const AUTH_PATH_PREFIX = "/auth"

type PageShellProps = {
  children: ReactNode
}

export function PageShell({ children }: PageShellProps) {
  const pathname = usePathname()
  const isAuthRoute = pathname?.startsWith(AUTH_PATH_PREFIX)

  if (isAuthRoute) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <div className="flex-1 flex flex-col">{children}</div>
      <Footer />
    </div>
  )
}
