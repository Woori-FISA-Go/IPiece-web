import { Suspense } from "react"
import MainClient from "./MainClient"

export default function Home() {
  return (
    <Suspense fallback={null}>
      <MainClient />
    </Suspense>
  )
}
