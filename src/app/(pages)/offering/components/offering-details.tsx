import Image from "next/image"

import HighlightIcon from "../assets/point4.png"

const leftSummary = [
  { label: "글로버스트리트", value: "아이피스 IP 토큰 (DINOT)" },
  { label: "발행사", value: "아이피스 주식회사" },
  { label: "발행총액", value: "100,000,000 KRW (1,000,000 아이피스 토큰)" },
  { label: "토큰 종류", value: "ERC-1400 (Security Token Standard)" },
  { label: "거래예정시장", value: "아이피스 2차시장" },
]

const rightSummary = [
  { label: "공모기간", value: "2025.08.12 ~ 2025.12.12" },
  { label: "공모총액", value: "100,000,000 KRW" },
  { label: "발행토큰수", value: "1,000,000 아이피스 토큰" },
  { label: "공모가", value: "1 아이피스 토큰 × 100 KRW" },
]

const cautionTexts = [
  "본 자료는 투자 권유가 아닙니다. 투자여부는 반드시 확인해 주세요.",
  "투자자는 아이피스 홈페이지에서 공시 자료를 확인 후 결정해야 합니다.",
  "본 상품은 예금자보호법에 따라 보호되지 않으며 시장 변동에 따라 원금 손실(0~100%)이 발생할 수 있습니다.",
  "권리는 블록체인 기반 투자내역 스토리지에서 관리됩니다. 자세한 내용은 투자설명서를 참조하세요.",
  "투자 손익은 금융 규제 기관 및 법률 변경에 따라 달라질 수 있습니다.",
]

export function OfferingDetails() {
  return (
    <>
      <section className="bg-white py-16">
        <div
          className="w-full bg-[#e5e5e5] min-h-[1600px]"
          aria-label="상세페이지 이미지 영역"
        />
      </section>

      <section className="bg-white py-16">
        <div className="container mx-auto space-y-8 px-10 sm:px-16 lg:px-20 xl:px-24">
          <h3 className="text-xl font-bold text-[#1F2229]">수익증권 발행정보 요약</h3>
          <div className="grid gap-12 md:grid-cols-2">
            <SummaryTable title="IP 개요" rows={leftSummary} />
            <SummaryTable title="Dino 토큰 발행 정보" rows={rightSummary} />
          </div>
        </div>
      </section>

      <section className="bg-[#FBFBFF] py-16">
        <div className="container mx-auto space-y-2 px-10 text-xs leading-[1.4] text-[#434854] sm:px-16 lg:px-20 xl:px-24">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#1F2229]">
            <span role="img" aria-label="caution icon">
              ⚠️
            </span>
            투자 유의사항 안내
          </div>
          <div className="space-y-0">
            {cautionTexts.map((text, index) => (
              <p key={index}>{text}</p>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

type SummaryTableProps = {
  title: string
  rows: Array<{ label: string; value: string }>
}

function SummaryTable({ title, rows }: SummaryTableProps) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-[#2D6FE4]">{title}</h4>
      <table className="w-full border border-[#D9DEE8] border-collapse text-sm">
        <tbody>
          {rows.map(({ label, value }) => (
            <tr key={label} className="border-t border-[#D9DEE8] first:border-t-0">
              <th className="w-36 bg-[#F2F2F7] px-4 py-3 text-center font-bold text-[#5D6472] border-r border-[#D9DEE8]">
                {label}
              </th>
              <td className="px-5 py-3 text-[#1F2229] border-l border-[#D9DEE8]">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
