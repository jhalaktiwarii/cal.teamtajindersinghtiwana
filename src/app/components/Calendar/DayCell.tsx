import React from "react";
import { CalendarEvent } from "../../types";
import { EventChip } from "./EventChip";

export type DayCellProps = {
  date: Date;
  events: CalendarEvent[];
  onOpenDay: (date: Date) => void;
  onOpenEvent: (event: CalendarEvent) => void;
  isToday?: boolean;
  isCurrentMonth?: boolean;
  className?: string;
};

export function DayCell({ 
  date, 
  events, 
  onOpenDay, 
  onOpenEvent, 
  isToday = false,
  isCurrentMonth = true,
  className = ""
}: DayCellProps) {
  const cellRef = React.useRef<HTMLDivElement>(null);

  // Single handler on the CELL that decides where the click came from.
  const handleCellClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;

    // If the click originated on (or inside) an appointment, open the event instead.
    const eventEl = target.closest<HTMLElement>("[data-event-id]");
    if (eventEl && cellRef.current?.contains(eventEl)) {
      const eventId = eventEl.dataset.eventId!;
      const event = events.find(ev => ev.appointment.id === eventId);
      if (event) {
        onOpenEvent(event);
        return;
      }
    }

    // Otherwise, treat it as a background click → open the day page
    onOpenDay(date);
  };

  const handleCellKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Make the whole cell open the day with keyboard
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onOpenDay(date);
    }
  };

  const baseClasses = `
    relative min-h-[60px] sm:min-h-[90px] md:min-h-[110px] rounded-xl border border-gray-200 
    bg-white flex flex-col px-1 sm:px-2 pt-1 sm:pt-2 pb-1 transition-all duration-150 
    cursor-pointer hover:border-blue-300 focus:outline-none focus-visible:ring-2 
    focus-visible:ring-indigo-500 focus-visible:ring-offset-2
  `;

  const todayClasses = isToday ? 'border-2 border-blue-500 shadow-[0_0_0_2px_rgba(59,130,246,0.15)]' : '';
  const monthClasses = !isCurrentMonth ? 'bg-gray-50 text-gray-300' : '';
  const dateClasses = isToday ? 'text-blue-600' : isCurrentMonth ? 'text-gray-700' : 'text-gray-300';

  return (
    <div
      ref={cellRef}
      role="gridcell"
      aria-label={`Day ${date.toLocaleDateString()}`}
      tabIndex={0}
      onClick={handleCellClick}
      onKeyDown={handleCellKeyDown}
      className={`${baseClasses} ${todayClasses} ${monthClasses} ${className}`}
    >
      {/* Date badge / corner number */}
      <span className={`absolute top-1 left-1 sm:top-2 sm:left-2 text-xs font-semibold z-10 ${dateClasses}`}>
        {date.getDate()}
      </span>

      {/* Appointments list */}
      <div className="flex flex-col gap-0.5 sm:gap-1 mt-5 sm:mt-6">
        {events.map((event) => (
          <EventChip
            key={event.appointment.id}
            event={event}
            onOpen={() => onOpenEvent(event)}
            isToday={isToday}
          />
        ))}
      </div>
    </div>
  );
} 