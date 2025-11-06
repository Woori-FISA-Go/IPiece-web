"use client"

import type { OfferingStatus } from "@/lib/tmp-mock-offering"
import { OFFERING_STATUS_OPTIONS } from "@/lib/tmp-mock-offering"

interface OfferingStatusFilterProps {
  selected: OfferingStatus[]
  onChange: (statuses: OfferingStatus[]) => void
}

export function OfferingStatusFilter({ selected, onChange }: OfferingStatusFilterProps) {
  const toggleStatus = (status: OfferingStatus) => {
    if (selected.includes(status)) {
      onChange(selected.filter((s) => s !== status))
    } else {
      onChange([...selected, status])
    }
  }

  const isAllSelected = selected.length === 0

  return (
    <div className="space-y-4">
      <div>
        <button
          type="button"
          onClick={() => onChange([])}
          className={`w-full rounded border px-3 py-2 text-left text-sm transition ${isAllSelected ? "border-[#3386E5] bg-[#F0F6FF] text-[#3386E5]" : "border-gray-200 hover:bg-gray-100"}`}
        >
          전체
        </button>
      </div>
      <div className="space-y-2">
        {OFFERING_STATUS_OPTIONS.map(({ value, label }) => {
          const checked = selected.includes(value)
          return (
            <label
              key={value}
              className={`flex cursor-pointer items-center justify-between rounded border px-3 py-2 text-sm transition ${checked ? "border-[#3386E5] bg-[#F0F6FF] text-[#3386E5]" : "border-gray-200 hover:bg-gray-100"}`}
            >
              <span>{label}</span>
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggleStatus(value)}
                className="h-4 w-4"
              />
            </label>
          )
        })}
      </div>
    </div>
  )
}
