import React from 'react';
import { CalendarEvent } from '../../types';

interface YearViewProps {
  events: CalendarEvent[];
  currentDate: Date;
  onEventClick: (event: CalendarEvent) => void;
  onDayDoubleClick: (date: Date) => void;
  onViewModeChange?: (mode: 'day' | 'week' | 'month' | 'year') => void;
  onDateChange?: (date: Date) => void;
}

export function YearView({ 
  events, 
  currentDate, 
  onDayDoubleClick,
  
  onDateChange,
}: YearViewProps) {
  const months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(currentDate.getFullYear(), i, 1);
    return {
      name: date.toLocaleString('default', { month: 'long' }),
      date,
    };
  });

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const hasEventsOnDay = (year: number, month: number, day: number) => {
    return events.some(event => {
      const eventDate = new Date(event.appointment.startTime);
      return (
        eventDate.getFullYear() === year &&
        eventDate.getMonth() === month &&
        eventDate.getDate() === day
      );
    });
  };

  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const handleDayClick = (date: Date, e: React.MouseEvent) => {
    // Prevent if clicking on an event
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }

    if (!date) return;

    // Create a new date with the clicked day's components
    const clickedDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    clickedDate.setHours(0, 0, 0, 0);

    if (onDateChange) {
      onDateChange(clickedDate);
    }
  };

  const handleDayDoubleClick = (date: Date, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!date) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Create a new date with the clicked day's components
    const clickedDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    clickedDate.setHours(0, 0, 0, 0);

    if (clickedDate < today) {
      return; // Prevent scheduling on past dates
    }

    onDayDoubleClick(clickedDate);
  };

  return (
    <div className="rounded-xl shadow-lg bg-white dark:bg-gray-900 overflow-hidden p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
        {months.map(({ name, date }) => (
          <div key={name} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="px-4 py-2 border-b dark:border-gray-700">
              <h3 className="font-medium text-gray-900 dark:text-white">{name}</h3>
            </div>
            <div className="p-2">
              <div className="grid grid-cols-7 gap-1">
                {weekDays.map((day, i) => (
                  <div
                    key={i}
                    className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-1"
                  >
                    {day}
                  </div>
                ))}
                {getDaysInMonth(date).map((day, i) => {
                  const hasEvents = day !== null && hasEventsOnDay(date.getFullYear(), date.getMonth(), day);
                  const dayDate = day ? new Date(date.getFullYear(), date.getMonth(), day) : null;
                  return (
                    <div
                      key={i}
                      className={`text-center text-sm p-1 ${
                        day === null
                          ? ''
                          : 'text-gray-900 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer'
                      } ${
                        day === currentDate.getDate() && date.getMonth() === currentDate.getMonth()
                          ? 'bg-[#d6ebf1]'
                          : ''
                      } ${
                        hasEvents
                          ? 'font-bold text-blue-700 dark:text-blue-400'
                          : ''
                      }`}
                      onClick={(e) => dayDate && handleDayClick(dayDate, e)}
                      onDoubleClick={(e) => dayDate && handleDayDoubleClick(dayDate, e)}
                    >
                      <span className={`${
                        day === currentDate.getDate() && date.getMonth() === currentDate.getMonth()
                          ? 'inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full'
                          : ''
                      }`}>
                        {day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}