import React from 'react';
import { CalendarEvent } from '../../types';

interface DayViewProps {
  events: CalendarEvent[];
  currentDate: Date;
  onEventClick: (event: CalendarEvent) => void;
  onDayDoubleClick: (date: Date, time?: string) => void;
  onAddAppointment?: (date: Date, time?: string) => void;
}

export function DayView({ events, currentDate, onEventClick, onDayDoubleClick, onAddAppointment }: DayViewProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const formatHour = (hour: number) => `${hour === 0 ? 12 : hour > 12 ? hour - 12 : hour} ${hour < 12 ? 'AM' : 'PM'}`;

  const handleTimeSlotDoubleClick = (time: string) => {
    const date = new Date(currentDate);
    onDayDoubleClick(date, time);
  };

  const handleAddAppointment = (time: string, date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    if (date < today) {
      return; // Prevent scheduling on past dates
    }
    onAddAppointment?.(date, time);
  };

  const calculateEventPosition = (event: CalendarEvent) => {
    const startTime = new Date(event.appointment.startTime);
    const startMinutes = startTime.getMinutes();
    const top = (startMinutes / 60) * 100;
    const height = 60; // Fixed height for events
    return {
      top: `${top}%`,
      height: `${height}%`,
      zIndex: 10
    };
  };

  const isEventVisible = (event: CalendarEvent, hour: number) => {
    const startTime = new Date(event.appointment.startTime);
    const eventStartHour = startTime.getHours();
    return (
      startTime.getFullYear() === currentDate.getFullYear() &&
      startTime.getMonth() === currentDate.getMonth() &&
      startTime.getDate() === currentDate.getDate() &&
      hour === eventStartHour
    );
  };

  const isToday = () => {
    const now = new Date();
    return (
      now.getFullYear() === currentDate.getFullYear() &&
      now.getMonth() === currentDate.getMonth() &&
      now.getDate() === currentDate.getDate()
    );
  };

  const eventCount = events.filter(event => {
    const startTime = new Date(event.appointment.startTime);
    return (
      startTime.getFullYear() === currentDate.getFullYear() &&
      startTime.getMonth() === currentDate.getMonth() &&
      startTime.getDate() === currentDate.getDate()
    );
  }).length;

  return (
    <div className="flex flex-col flex-1 w-full min-h-0 bg-white dark:bg-gray-900 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col items-center justify-center pt-8 pb-2 relative w-full">
        <div className="absolute right-8 top-8">
          {!isToday() && (
            <button
              className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium shadow-sm border border-gray-200"
              onClick={() => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                onDayDoubleClick(today);
              }}
            >
              Today
            </button>
          )}
        </div>
        <div className="text-5xl font-bold text-gray-900 dark:text-white mb-1">
          {currentDate.getDate()}
        </div>
        <div className="text-lg font-medium text-gray-500 dark:text-gray-300 mb-2">
          {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', year: 'numeric' })}
        </div>
        <div className="mb-4">
          <span className="inline-block px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm font-medium">
            {eventCount} event{eventCount !== 1 ? 's' : ''} today
          </span>
        </div>
      </div>
      {/* Hour Grid */}
      <div className="flex-1 flex flex-col justify-stretch overflow-y-auto w-full">
        <div className="flex flex-col w-full flex-1">
          {hours.map((hour) => (
            <div
              key={hour}
              className={`flex border-b border-gray-100 dark:border-gray-800 min-h-[56px] group relative`}
              onDoubleClick={() => handleTimeSlotDoubleClick(`${hour.toString().padStart(2, '0')}:00`)}
              onClick={() => handleAddAppointment(`${hour.toString().padStart(2, '0')}:00`, currentDate)}
            >
              <div className="w-16 py-4 text-right pr-4 text-sm text-gray-400 select-none">
                {formatHour(hour)}
              </div>
              <div className="flex-1 min-h-[56px] relative">
                {events.filter(event => isEventVisible(event, hour)).map((event) => {
                  const style = calculateEventPosition(event);
                  return (
                    <button
                      key={event.appointment.id}
                      onClick={() => onEventClick(event)}
                      className="absolute left-2 right-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-900/70 transition-colors shadow-sm border border-blue-100 dark:border-blue-800"
                      style={style}
                    >
                      <div className="flex flex-col h-full items-start">
                        <div className="w-full">
                          <div className="text-base font-semibold text-gray-900 dark:text-white truncate">
                            {event.appointment.eventFrom}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">
                            {new Date(event.appointment.startTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}