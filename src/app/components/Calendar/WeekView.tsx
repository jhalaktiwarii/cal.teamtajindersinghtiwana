import React, { useState } from 'react';
import { CalendarEvent } from '../../types';

import { FullPageSchedule } from './FullSchedule';

interface WeekViewProps {
  events: CalendarEvent[];
  currentDate: Date;
  onEventClick: (event: CalendarEvent) => void;
  onDayDoubleClick: (date: Date, time?: string) => void;
  onAddAppointment?: (date: Date, time?: string) => void;
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
  onAddAppointment 
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
    <div className="w-full h-full bg-white">
      {/* Day headers */}
      <div className="grid grid-cols-8 border-b border-gray-200">
        <div className="bg-white w-12"></div>
        {weekDates.map((date) => (
          <div
            key={date.toISOString()}
            className="py-3 text-center font-semibold text-gray-700 text-base border-l border-gray-100"
          >
            <div>{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
            <div className="text-lg font-bold mt-1">{date.getDate()}</div>
          </div>
        ))}
      </div>
      {/* Time grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-8">
          {/* Time column */}
          <div className="flex flex-col border-r border-gray-200 w-12 min-w-[3rem]">
            {hours.map((hour) => (
              <div
                key={hour}
                className="h-12 text-xs text-gray-400 flex items-center justify-end pr-1 border-b border-gray-100"
              >
                {new Date(0, 0, 0, hour).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })}
              </div>
            ))}
          </div>
          {/* Day columns */}
          {weekDates.map((date) => (
            <div key={date.toISOString()} className="flex flex-col border-r border-gray-100 relative min-w-0">
              {/* Render a single absolutely positioned container for all events in this day */}
              <div key={date.toISOString()} className="relative flex-1 h-full" style={{ minHeight: `${hours.length * 48}px` }}>
                {/* Render hour grid lines */}
                {hours.map((hour) => (
                  <div
                    key={`cell-${hour}-${date.getTime()}`}
                    className="h-12 border-b border-gray-100"
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
                      <div
                        key={event.appointment.id}
                        className={`absolute left-1 right-1 rounded-lg shadow-md px-3 py-1 flex flex-col justify-center ${eventColors[i % eventColors.length]} text-white cursor-pointer transition-all`}
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
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
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