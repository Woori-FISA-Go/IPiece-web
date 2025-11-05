import type { ReactNode } from "react"
import Image from "next/image"
import iconMore from "../assets/icon_more.png"

interface SectionProps {
  title: string
  children: ReactNode
}

export function Section({ title, children }: SectionProps) {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{title}</h2>
          <a href="#" className="text-sm text-gray-600 hover:text-[#3386E5] flex items-center gap-1 transition-colors cursor-pointer">
            더보기
            <Image src={iconMore} alt="" width={16} height={16} />
          </a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">{children}</div>
      </div>
    </section>
  )
}
