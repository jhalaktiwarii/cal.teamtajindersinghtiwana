"use client"

import * as React from "react"
import { Clock, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface TimePickerProps {
  date: Date | undefined
  setDate: (date: Date | undefined) => void
  className?: string
  minTime?: Date
}

export function TimePicker({ date, setDate, className, minTime }: TimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [openUpward, setOpenUpward] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Generate time options
  const generateTimeOptions = () => {
    const options = [];
    
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) { // 15-minute intervals
        const time = new Date();
        time.setHours(hour, minute, 0, 0);
        
        // Skip times before minTime
        if (minTime && time < minTime) continue;
        
        const timeString = time.toLocaleTimeString([], { 
          hour: "2-digit", 
          minute: "2-digit", 
          hour12: true 
        });
        
        options.push({
          value: time.getTime(),
          label: timeString,
          time: time
        });
      }
    }
    
    return options;
  };

  const timeOptions = generateTimeOptions();
  const currentValue = date ? date.getTime() : undefined;
  const selectedOption = timeOptions.find(option => option.value === currentValue);

  const handleTimeSelect = (selectedTime: number) => {
    const newDate = new Date(selectedTime);
    setDate(newDate);
    setIsOpen(false);
  };

  const handleToggleDropdown = () => {
    if (!isOpen) {
      // Check available space when opening
      const rect = dropdownRef.current?.getBoundingClientRect();
      if (rect) {
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        const dropdownHeight = 192; // max-h-48 = 192px
        
        // Open upward if there's not enough space below but enough space above
        setOpenUpward(spaceBelow < dropdownHeight && spaceAbove > dropdownHeight);
      }
    }
    setIsOpen(!isOpen);
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        type="button"
        variant="outline"
        onClick={handleToggleDropdown}
        className={cn(
          "w-full justify-between text-left font-normal h-10 border-gray-300",
          !date && "text-gray-500",
          className
        )}
      >
        <div className="flex items-center">
          <Clock className="mr-2 h-4 w-4" />
          {selectedOption ? selectedOption.label : "Select time"}
        </div>
        <ChevronDown className={cn(
          "h-4 w-4 transition-transform",
          isOpen && "rotate-180"
        )} />
      </Button>
      
      {isOpen && (
        <div className={cn(
          "absolute z-50 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto",
          openUpward ? "bottom-full mb-1" : "top-full mt-1"
        )}>
          {timeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleTimeSelect(option.value)}
              className={cn(
                "w-full px-3 py-2 text-left text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none",
                option.value === currentValue && "bg-blue-50 text-blue-700"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
