"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { subDays, subMonths, format } from "date-fns"

interface AccountFilterProps {
  activeFilter: string
  setActiveFilter: (filter: string) => void
  startDate: string
  setStartDate: (date: string) => void
  endDate: string
  setEndDate: (date: string) => void
}

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
  const [calendarDate, setCalendarDate] = useState(new Date(2025, 9, 23)) // October 23, 2025

  useEffect(() => {
    const today = new Date();
    let newStartDate = today;
    let newEndDate = today;

    if (activeFilter === "당일") {
      newStartDate = today;
      newEndDate = today;
    } else if (activeFilter === "1주일") {
      newStartDate = subDays(today, 7);
      newEndDate = today;
    } else if (activeFilter === "1개월") {
      newStartDate = subMonths(today, 1);
      newEndDate = today;
    } else if (activeFilter === "3개월") {
      newStartDate = subMonths(today, 3);
      newEndDate = today;
    }

    if (activeFilter !== "기간 설정") {
      setStartDate(format(newStartDate, "yyyy/MM/dd"));
      setEndDate(format(newEndDate, "yyyy/MM/dd"));
    }
  }, [activeFilter, setStartDate, setEndDate]);

  const filters = ["당일", "1주일", "1개월", "3개월", "기간 설정"]
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
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Filter Buttons */}
      {filters.map((filter) => (
        <Button
          key={filter}
          variant={activeFilter === filter ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveFilter(filter)}
          className={activeFilter === filter ? "bg-black hover:bg-gray-800 text-white" : ""}
        >
          {filter}
        </Button>
      ))}

      {/* Date Range Pickers */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Start Date */}
        <Popover open={showStartCalendar} onOpenChange={setShowStartCalendar}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="w-32 justify-start text-sm font-normal bg-transparent">
              {startDate}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="flex">
              {/* Calendar */}
              <div className="p-3">
                <div className="flex items-center justify-between mb-4">
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
                  onSelect={(date) => handleDateSelect(date, true)}
                  month={calendarDate}
                  onMonthChange={setCalendarDate}
                  className="rounded-md"
                />
              </div>

              {/* Year Selector */}
              <div className="border-l border-gray-200 w-24 overflow-y-auto max-h-[320px]">
                {years.map((year) => (
                  <button
                    key={year}
                    onClick={() => {
                      setSelectedYear(year)
                      const newDate = new Date(calendarDate)
                      newDate.setFullYear(Number.parseInt(year))
                      setCalendarDate(newDate)
                    }}
                    className={`w-full px-4 py-2 text-sm text-left hover:bg-gray-100 ${
                      selectedYear === year ? "bg-blue-500 text-white hover:bg-blue-600" : "text-gray-700"
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>

              {/* Month Selector */}
              <div className="border-l border-gray-200 w-32 overflow-y-auto max-h-[320px]">
                {months.map((month, index) => (
                  <button
                    key={month}
                    onClick={() => {
                      setSelectedMonth(String(index + 1).padStart(2, "0"))
                      const newDate = new Date(calendarDate)
                      newDate.setMonth(index)
                      setCalendarDate(newDate)
                    }}
                    className={`w-full px-4 py-2 text-sm text-left hover:bg-gray-100 ${
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
          </PopoverContent>
        </Popover>

        <span className="text-gray-500">-</span>

        {/* End Date */}
        <Popover open={showEndCalendar} onOpenChange={setShowEndCalendar}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="w-32 justify-start text-sm font-normal bg-transparent">
              {endDate}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="flex">
              {/* Calendar */}
              <div className="p-3">
                <div className="flex items-center justify-between mb-4">
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
                  onSelect={(date) => handleDateSelect(date, false)}
                  month={calendarDate}
                  onMonthChange={setCalendarDate}
                  className="rounded-md"
                />
              </div>

              {/* Year Selector */}
              <div className="border-l border-gray-200 w-24 overflow-y-auto max-h-[320px]">
                {years.map((year) => (
                  <button
                    key={year}
                    onClick={() => {
                      setSelectedYear(year)
                      const newDate = new Date(calendarDate)
                      newDate.setFullYear(Number.parseInt(year))
                      setCalendarDate(newDate)
                    }}
                    className={`w-full px-4 py-2 text-sm text-left hover:bg-gray-100 ${
                      selectedYear === year ? "bg-blue-500 text-white hover:bg-blue-600" : "text-gray-700"
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>

              {/* Month Selector */}
              <div className="border-l border-gray-200 w-32 overflow-y-auto max-h-[320px]">
                {months.map((month, index) => (
                  <button
                    key={month}
                    onClick={() => {
                      setSelectedMonth(String(index + 1).padStart(2, "0"))
                      const newDate = new Date(calendarDate)
                      newDate.setMonth(index)
                      setCalendarDate(newDate)
                    }}
                    className={`w-full px-4 py-2 text-sm text-left hover:bg-gray-100 ${
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
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
