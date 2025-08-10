import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { addDays, format, isSameDay } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

export function DateStrip({
  active,
  direction,
  onPrev,
  onNext,
  onPick,
}: {
  active: Date;
  direction: 1 | -1 | 0;
  onPrev: () => void;
  onNext: () => void;
  onPick: (d: Date) => void;
}) {
  // 3-day window centered on active
  const days = [addDays(active, -1), active, addDays(active, 1)];
  const key = days.map(d => d.toDateString()).join("|");

  const variants = {
    enter: (dir: 1 | -1 | 0) => ({ x: dir === 0 ? 0 : dir * 40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: 1 | -1 | 0) => ({ x: dir === 0 ? 0 : -dir * 40, opacity: 0 }),
  };

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Current Date Display */}
      <div className="text-center">
        <div className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-900">
          {format(active, "EEEE, MMMM d, yyyy")}
        </div>
        <div className="text-sm text-gray-600">
          {format(active, "MMMM yyyy")}
        </div>
      </div>

      {/* Date Navigation Strip */}
      <div className="flex items-center justify-center gap-1 xs:gap-2 sm:gap-4">
        <div className="flex items-center gap-1 xs:gap-2 sm:gap-4">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 xs:h-8 xs:w-8 sm:h-10 sm:w-10"
            onClick={onPrev}
          >
            <ChevronLeft className="h-3 w-3 xs:h-4 xs:w-4" />
          </Button>
          
          <div className="relative h-16 w-[280px] xs:w-[320px] sm:w-[400px] overflow-hidden">
            <AnimatePresence custom={direction} mode="popLayout">
              <motion.div
                key={key}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 400, damping: 35, mass: 0.6 }}
                className="grid h-16 w-full grid-cols-3 gap-2 sm:gap-3"
              >
                {days.map((d) => {
                  const sel = isSameDay(d, active);
                  return (
                    <button
                      key={d.toDateString()}
                      onClick={() => onPick(d)}
                      className={[
                        "rounded-xl border px-2 xs:px-3 sm:px-4 py-1 sm:py-2 text-xs xs:text-sm transition-all duration-200 min-w-0",
                        sel
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                          : "bg-white hover:bg-gray-50 border-gray-200 text-gray-900"
                      ].join(" ")}
                    >
                      <div className="font-medium text-xs xs:text-sm truncate">
                        {format(d, "EEE")}
                      </div>
                      <div className="text-xs xs:text-sm font-bold">
                        {format(d, "d")}
                      </div>
                    </button>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>

          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 xs:h-8 xs:w-8 sm:h-10 sm:w-10"
            onClick={onNext}
          >
            <ChevronRight className="h-3 w-3 xs:h-4 xs:w-4" />
          </Button>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="h-7 xs:h-8 sm:h-10 px-2 sm:px-4">
              <CalendarIcon className="h-3 w-3 xs:h-4 xs:w-4 mr-1 sm:mr-2" />
              <span className="text-xs xs:text-sm">Pick Date</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="center">
            <Calendar
              mode="single"
              selected={active}
              onSelect={(date) => {
                if (date) {
                  onPick(date);
                }
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
} 