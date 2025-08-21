import React, { useState } from 'react';
import { CalendarEvent } from '../../types';

import { FullPageSchedule } from './FullSchedule';

interface WeekViewProps {
  events: CalendarEvent[];
  currentDate: Date;
  onEventClick: (event: CalendarEvent) => void;
  onDayDoubleClick: (date: Date, time?: string) => void;
  onAddAppointment?: (date: Date, time?: string) => void;
  onDayClick?: (date: Date) => void;
}

const eventColors = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
];

export function WeekView({ 
  events, 
  currentDate, 
  onEventClick, 
  onDayDoubleClick,
  onAddAppointment,
  onDayClick
}: WeekViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const formatHour = (hour: number) => {
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const period = hour < 12 ? 'AM' : 'PM';
    return `${displayHour}:00 ${period}`;
  };

  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    return date;
  });

 
  const handleDayDoubleClick = (date: Date, hour: number) => {
    const time = formatHour(hour);
    onDayDoubleClick(date, time);
  };

  const handleCloseSchedule = () => {
    setShowSchedule(false);
    setSelectedDate(null);
  };

  return (
    <div className="w-full h-full bg-white" style={{ ['--gutter-w' as string]: '64px' }}>
      {/* Day headers */}
      <header
        className="
          grid
          [grid-template-columns:var(--gutter-w)_repeat(7,minmax(0,1fr))]
          w-full
          border-y border-gray-200
          divide-x divide-gray-200
          bg-white
        "
        role="row"
      >
        {/* Time gutter header cell (empty) */}
        <div className="h-full flex items-center justify-center text-xs text-gray-500 bg-white" aria-hidden>
          {/* Empty space for time gutter alignment */}
        </div>

        {/* Day headers */}
        {weekDates.map((date) => (
          <div
            key={date.toISOString()}
            role="columnheader"
            aria-label={`${date.toLocaleDateString('en-US', { weekday: 'long' })} ${date.getDate()}`}
            className="h-16 flex flex-col items-center justify-center text-sm font-medium py-3"
          >
            <div className="text-sm font-semibold text-gray-700">
              {date.toLocaleDateString('en-US', { weekday: 'short' })}
            </div>
            <div className="text-lg font-bold mt-1 text-gray-900">
              {date.getDate()}
            </div>
          </div>
        ))}
      </header>

      {/* Time grid */}
      <div className="flex-1 overflow-y-auto">
        <section
          className="
            grid
            [grid-template-columns:var(--gutter-w)_repeat(7,minmax(0,1fr))]
            w-full
            divide-x divide-gray-200
            border-b border-gray-200
          "
        >
          {/* Time column */}
          <aside className="flex flex-col border-r border-gray-200">
            {hours.map((hour) => (
              <div
                key={hour}
                className="h-12 text-xs text-gray-400 flex items-center justify-center border-b border-gray-200"
              >
                {new Date(0, 0, 0, hour).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })}
              </div>
            ))}
          </aside>

          {/* Day columns */}
          {weekDates.map((date) => (
            <div key={date.toISOString()} className="flex flex-col relative min-w-0">
              {/* Render a single absolutely positioned container for all events in this day */}
              <div key={date.toISOString()} className="relative flex-1 h-full" style={{ minHeight: `${hours.length * 48}px` }}>
                {/* Render hour grid lines */}
                {hours.map((hour) => (
                  <div
                    key={`cell-${hour}-${date.getTime()}`}
                    className="h-12 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={(e) => {
                      // Check if click originated from an event button
                      const target = e.target as HTMLElement;
                      const eventEl = target.closest<HTMLElement>("[data-event-id]");
                      if (eventEl) {
                        // Event click is handled by the button itself
                        return;
                      }
                      // Otherwise, treat as day/time click
                      onDayClick?.(date);
                    }}
                    onDoubleClick={() => handleDayDoubleClick(date, hour)}
                  />
                ))}
                {/* Render events absolutely positioned by time */}
                {events
                  .filter(event => {
                    const start = new Date(event.appointment.startTime);
                    return start.getDate() === date.getDate() && start.getMonth() === date.getMonth() && start.getFullYear() === date.getFullYear();
                  })
                  .map((event, i) => {
                    const startTime = new Date(event.appointment.startTime);
                    const startHour = startTime.getHours() + startTime.getMinutes() / 60;
                    const top = (startHour / 24) * (hours.length * 48);
                    const height = 48; // Fixed height for events
                    return (
                      <button
                        key={event.appointment.id}
                        type="button"
                        data-event-id={event.appointment.id}
                        aria-haspopup="dialog"
                        aria-label={`Open ${event.appointment.programName || event.appointment.eventFrom || 'appointment'} at ${startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}`}
                        className={`absolute left-1 right-1 rounded-lg shadow-md px-3 py-1 flex flex-col justify-center ${eventColors[i % eventColors.length]} text-white cursor-pointer transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-1`}
                        style={{
                          top: `${top}px`,
                          height: `${height}px`,
                          zIndex: 10,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick(event);
                        }}
                      >
                        <div className="font-semibold text-xs truncate">
                          {event.appointment.programName || event.appointment.eventFrom || 'No Title'}
                        </div>
                        <div className="text-[11px] mt-0.5 opacity-90 whitespace-nowrap">
                          {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>
          ))}
        </section>
      </div>
      {selectedDate && showSchedule && (
        <FullPageSchedule
          date={selectedDate}
          events={events.filter(event => {
            const eventDate = new Date(event.appointment.startTime);
            return (
              eventDate.getDate() === selectedDate.getDate() &&
              eventDate.getMonth() === selectedDate.getMonth() &&
              eventDate.getFullYear() === selectedDate.getFullYear()
            );
          })}
          onClose={handleCloseSchedule}
          onAddSchedule={(time, date) => {
            onAddAppointment?.(date || selectedDate, time);
            handleCloseSchedule();
          }}
        />
      )}
    </div>
  );
}