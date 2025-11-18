"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "./button"

type CalendarProps = {
  className?: string
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  month?: Date
  onMonthChange?: (month: Date) => void
  mode?: "single"
}

export function Calendar({
  className,
  selected,
  onSelect,
  month,
  onMonthChange,
  mode = "single",
}: CalendarProps) {
  const [internalMonth, setInternalMonth] = React.useState<Date>(month ?? new Date())

  React.useEffect(() => {
    if (month) {
      setInternalMonth(month)
    }
  }, [month?.getFullYear(), month?.getMonth()])

  const displayMonth = month ?? internalMonth

  const weeks = React.useMemo(() => buildCalendarMatrix(displayMonth), [displayMonth])

  const handleSelect = (day: Date, inCurrentMonth: boolean) => {
    if (mode !== "single") return
    if (!inCurrentMonth) {
      const newMonth = new Date(day.getFullYear(), day.getMonth(), 1)
      if (!month) {
        setInternalMonth(newMonth)
      }
      onMonthChange?.(newMonth)
    }
    onSelect?.(day)
  }

  const weekdays = ["일", "월", "화", "수", "목", "금", "토"]

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-2 text-center text-sm font-semibold text-gray-700">
        {displayMonth.getFullYear()}년 {displayMonth.getMonth() + 1}월
      </div>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="text-muted-foreground">
            {weekdays.map((day) => (
              <th key={day} className="h-8 w-8 text-center font-medium">
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, idx) => (
            <tr key={`week-${idx}`}>
              {week.map(({ date, inCurrentMonth }) => {
                const isSelected =
                  !!selected &&
                  selected.getFullYear() === date.getFullYear() &&
                  selected.getMonth() === date.getMonth() &&
                  selected.getDate() === date.getDate()

                return (
                  <td key={date.toISOString()} className="p-0 text-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "mx-auto my-1 h-8 w-8 rounded-full p-0 text-xs font-medium",
                        !inCurrentMonth && "text-gray-400",
                        isSelected && "bg-black text-white hover:bg-black",
                      )}
                      onClick={() => handleSelect(date, inCurrentMonth)}
                    >
                      {date.getDate()}
                    </Button>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function buildCalendarMatrix(month: Date) {
  const year = month.getFullYear()
  const monthIndex = month.getMonth()
  const firstOfMonth = new Date(year, monthIndex, 1)
  const startDay = firstOfMonth.getDay()

  const matrix: { date: Date; inCurrentMonth: boolean }[][] = []
  let current = new Date(year, monthIndex, 1 - startDay)

  for (let week = 0; week < 6; week++) {
    const row: { date: Date; inCurrentMonth: boolean }[] = []
    for (let day = 0; day < 7; day++) {
      row.push({
        date: new Date(current),
        inCurrentMonth: current.getMonth() === monthIndex,
      })
      current.setDate(current.getDate() + 1)
    }
    matrix.push(row)
  }

  return matrix
}
