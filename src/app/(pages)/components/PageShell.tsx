"use client"

import type { ReactNode } from "react"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

import { Header } from "../main/layouts/Header"
import { Footer } from "../main/layouts/Footer"
import { TopAssetProvider } from "../context/TopAssetContext"

const AUTH_PATH_PREFIX = "/auth"
const ADMIN_PATH_PREFIX = "/admin"

type LayoutSpacing = {
  header: string
  footer: string
  footerBackground?: string
}

const DEFAULT_SPACING: LayoutSpacing = {
  header: "container mx-auto px-10 sm:px-16 lg:px-20 xl:px-24",
  footer: "container mx-auto px-8 sm:px-12 lg:px-16 xl:px-20",
}

const LAYOUT_VARIANTS: Array<{
  test: (path: string) => boolean
  spacing: LayoutSpacing
}> = [
  {
    test: (path) => /^\/trading\/[^/]+$/.test(path),
    spacing: {
      header: "mx-auto w-full max-w-[1680px] px-6 lg:px-12",
      footer: "mx-auto w-full max-w-[1680px] px-6 lg:px-12",
      footerBackground: "bg-white",
    },
  },
  {
    test: (path) => path === "/trading",
    spacing: {
      header: "mx-auto w-full max-w-[1280px] px-6",
      footer: "mx-auto w-full max-w-[1280px] px-6",
    },
  },
  {
    test: (path) => path === "/" || path.startsWith("/main"),
    spacing: {
      header: "container mx-auto px-8 sm:px-12 lg:px-16 xl:px-20",
      footer: "container mx-auto px-8 sm:px-12 lg:px-16 xl:px-20",
    },
  },
  {
    test: (path) => path.startsWith("/offering"),
    spacing: {
      header: "mx-auto w-full max-w-[1280px] px-6",
      footer: "mx-auto w-full max-w-[1280px] px-6",
    },
  },
  {
    test: (path) => path.startsWith("/mypage"),
    spacing: {
      header: "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8",
      footer: "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8",
    },
  },
]

function resolveSpacing(pathname?: string | null): LayoutSpacing {
  if (!pathname) return DEFAULT_SPACING
  const normalized = pathname.endsWith("/") && pathname.length > 1 ? pathname.slice(0, -1) : pathname
  const match = LAYOUT_VARIANTS.find((variant) => variant.test(normalized))
  return match?.spacing ?? DEFAULT_SPACING
}

type PageShellProps = {
  children: ReactNode
}

export function PageShell({ children }: PageShellProps) {
  const pathname = usePathname()
  const isShellHiddenRoute =
    pathname?.startsWith(AUTH_PATH_PREFIX) || pathname?.startsWith(ADMIN_PATH_PREFIX)
  const [spacing, setSpacing] = useState<LayoutSpacing>(DEFAULT_SPACING)

  useEffect(() => {
    setSpacing(resolveSpacing(pathname))
  }, [pathname])

  if (isShellHiddenRoute) {
    return <>{children}</>
  }

  return (
    <TopAssetProvider>
      <div className="min-h-screen flex flex-col bg-white">
        <Header containerClassName={spacing.header} />
        <div className="flex-1 flex flex-col">{children}</div>
        <Footer containerClassName={spacing.footer} backgroundClassName={spacing.footerBackground} />
      </div>
    </TopAssetProvider>
  )
}
