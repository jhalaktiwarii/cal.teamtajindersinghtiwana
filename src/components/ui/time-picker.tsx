"use client"

import * as React from "react"
import { Clock } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface TimePickerProps {
  date: Date | undefined
  setDate: (date: Date | undefined) => void
  className?: string
  minTime?: Date
}

export function TimePicker({ date, setDate, className, minTime }: TimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedTime, setSelectedTime] = React.useState(() => {
    if (!date) return { hour: 12, minute: 0, period: "AM" }
    const hours = date.getHours()
    return {
      hour: hours % 12 || 12,
      minute: date.getMinutes(),
      period: hours >= 12 ? "PM" : "AM"
    }
  })

  const periods = ["AM", "PM"]

  const updateTime = (update: Partial<typeof selectedTime>) => {
    const newTime = { ...selectedTime, ...update }
    setSelectedTime(newTime)

    if (date) {
      const newDate = new Date(date)
      const hours = newTime.period === "AM" ? 
        (newTime.hour === 12 ? 0 : newTime.hour) : 
        (newTime.hour === 12 ? 12 : newTime.hour + 12)
      newDate.setHours(hours)
      newDate.setMinutes(newTime.minute)
      newDate.setSeconds(0) // Set seconds to 0
      newDate.setMilliseconds(0) // Set milliseconds to 0
      
      // If minTime is provided, ensure the new time is not before it
      if (minTime) {
        if (newDate.getTime() >= minTime.getTime()) {
          setDate(newDate)
        }
      } else {
        setDate(newDate)
      }
    }
  }

  const [hourInput, setHourInput] = React.useState(selectedTime.hour.toString().padStart(2, "0"));
  const [minuteInput, setMinuteInput] = React.useState(selectedTime.minute.toString().padStart(2, "0"));

  React.useEffect(() => {
    setHourInput(selectedTime.hour.toString().padStart(2, "0"));
    setMinuteInput(selectedTime.minute.toString().padStart(2, "0"));
  }, [selectedTime.hour, selectedTime.minute]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal h-10 border-gray-300",
            !date && "text-muted-foreground",
            className
          )}
        >
          <Clock className="mr-2 h-4 w-4" />
          {date ? (
            date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })
          ) : (
            <span>Pick a time</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-4 flex flex-col items-center" align="start">
        <div className="mb-2 text-xs font-semibold tracking-widest text-gray-500 uppercase">Select Time</div>
        <div className="flex items-center justify-center gap-2 w-full">
          {/* Hour input */}
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={2}
            className="rounded-md border px-4 py-1 text-3xl font-bold w-16 text-center focus:outline-none focus:ring-2 focus:ring-violet-400 bg-violet-50 text-violet-700 border-violet-200 shadow-sm box-border"
            value={hourInput}
            onChange={e => {
              const val = e.target.value.replace(/\D/g, "");
              if (val.length > 2) {
                setHourInput(val.slice(0, 2));
              } else {
                setHourInput(val);
              }
            }}
            onBlur={e => {
              const val = e.target.value.replace(/\D/g, "");
              let num = Number(val);
              if (val === "" || num < 1) num = 1;
              if (num > 12) num = 12;
              setHourInput(num.toString().padStart(2, "0"));
              updateTime({ hour: num });
            }}
          />
          <div className="text-4xl font-bold text-gray-400 select-none">:</div>
          {/* Minute input */}
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={2}
            className="rounded-md border px-4 py-1 text-3xl font-bold w-16 text-center focus:outline-none focus:ring-2 focus:ring-violet-400 bg-gray-100 text-gray-900 border-gray-200 shadow-sm box-border"
            value={minuteInput}
            onChange={e => {
              const val = e.target.value.replace(/\D/g, "");
              if (val.length > 2) {
                setMinuteInput(val.slice(0, 2));
              } else {
                setMinuteInput(val);
              }
            }}
            onBlur={e => {
              const val = e.target.value.replace(/\D/g, "");
              let num = Number(val);
              if (val === "" || num < 0) num = 0;
              if (num > 59) num = 59;
              setMinuteInput(num.toString().padStart(2, "0"));
              updateTime({ minute: num });
            }}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                const val = (e.target as HTMLInputElement).value.replace(/\D/g, "");
                let num = Number(val);
                if (val === "" || num < 0) num = 0;
                if (num > 59) num = 59;
                setMinuteInput(num.toString().padStart(2, "0"));
                updateTime({ minute: num });
              }
            }}
          />
          {/* AM/PM Selector */}
          <div className="flex flex-col ml-4 gap-1">
            {periods.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => updateTime({ period: p })}
                className={cn(
                  "px-4 py-1 rounded-md border text-base font-semibold transition-all",
                  selectedTime.period === p
                    ? "bg-violet-50 text-violet-700 border-violet-300 shadow"
                    : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        {/* OK Button */}
        <div className="flex justify-center mt-5 w-full">
          <Button
            type="button"
            className="w-24 bg-violet-600 text-white hover:bg-violet-700 h-9 rounded-md font-medium transition-colors"
            onClick={() => setOpen(false)}
          >
            OK
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
