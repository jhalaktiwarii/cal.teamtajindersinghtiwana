import React from 'react';
import { CalendarEvent } from '../../types';
import { DayCell } from './DayCell';

interface MonthViewProps {
  events: CalendarEvent[];
  currentDate: Date;
  onDayDoubleClick: (date: Date, time?: string) => void;
  onDayClick?: (date: Date) => void;
  onAddAppointment?: (date: Date, time?: string) => void;
  onEventClick?: (event: CalendarEvent) => void;
}

interface MonthGridProps {
  date: Date;
  currentDate: Date;
  events: CalendarEvent[];
  onDayDoubleClick: (date: Date, time?: string) => void;
  onDayClick?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
}

const MonthGrid: React.FC<MonthGridProps> = ({
  date,
  currentDate,
  events,
  onDayDoubleClick,
  onDayClick,
  onEventClick,
}) => {
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const days = getDaysInMonth(date);

  const getEventsForDay = (day: Date) => {
    return events
      .filter((event) => {
        const eventDate = new Date(event.appointment.startTime);
        return (
          eventDate.getDate() === day.getDate() &&
          eventDate.getMonth() === day.getMonth() &&
          eventDate.getFullYear() === day.getFullYear()
        );
      })
      .sort((a, b) => {
        return new Date(a.appointment.startTime).getTime() - new Date(b.appointment.startTime).getTime();
      });
  };

  const handleDayClick = (day: Date) => {
    onDayClick?.(day);
  };

  const handleEventClick = (event: CalendarEvent) => {
    onEventClick?.(event);
  };

  return (
    <div className="w-full h-full flex flex-col overflow-auto thin-scrollbar">
      <div className="grid grid-cols-7 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-sm font-semibold text-gray-500 py-2 tracking-wide select-none">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 sm:gap-2 flex-1">
        {days.map((day, index) => {
          if (!day) {
            return (
              <div 
                key={index} 
                className="min-h-[60px] sm:min-h-[90px] md:min-h-[110px] rounded-xl border border-gray-200 bg-gray-50"
              />
            );
          }

          const isToday = day.getDate() === currentDate.getDate() && 
                         day.getMonth() === currentDate.getMonth() && 
                         day.getFullYear() === currentDate.getFullYear();
          const isCurrentMonth = day.getMonth() === date.getMonth();
          const eventsForDay = getEventsForDay(day);

          return (
            <DayCell
              key={day.toISOString()}
              date={day}
              events={eventsForDay}
              onOpenDay={handleDayClick}
              onOpenEvent={handleEventClick}
              isToday={isToday}
              isCurrentMonth={isCurrentMonth}
            />
          );
        })}
      </div>
    </div>
  );
};

export function MonthView({ 
  events, 
  currentDate, 
  onDayDoubleClick,
  onDayClick,
  onEventClick,
}: MonthViewProps) {
  return (
    <div className="w-full h-full flex flex-col bg-white rounded-lg shadow-sm">
      <MonthGrid
        date={currentDate}
        currentDate={currentDate}
        events={events}
        onDayDoubleClick={onDayDoubleClick}
        onDayClick={onDayClick}
        onEventClick={onEventClick}
      />
    </div>
  );
}