import { TableCell, TableRow } from "@/components/ui/table"
import type { AssetListItem } from "./types"

interface AssetTableRowProps {
  asset: AssetListItem
}

function formatCurrency(value: number) {
  return value.toLocaleString("ko-KR")
}

function getTrendColor(value: number) {
  if (value > 0) return "text-[#E53333]"
  if (value < 0) return "text-[#3386E5]"
  return "text-gray-500"
}

export default function AssetTableRow({ asset }: AssetTableRowProps) {
  const profitRatePercent = asset.profitRate * 100
  const profitRateText = `${profitRatePercent > 0 ? "+" : ""}${profitRatePercent.toFixed(2)} %`
  const profitAmountText = `${asset.profit > 0 ? "+" : ""}${formatCurrency(asset.profit)} KRW`
  const trendColor = getTrendColor(asset.profit)
  const detailHref = `/trading/${asset.productId}`

  return (
    <TableRow>
      <TableCell className="w-1/6">
        <a href={detailHref} className="flex items-center gap-3" onClick={(event) => event.stopPropagation()}>
          <div className="h-10 w-10 overflow-hidden rounded-lg bg-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset.thumbnailImg || "/placeholder.svg"} alt={asset.productName} className="h-full w-full object-cover" />
          </div>
          <div>
            <div className="font-medium text-gray-900 hover:underline">{asset.productName}</div>
            <div className="text-xs text-gray-500">{asset.tokenName}</div>
          </div>
        </a>
      </TableCell>
      <TableCell className="w-1/6 text-center">
        <div className="font-medium text-gray-900">{asset.quantity}</div>
        <div className="text-xs text-gray-500">{asset.tokenName}</div>
      </TableCell>
      <TableCell className="w-1/6 text-right">
        <div className="font-medium text-gray-900">{formatCurrency(asset.avgBuyPrice)}</div>
        <div className="text-xs text-gray-500">KRW</div>
      </TableCell>
      <TableCell className="w-1/6 text-right">
        <div className="font-medium text-gray-900">{formatCurrency(asset.totalBuyPrice)}</div>
        <div className="text-xs text-gray-500">KRW</div>
      </TableCell>
      <TableCell className="w-1/6 text-right">
        <div className="font-medium text-gray-900">{formatCurrency(asset.currentValue)}</div>
        <div className="text-xs text-gray-500">KRW</div>
      </TableCell>
      <TableCell className="w-1/6 text-right">
        <div className={`font-medium ${trendColor}`}>{profitRateText}</div>
        <div className={`text-xs ${trendColor}`}>{profitAmountText}</div>
      </TableCell>
    </TableRow>
  )
}
