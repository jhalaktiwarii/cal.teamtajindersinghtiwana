import React from 'react';
import { CalendarEvent } from '../../types';
import { getDaysInMonth } from '../../utils/dateUtils';

interface MonthGridProps {
  date: Date;
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onDayDoubleClick: (date: Date) => void;
  onDayClick: (date: Date) => void;
}

export function MonthGrid({ 
  date, 
  currentDate, 
  events, 
  onEventClick, 
  onDayDoubleClick,
  onDayClick
}: MonthGridProps) {
  const days = getDaysInMonth(date);

  const getEventsForDay = (day: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.appointment.startTime);
      eventDate.setHours(0, 0, 0, 0);
      const compareDate = new Date(
        day.getFullYear(),
        day.getMonth(),
        day.getDate()
      );
      compareDate.setHours(0, 0, 0, 0);
      return eventDate.getTime() === compareDate.getTime();
    });
  };

  const handleDayClick = (day: Date, e: React.MouseEvent) => {
    // Prevent if clicking on an event
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }

    if (!day) return;

    // Create a new date with the clicked day's components
    const clickedDate = new Date(
      day.getFullYear(),
      day.getMonth(),
      day.getDate()
    );
    clickedDate.setHours(0, 0, 0, 0);

    onDayClick(clickedDate);
  };

  const handleDoubleClick = (day: Date) => {
    onDayDoubleClick(day);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="grid grid-cols-7 bg-neutral-50 border-b border-neutral-200 sticky top-0 z-10">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="py-2 text-center text-sm font-medium text-neutral-600">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 flex-1">
        {days.map((day, index) => (
          <div
            key={day?.toISOString() ?? index}
            className={`
              min-h-[100px] p-2 relative border-r border-neutral-200 last:border-r-0
              ${day?.getDate() === currentDate.getDate() &&
              day?.getMonth() === currentDate.getMonth()
                ? 'bg-blue-50'
                : 'bg-white'}
              hover:bg-neutral-50 transition-colors cursor-pointer
            `}
            onClick={(e) => day && handleDayClick(day, e)}
            onDoubleClick={() => day && handleDoubleClick(day)}
          >
            {day && (
              <>
                <span className={`
                  inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium
                  ${day.getMonth() === currentDate.getMonth()
                    ? day.getDate() === currentDate.getDate()
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-900 hover:bg-neutral-100'
                    : 'text-gray-400'
                  }
                `}>
                  {day.getDate()}
                </span>
                <div className="mt-1 space-y-1 max-h-[60px] overflow-y-auto hide-scrollbar">
                  {getEventsForDay(day).map((event) => (
                    <button
                      key={event.appointment.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event);
                      }}
                      className={`
                        block w-full text-left px-2 py-1 rounded-lg text-xs font-medium
                        ${event.appointment.isUrgent
                          ? 'bg-red-50 text-red-700 hover:bg-red-100'
                          : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                        }
                        transition-colors
                      `}
                    >
                      <div className="flex items-center gap-1">
                        {event.appointment.isUrgent && (
                          <span className="text-red-500">⚡</span>
                        )}
                        <span className="truncate">{event.appointment.eventFrom || 'No Title'}</span>
                      </div>
                      {event.appointment.notes && (
                        <div className="text-xs text-neutral-500 truncate mt-0.5">
                          {event.appointment.notes}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}