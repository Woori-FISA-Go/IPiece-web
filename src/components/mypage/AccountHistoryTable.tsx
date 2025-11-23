import { useMemo, type ReactNode } from "react"
import { CustomCard as Card } from "@/components/ui/custom-card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Image from "next/image"
import noDataIcon from "@/assets/images/no_data_icon.svg"
import type { AccountHistoryItem } from "./types"

interface AccountHistoryTableProps {
  items: AccountHistoryItem[]
  isLoading?: boolean
  error?: string | null
  onRetry?: () => void
}

const TYPE_LABELS: Record<string, { label: string; variant: "red" | "blue" | "green" | "gray" }> = {
  TRADE_BUY: { label: "구매", variant: "red" },
  OFFERING_BUY: { label: "공모", variant: "red" },
  TRADE_SELL: { label: "판매", variant: "blue" },
  DIVIDEND: { label: "배당금", variant: "green" },
  DEPOSIT: { label: "입금", variant: "green" },
  WITHDRAW: { label: "출금", variant: "blue" },
}

const numberFormatter = new Intl.NumberFormat("ko-KR")

function formatDateLabel(value?: string) {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  const yyyy = date.getFullYear()
  const mm = `${date.getMonth() + 1}`.padStart(2, "0")
  const dd = `${date.getDate()}`.padStart(2, "0")
  const hh = `${date.getHours()}`.padStart(2, "0")
  const min = `${date.getMinutes()}`.padStart(2, "0")
  return `${yyyy}.${mm}.${dd} ${hh}:${min}`
}

function formatAmount(value?: number) {
  if (typeof value !== "number") return "-"
  const sign = value > 0 ? "+" : value < 0 ? "-" : ""
  return `${sign}${numberFormatter.format(Math.abs(value))} KRW`
}

function buildTokenLabel(quantity?: number, tokenName?: string) {
  if (typeof quantity !== "number") return null
  const sign = quantity > 0 ? "+" : quantity < 0 ? "-" : ""
  const name = tokenName ? ` ${tokenName}` : ""
  return `${sign}${Math.abs(quantity)}${name} Tokens`
}

export default function AccountHistoryTable({ items, isLoading, error, onRetry }: AccountHistoryTableProps) {
  const orderedItems = useMemo(
    () =>
      [...items].sort((a, b) => {
        const aDate = new Date(a.createdAt).getTime()
        const bDate = new Date(b.createdAt).getTime()
        return bDate - aDate
      }),
    [items],
  )

  let content: ReactNode = null

  if (isLoading) {
    content = (
      <div className="flex h-64 items-center justify-center text-sm text-gray-500">
        거래 내역을 불러오는 중입니다.
      </div>
    )
  } else if (error) {
    content = (
      <div className="flex h-64 flex-col items-center justify-center gap-3 text-center text-sm text-red-500">
        <p>{error}</p>
        {onRetry ? (
          <button type="button" onClick={onRetry} className="text-xs font-medium text-blue-600 hover:underline">
            다시 시도하기
          </button>
        ) : null}
      </div>
    )
  } else if (!orderedItems.length) {
    content = (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-gray-500">
        <Image src={noDataIcon} alt="조회된 거래 내역이 없습니다" width={96} height={96} className="mb-2" />
        <p className="text-sm">조회된 거래 내역이 없습니다.</p>
      </div>
    )
  } else {
    content = (
      <Table className="text-sm">
        <TableHeader>
          <TableRow className="bg-gray-50 text-xs uppercase tracking-tight text-gray-500">
            <TableHead className="font-medium pl-4">날짜</TableHead>
            <TableHead className="font-medium">유형</TableHead>
            <TableHead className="font-medium">거래내용</TableHead>
            <TableHead className="text-right font-medium pr-4">거래내역</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orderedItems.map((item) => {
            const typeKey = (item.txType || "").toUpperCase()
            const typeMeta = TYPE_LABELS[typeKey] ?? { label: item.txType ?? "-", variant: "gray" }
            const typeClass =
              typeMeta.variant === "red"
                ? "bg-red-50 text-red-600"
                : typeMeta.variant === "blue"
                  ? "bg-blue-50 text-blue-600"
                  : typeMeta.variant === "green"
                    ? "bg-green-50 text-green-600"
                    : "bg-gray-100 text-gray-700"
            const tokenLabel = buildTokenLabel(item.quantity, item.tokenName)
            const typeLabel = item.displayType ?? typeMeta.label

            return (
              <TableRow key={item.id} className="h-16 text-gray-800">
                <TableCell className="py-4 pl-4 text-sm">{formatDateLabel(item.createdAt)}</TableCell>
                <TableCell className="py-4 text-sm">
                  <span className={`rounded px-2 py-1 text-xs font-medium ${typeClass}`}>{typeLabel}</span>
                </TableCell>
                <TableCell className="py-4 text-sm">{item.description ?? "-"}</TableCell>
                <TableCell className="py-4 pr-4 text-right text-sm">
                  <div className="font-medium text-black">{formatAmount(item.amountKrw)}</div>
                  {tokenLabel ? <div className="mt-1 text-xs text-gray-400">{tokenLabel}</div> : null}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    )
  }

  return (
    <Card className="flex flex-col border border-gray-200">
      <div className="flex-grow overflow-y-auto max-h-[400px]">{content}</div>
    </Card>
  )
}
