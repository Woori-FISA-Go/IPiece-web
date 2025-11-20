import type { ReactNode } from "react"
import { Suspense } from "react"

import { PageShell } from "./components/PageShell"

type PagesLayoutProps = {
  children: ReactNode
}

export default function PagesLayout({ children }: PagesLayoutProps) {
  return (
    <Suspense fallback={null}>
      <PageShell>{children}</PageShell>
    </Suspense>
  )
}
