import type { OfferingDetail } from "../types"

type OfferingDetailsProps = {
  detail?: OfferingDetail | null
  isLoading?: boolean
}

const cautionTexts = [
  "본 자료는 투자 권유가 아닙니다. 투자에 앞서 반드시 위험을 확인해주세요.",
  "투자자는 아이피스 플랫폼 내 공시 자료를 확인 후 결정해야 합니다.",
  "증권상품은 예금자보호법의 보호 대상이 아니며 시장 변동성에 따라 원금 손실이 발생할 수 있습니다.",
  "권리는 블록체인 기반 투자자 계좌에 기록되어 관리됩니다.",
  "법령 및 규제 환경 변화에 따라 투자자 이익이 달라질 수 있습니다.",
]

export function OfferingDetails({ detail, isLoading }: OfferingDetailsProps) {
  const heroImage = resolveImage(detail?.detailImg || detail?.presentImg || detail?.thumbnailImg)

  const projectDisplayName = (() => {
    const project = detail?.projectName || detail?.productName
    const token = detail?.tokenName ? ` (${detail.tokenName})` : ""
    return project ? `${project}${token}` : "-"
  })()

  const issueAmountText = formatIssueAmount(detail)

  const infoRowsLeft = [
    { label: "프로젝트", value: projectDisplayName },
    { label: "발행인", value: detail?.owner || "-" },
    { label: "발행총액", value: issueAmountText },
    { label: "토큰 표준", value: detail?.tokenStandard || "-" },
    { label: "거래소 상장", value: detail?.exchangeListing || "-" },
  ]

  const infoRowsRight = [
    {
      label: "공모기간",
      value: formatOfferingPeriod(detail?.offeringStartDate, detail?.offeringEndDate) ?? "-",
    },
    { label: "공모총액", value: formatOfferingTotal(detail) },
    {
      label: "발행토큰수",
      value: formatTokenCount(detail?.tokenQuantity ?? detail?.offeringTokens, detail?.tokenName) ?? "-",
    },
    {
      label: "공모가",
      value: detail?.offeringPrice
        ? `1 ${detail?.tokenName ?? "Token"} Tokens 당 ${detail.offeringPrice.toLocaleString("ko-KR")}원`
        : "-",
    },
  ]

  return (
    <>
      <section className="bg-white">
        <div className="w-full">
          {heroImage ? (
            <img src={heroImage} alt={detail?.productName ?? "공모 이미지"} className="block w-full h-auto object-cover" />
          ) : (
            <div className="flex h-64 items-center justify-center bg-[#f0f0f0] text-sm text-gray-400">
              {isLoading ? "이미지를 불러오는 중입니다." : "제공된 이미지가 없습니다."}
            </div>
          )}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container mx-auto space-y-8 px-10 sm:px-16 lg:px-20 xl:px-24">
          <h3 className="text-xl font-bold text-[#1F2229]">발행 개요</h3>
          <div className="grid gap-12 md:grid-cols-2">
            <SummaryTable title="IP 개요" rows={infoRowsLeft} />
            <SummaryTable title="토큰 공모 정보" rows={infoRowsRight} />
          </div>
        </div>
      </section>

      <section className="bg-[#FBFBFF] py-16">
        <div className="container mx-auto space-y-3 px-10 text-xs leading-relaxed text-[#434854] sm:px-16 lg:px-20 xl:px-24">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#1F2229]">
            <span role="img" aria-label="caution icon">
              ⚠️
            </span>
            투자 유의사항
          </div>
          <div className="space-y-1">
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
  rows: Array<{ label: string; value?: string | null }>
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
              <td className="px-5 py-3 text-[#1F2229] border-l border-[#D9DEE8]">{value || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function formatCurrency(value?: number) {
  if (typeof value !== "number") return undefined
  return `${value.toLocaleString("ko-KR")} KRW`
}

function formatTokenCount(value?: number, tokenName?: string) {
  if (typeof value !== "number") return undefined
  return `${value.toLocaleString("ko-KR")} ${tokenName ?? "Tokens"}`
}

function formatOfferingPeriod(start?: string, end?: string) {
  const startText = formatDate(start)
  const endText = formatDate(end)
  if (startText && endText) return `${startText} ~ ${endText}`
  return startText || endText || undefined
}

function formatIssueAmount(detail?: OfferingDetail | null) {
  if (!detail) return "-"
  if (typeof detail.offeringAmount !== "number" || typeof detail.offeringPrice !== "number") {
    return formatCurrency(detail.issueAmount) ?? "-"
  }
  const total = detail.offeringAmount * detail.offeringPrice
  const totalFormatted = total.toLocaleString("ko-KR")
  const tokensText = formatTokenCount(detail.offeringAmount, detail.tokenName) ?? ""
  return `${totalFormatted} KRW (${tokensText})`
}

function formatOfferingTotal(detail?: OfferingDetail | null) {
  if (!detail) return "-"
  if (typeof detail.offeringAmount === "number" && typeof detail.offeringPrice === "number") {
    const total = detail.offeringAmount * detail.offeringPrice
    return `${total.toLocaleString("ko-KR")} KRW`
  }
  return formatCurrency(detail.offeringAmount ?? detail.issueAmount) ?? "-"
}

function formatDate(value?: string) {
  if (!value) return undefined
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return undefined
  const yyyy = date.getFullYear()
  const mm = `${date.getMonth() + 1}`.padStart(2, "0")
  const dd = `${date.getDate()}`.padStart(2, "0")
  return `${yyyy}.${mm}.${dd}`
}

function resolveImage(src?: string) {
  if (!src) return undefined
  if (src.startsWith("http://") || src.startsWith("https://")) return src
  const base = process.env.NEXT_PUBLIC_API_URL ?? ""
  const normalized = src.startsWith("/") ? src : `/${src}`
  return `${base}${normalized}`
}
