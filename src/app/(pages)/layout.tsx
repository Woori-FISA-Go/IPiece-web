import type { ReactNode } from "react"

import { PageShell } from "./components/PageShell"

type PagesLayoutProps = {
  children: ReactNode
}

export default function PagesLayout({ children }: PagesLayoutProps) {
  return <PageShell>{children}</PageShell>
}
