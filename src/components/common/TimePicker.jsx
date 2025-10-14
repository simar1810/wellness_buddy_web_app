"use client"

import { useState, useEffect } from "react"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Clock } from "lucide-react"
import { setHours, setMinutes, format, parse } from "date-fns"
import clsx from "clsx"
import { toast } from "sonner"

function parseTime(timeStr) {
  if (!timeStr) return {
    defaultHours: 12,
    defaultMinutes: 0,
    defaultAmPm: "AM"
  }
  let date

  if (/am|pm/i.test(timeStr)) {
    date = parse(timeStr, "hh:mm a", new Date())
  } else {
    date = parse(timeStr, "HH:mm", new Date())
  }

  const hours = format(date, "hh")
  const minutes = format(date, "mm")
  const ampm = format(date, "a")

  return {
    defaultHours: hours,
    defaultMinutes: minutes,
    defaultAmPm: ampm
  }
}

export default function TimePicker({ selectedTime, setSelectedTime }) {
  const {
    defaultHours,
    defaultMinutes,
    defaultAmPm
  } = parseTime(selectedTime)
  const [hour, setHour] = useState(defaultHours)
  const [minute, setMinute] = useState(defaultMinutes)
  const [period, setPeriod] = useState(defaultAmPm)

  const hoursList = Array.from({ length: 12 }, (_, i) => i + 1)
  const minutesList = Array.from({ length: 60 }, (_, i) => i)

  useEffect(() => {
    let h = hour
    if (period === "PM" && h !== 12) h += 12
    if (period === "AM" && h === 12) h = 0

    let date = new Date()
    date = setHours(date, h)
    date = setMinutes(date, minute)
    setSelectedTime(format(date, "hh:mm a"))
  }, [hour, minute, period])

  const handleHourInput = (val) => {
    if (val === "") {
      setHour("")
      return
    }
    const h = Number(val)
    if (isNaN(h) || h < 1 || h > 12) {
      toast.error("Hour must be between 1 and 12")
      return
    }
    setHour(h)
  }

  // handle manual minute input
  const handleMinuteInput = (val) => {
    if (val === "") {
      setMinute("")
      return
    }
    const m = Number(val)
    if (isNaN(m) || m < 0 || m > 59) {
      toast.error("Minutes must be between 0 and 59")
      return
    }
    setMinute(m)
  }

  const handleHourSelect = (h) => setHour(h)
  const handleMinuteSelect = (m) => setMinute(m)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full mb-2 justify-between">
          {selectedTime || "Select time"}
          <Clock className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="bg-[white] p-0 w-auto [260px] gap-0 space-x-0 shadow-none border-gray-400">
        <div className="flex items-center justify-between !gap-0">

          <div className="py-4 flex flex-col items-center w-[86px] border-r border-gray-300">
            <Input
              type="number"
              min="1"
              max="12"
              value={hour}
              onChange={(e) => handleHourInput(e.target.value)}
              className="bg-[#F0F0F0] mb-2 w-[calc(100%-16px)] px-1 text-center text-sm border-gray-400 shadow-none"
              placeholder="HH"
            />
            {/* <ScrollArea className="h-[160px] w-full">
              <div className="flex flex-col items-center py-2 space-y-1">
                {hoursList.map((h) => (
                  <button
                    key={h}
                    onClick={() => handleHourSelect(h)}
                    className={clsx(
                      "px-4 py-1.5 rounded-md transition-colors duration-150 text-sm",
                      hour === h
                        ? "bg-black text-white font-bold"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </ScrollArea> */}
          </div>

          <div className="py-4 flex flex-col items-center w-[86px] border-r border-gray-300">
            <Input
              type="number"
              min="0"
              max="59"
              value={minute}
              onChange={(e) => handleMinuteInput(e.target.value)}
              className="bg-[#F0F0F0] mb-2 w-[calc(100%-16px)] px-1 text-center text-sm border-gray-400 shadow-none"
              placeholder="MM"
            />
            {/* <ScrollArea className="h-[160px] overflow-y-auto w-full !scroll-smooth">
              <div className="flex flex-col items-center py-2 space-y-1 !scroll-smooth">
                {minutesList.map((m) => (
                  <button
                    key={m}
                    onClick={() => handleMinuteSelect(m)}
                    className={clsx(
                      "px-4 py-1.5 rounded-md transition-colors duration-150 text-sm",
                      minute === m
                        ? "bg-black text-white font-bold"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {m.toString().padStart(2, "0")}
                  </button>
                ))}
              </div>
            </ScrollArea> */}
          </div>

          <div className="flex flex-col justify-center items-center w-[76px] space-y-2">
            {["AM", "PM"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={clsx(
                  "px-3 py-1 rounded-md text-sm transition-colors duration-150",
                  period === p
                    ? "bg-black text-white"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
