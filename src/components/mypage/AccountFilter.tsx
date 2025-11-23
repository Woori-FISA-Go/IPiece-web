"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ChevronLeft, ChevronRight } from "lucide-react"

export type FilterKey = "day" | "week" | "month1" | "month3" | "range"

interface AccountFilterProps {
  activeFilter: FilterKey
  setActiveFilter: (filter: FilterKey) => void
  startDate: string
  setStartDate: (date: string) => void
  endDate: string
  setEndDate: (date: string) => void
}

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "day", label: "당일" },
  { key: "week", label: "1주일" },
  { key: "month1", label: "1개월" },
  { key: "month3", label: "3개월" },
  { key: "range", label: "기간 설정" },
]

export default function AccountFilter({
  activeFilter,
  setActiveFilter,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}: AccountFilterProps) {
  const [showStartCalendar, setShowStartCalendar] = useState(false)
  const [showEndCalendar, setShowEndCalendar] = useState(false)
  const [selectedYear, setSelectedYear] = useState("2025")
  const [selectedMonth, setSelectedMonth] = useState("10")
  const [calendarDate, setCalendarDate] = useState(new Date(2025, 9, 23))

  const formatDate = (date: Date) =>
    `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`

  const subDays = (date: Date, amount: number) => {
    const next = new Date(date)
    next.setDate(next.getDate() - amount)
    return next
  }

  const subMonths = (date: Date, amount: number) => {
    const next = new Date(date)
    next.setMonth(next.getMonth() - amount)
    return next
  }

  useEffect(() => {
    const today = new Date()
    let newStartDate = today
    let newEndDate = today

    if (activeFilter === "week") {
      newStartDate = subDays(today, 7)
    } else if (activeFilter === "month1") {
      newStartDate = subMonths(today, 1)
    } else if (activeFilter === "month3") {
      newStartDate = subMonths(today, 3)
    }

    if (activeFilter !== "range") {
      setStartDate(formatDate(newStartDate))
      setEndDate(formatDate(newEndDate))
    }
  }, [activeFilter, setStartDate, setEndDate])

  const years = Array.from({ length: 12 }, (_, i) => (2021 + i).toString())
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const handleDateSelect = (date: Date | undefined, isStart: boolean) => {
    if (date) {
      const formatted = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`
      if (isStart) {
        setStartDate(formatted)
        setShowStartCalendar(false)
      } else {
        setEndDate(formatted)
        setShowEndCalendar(false)
      }
      setActiveFilter("range")
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {FILTERS.map((filter) => (
        <Button
          key={filter.key}
          variant={activeFilter === filter.key ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveFilter(filter.key)}
          className={activeFilter === filter.key ? "bg-black text-white hover:bg-gray-800" : ""}
        >
          {filter.label}
        </Button>
      ))}

      <div className="ml-auto flex items-center gap-2">
        <Popover open={showStartCalendar} onOpenChange={(open) => activeFilter === "range" && setShowStartCalendar(open)}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={activeFilter !== "range"}
              className={`w-32 justify-start text-sm font-normal ${
                activeFilter === "range" ? "bg-transparent" : "bg-gray-100 text-gray-400 pointer-events-none"
              }`}
            >
              {startDate}
            </Button>
          </PopoverTrigger>
          {activeFilter === "range" ? (
            <PopoverContent className="w-auto p-0" align="start">
              <DatePickerContent
                calendarDate={calendarDate}
                setCalendarDate={setCalendarDate}
                selectedYear={selectedYear}
                setSelectedYear={setSelectedYear}
                selectedMonth={selectedMonth}
                setSelectedMonth={setSelectedMonth}
                onSelect={(date) => handleDateSelect(date, true)}
              />
            </PopoverContent>
          ) : null}
        </Popover>

        <span className="text-gray-500">-</span>

        <Popover open={showEndCalendar} onOpenChange={(open) => activeFilter === "range" && setShowEndCalendar(open)}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={activeFilter !== "range"}
              className={`w-32 justify-start text-sm font-normal ${
                activeFilter === "range" ? "bg-transparent" : "bg-gray-100 text-gray-400 pointer-events-none"
              }`}
            >
              {endDate}
            </Button>
          </PopoverTrigger>
          {activeFilter === "range" ? (
            <PopoverContent className="w-auto p-0" align="start">
              <DatePickerContent
                calendarDate={calendarDate}
                setCalendarDate={setCalendarDate}
                selectedYear={selectedYear}
                setSelectedYear={setSelectedYear}
                selectedMonth={selectedMonth}
                setSelectedMonth={setSelectedMonth}
                onSelect={(date) => handleDateSelect(date, false)}
              />
            </PopoverContent>
          ) : null}
        </Popover>
      </div>
    </div>
  )
}

interface DatePickerContentProps {
  calendarDate: Date
  setCalendarDate: (date: Date) => void
  selectedYear: string
  setSelectedYear: (year: string) => void
  selectedMonth: string
  setSelectedMonth: (month: string) => void
  onSelect: (date: Date | undefined) => void
}

function DatePickerContent({
  calendarDate,
  setCalendarDate,
  selectedYear,
  setSelectedYear,
  selectedMonth,
  setSelectedMonth,
  onSelect,
}: DatePickerContentProps) {
  const years = Array.from({ length: 12 }, (_, i) => (2021 + i).toString())
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  return (
    <div className="flex">
      <div className="p-3">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {months[calendarDate.getMonth()]} {calendarDate.getFullYear()}
          </h3>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => {
                const newDate = new Date(calendarDate)
                newDate.setMonth(newDate.getMonth() - 1)
                setCalendarDate(newDate)
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => {
                const newDate = new Date(calendarDate)
                newDate.setMonth(newDate.getMonth() + 1)
                setCalendarDate(newDate)
              }}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Calendar
          mode="single"
          selected={calendarDate}
          onSelect={onSelect}
          month={calendarDate}
          onMonthChange={setCalendarDate}
          className="rounded-md"
        />
      </div>
      <div className="w-24 max-h-[320px] overflow-y-auto border-l border-gray-200">
        {years.map((year) => (
          <button
            key={year}
            onClick={() => {
              setSelectedYear(year)
              const newDate = new Date(calendarDate)
              newDate.setFullYear(Number.parseInt(year))
              setCalendarDate(newDate)
            }}
            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${
              selectedYear === year ? "bg-blue-500 text-white hover:bg-blue-600" : "text-gray-700"
            }`}
          >
            {year}
          </button>
        ))}
      </div>
      <div className="w-32 max-h-[320px] overflow-y-auto border-l border-gray-200">
        {months.map((month, index) => (
          <button
            key={month}
            onClick={() => {
              const padded = String(index + 1).padStart(2, "0")
              setSelectedMonth(padded)
              const newDate = new Date(calendarDate)
              newDate.setMonth(index)
              setCalendarDate(newDate)
            }}
            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${
              selectedMonth === String(index + 1).padStart(2, "0")
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "text-gray-700"
            }`}
          >
            {month}
          </button>
        ))}
      </div>
    </div>
  )
}
