import Image from "next/image"

const points = [
  {
    icon: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/point1-3k1aPEqxUEsiBnXDg67oQz1DO5TpHP.png",
    label: "투자 포인트 1",
    title: "브랜드 협업력",
  },
  {
    icon: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/point2-Hszq4lY1MY9gMWVzfp69VdiPg7RnE8.png",
    label: "투자 포인트 2",
    title: "글로벌 성장성",
  },
  {
    icon: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/point3-PJlKre2a9qhoQ7t3OtJlIWEjoPkZAn.png",
    label: "투자 포인트 3",
    title: "팬덤 자생력",
  },
]

export function InvestmentPoints() {
  return (
    <section className="bg-white py-28">
      <div className="mx-auto max-w-[1200px] px-8 text-center sm:px-10">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-3 md:gap-12">
          {points.map(({ icon, label, title }) => (
            <div key={label} className="flex flex-col items-center gap-2">
              <div className="mx-auto mb-3 h-7 w-7">
                <Image src={icon} alt={label} width={28} height={28} className="h-full w-full object-contain" />
              </div>
              <p className="text-sm font-medium text-[#6B7280]">{label}</p>
              <p className="text-lg font-semibold text-[#1F2229]">{title}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
