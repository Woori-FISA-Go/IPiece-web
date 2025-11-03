import { TableCell, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { StaticImageData } from "next/image"

interface Asset {
  id: number
  name: string
  nameEn: string
  thumbnail: string | StaticImageData
  quantity: number
  quantityUnit: string
  avgPrice: number
  purchaseAmount: number
  evaluationAmount: number
  profitLoss: number
  profitLossAmount: number
}

interface AssetTableRowProps {
  asset: Asset
}

export default function AssetTableRow({ asset }: AssetTableRowProps) {
  const isProfit = asset.profitLoss > 0

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 rounded-lg">
            <AvatarImage src={typeof asset.thumbnail === 'string' ? asset.thumbnail : asset.thumbnail.src} alt={asset.name} />
            <AvatarFallback className="rounded-lg bg-amber-100 text-amber-700">{asset.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-gray-900">{asset.name}</div>
            <div className="text-xs text-gray-500">{asset.nameEn}</div>
          </div>
        </div>
      </TableCell>
      <TableCell className="text-center">
        <div className="font-medium text-gray-900">{asset.quantity}</div>
        <div className="text-xs text-gray-500">{asset.quantityUnit}</div>
      </TableCell>
      <TableCell className="text-right">
        <div className="font-medium text-gray-900">{asset.avgPrice.toLocaleString()}</div>
        <div className="text-xs text-gray-500">KRW</div>
      </TableCell>
      <TableCell className="text-right">
        <div className="font-medium text-gray-900">{asset.purchaseAmount.toLocaleString()}</div>
        <div className="text-xs text-gray-500">KRW</div>
      </TableCell>
      <TableCell className="text-right">
        <div className="font-medium text-gray-900">{asset.evaluationAmount.toLocaleString()}</div>
        <div className="text-xs text-gray-500">KRW</div>
      </TableCell>
      <TableCell className="text-right">
        <div className={`font-medium ${isProfit ? "text-[#E53333]" : "text-[#3386E5]"}`}>
          {isProfit ? "+" : ""}
          {asset.profitLoss.toFixed(2)} %
        </div>
        <div className={`text-xs ${isProfit ? "text-[#E53333]" : "text-[#3386E5]"}`}>
          {isProfit ? "+" : ""}
          {asset.profitLossAmount.toFixed(2)} KRW
        </div>
      </TableCell>
    </TableRow>
  )
}
