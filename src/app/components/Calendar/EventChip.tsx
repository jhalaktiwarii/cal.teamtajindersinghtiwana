import React from "react";
import { CalendarEvent } from "../../types";

const eventColors = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-yellow-500',
  'bg-pink-500',
  'bg-red-500',
  'bg-indigo-500',
];

export function EventChip({
  event,
  onOpen,
  isToday = false,
  index = 0,
}: {
  event: CalendarEvent;
  onOpen: () => void;
  isToday?: boolean;
  index?: number;
}) {
  // Button = accessible; also mark with data- attribute for the cell's event delegation
  const onClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    // Stop bubbling to be extra safe on future refactors
    e.stopPropagation();
    onOpen();
  };

  const colorClass = event.appointment.isUrgent 
    ? 'bg-red-500 hover:bg-red-600' 
    : eventColors[index % eventColors.length];

  const todayRing = isToday ? 'ring-2 ring-blue-200' : '';

  return (
    <button
      type="button"
      data-event-id={event.appointment.id}
      onClick={onClick}
      aria-haspopup="dialog"
      aria-label={`Open ${event.appointment.eventFrom || event.appointment.programName || 'appointment'}`}
      className={`
        w-full text-left rounded-lg px-1 sm:px-2 py-0.5 sm:py-1 truncate font-medium 
        text-[11px] sm:text-xs text-white shadow-sm transition-colors
        focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-1
        ${colorClass} ${todayRing}
      `}
      style={{ minHeight: 18 }}
    >
      <div className="flex items-center gap-1">
        {event.appointment.isUrgent && (
          <span className="text-red-200">⚡</span>
        )}
        <span className="truncate">
          {event.appointment.eventFrom || event.appointment.programName || 'No Title'}
        </span>
      </div>
      {event.appointment.notes && (
        <div className="text-[10px] text-white/80 truncate mt-0.5">
          {event.appointment.notes}
        </div>
      )}
    </button>
  );
} 