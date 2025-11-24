"use client"

import { createContext, useContext, useMemo, useState, type ReactNode } from "react"

type TopAssetContextValue = {
  thumbnail: string | null
  setThumbnail: (value: string | null) => void
}

const TopAssetContext = createContext<TopAssetContextValue | undefined>(undefined)

interface TopAssetProviderProps {
  children: ReactNode
}

export function TopAssetProvider({ children }: TopAssetProviderProps) {
  const [thumbnail, setThumbnail] = useState<string | null>(null)

  const value = useMemo(() => ({ thumbnail, setThumbnail }), [thumbnail])

  return <TopAssetContext.Provider value={value}>{children}</TopAssetContext.Provider>
}

export function useTopAssetThumbnail() {
  const context = useContext(TopAssetContext)
  if (!context) {
    throw new Error("useTopAssetThumbnail must be used within a TopAssetProvider")
  }
  return context
}
