import type { Item } from "../constants/data"

interface StatusPillProps {
  status: Item["status"]
}

export function StatusPill({ status }: StatusPillProps) {
  const isOffering = status === "OFFERING"
  const label = isOffering ? "공모 중" : "거래 중"
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        isOffering ? 'bg-[#DDEDFF] text-[#3386E5]' : 'bg-[#FFF2B5] text-[#FF9F00]'
      }`}
    >
      {label}
    </span>
  )
}
