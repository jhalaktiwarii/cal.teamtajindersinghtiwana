import React, { useRef, useState, useCallback } from "react";
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
  // 7-day window centered on active (3 days before, active, 3 days after)
  const days = [
    addDays(active, -3),
    addDays(active, -2),
    addDays(active, -1),
    active,
    addDays(active, 1),
    addDays(active, 2),
    addDays(active, 3)
  ];
  const key = days.map(d => d.toDateString()).join("|");

  // Touch/swipe functionality
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setCurrentX(e.touches[0].clientX);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;
    setCurrentX(e.touches[0].clientX);
  }, [isDragging]);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return;
    
    const diff = startX - currentX;
    const threshold = 50; // minimum swipe distance
    
    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        // Swipe left - go to next day
        onNext();
      } else {
        // Swipe right - go to previous day
        onPrev();
      }
    }
    
    setIsDragging(false);
    setStartX(0);
    setCurrentX(0);
  }, [isDragging, startX, currentX, onNext, onPrev]);

  // Mouse drag functionality for desktop
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setCurrentX(e.clientX);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    setCurrentX(e.clientX);
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;
    
    const diff = startX - currentX;
    const threshold = 50; // minimum drag distance
    
    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        // Drag left - go to next day
        onNext();
      } else {
        // Drag right - go to previous day
        onPrev();
      }
    }
    
    setIsDragging(false);
    setStartX(0);
    setCurrentX(0);
  }, [isDragging, startX, currentX, onNext, onPrev]);

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
      <div className="flex flex-col items-center gap-1 w-full max-w-full px-2">
        <div className="text-xs text-gray-400 opacity-60">← Swipe to navigate →</div>
        <div className="flex items-center gap-1 xs:gap-2 sm:gap-4 w-full justify-center">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 xs:h-8 xs:w-8 sm:h-10 sm:w-10"
            onClick={onPrev}
          >
            <ChevronLeft className="h-3 w-3 xs:h-4 xs:w-4" />
          </Button>
          
          <div 
            ref={containerRef}
            className="relative h-16 w-[280px] xs:w-[320px] sm:w-[400px] md:w-[480px] lg:w-[560px] overflow-hidden cursor-grab active:cursor-grabbing"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <AnimatePresence custom={direction} mode="popLayout">
              <motion.div
                key={key}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 400, damping: 35, mass: 0.6 }}
                className="grid h-16 w-full grid-cols-7 gap-0.5 xs:gap-1 sm:gap-2 md:gap-3"
              >
                {days.map((d) => {
                  const sel = isSameDay(d, active);
                  return (
                    <button
                      key={d.toDateString()}
                      onClick={() => onPick(d)}
                      className={[
                        "rounded-lg border px-0.5 xs:px-1 sm:px-2 md:px-3 py-1 sm:py-2 text-xs transition-all duration-200 min-w-0",
                        sel
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                          : "bg-white hover:bg-gray-50 border-gray-200 text-gray-900"
                      ].join(" ")}
                    >
                      <div className="font-medium text-xs truncate">
                        {format(d, "EEE")}
                      </div>
                      <div className="text-xs font-bold">
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

        <div className="flex justify-center mt-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-7 xs:h-8 sm:h-10 px-2 sm:px-4 text-xs xs:text-sm">
                <CalendarIcon className="h-3 w-3 xs:h-4 xs:w-4 mr-1 sm:mr-2" />
                <span className="hidden xs:inline">Pick Date</span>
                <span className="xs:hidden">Date</span>
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
    </div>
  );
} 