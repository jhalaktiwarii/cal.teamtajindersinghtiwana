import React from 'react';
import { CalendarEvent } from '../../types';

interface MonthViewProps {
  events: CalendarEvent[];
  currentDate: Date;
  onDayDoubleClick: (date: Date, time?: string) => void;
  onDayClick?: (date: Date) => void;
  onAddAppointment?: (date: Date, time?: string) => void;
}

interface MonthGridProps {
  date: Date;
  currentDate: Date;
  events: CalendarEvent[];
  onDayDoubleClick: (date: Date, time?: string) => void;
  onDayClick?: (date: Date) => void;
}

const eventColors = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-yellow-500',
  'bg-pink-500',
  'bg-red-500',
  'bg-indigo-500',
];

const MonthGrid: React.FC<MonthGridProps> = ({
  date,
  currentDate,
  events,
  onDayDoubleClick,
  onDayClick,
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

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  
  const handleClick = (day: Date, e: React.MouseEvent) => {
    // Prevent if clicking on an event (events are now non-clickable)
    if ((e.target as HTMLElement).closest('button')) return;
    
    if (isMobile) {
      // On mobile, single click opens full schedule
      onDayClick?.(day);
      return;
    }
    
    // On desktop, single click opens full schedule
    onDayClick?.(day);
  };

  const handleDoubleClick = (day: Date) => {
    // Double click still opens appointment modal
    onDayDoubleClick(day, '');
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
          const isToday = day && day.getDate() === currentDate.getDate() && day.getMonth() === currentDate.getMonth() && day.getFullYear() === currentDate.getFullYear();
          const isCurrentMonth = day && day.getMonth() === date.getMonth();
          const eventsForDay = day ? getEventsForDay(day) : [];
          // Mobile: show max 2 events, then 'Show More' if overflow
          const maxEventsMobile = 2;
          const showMore = eventsForDay.length > maxEventsMobile;
          return (
            <div
              key={day?.toISOString() ?? index}
              className={`relative min-h-[60px] sm:min-h-[90px] md:min-h-[110px] rounded-xl border border-gray-200 bg-white flex flex-col px-1 sm:px-2 pt-1 sm:pt-2 pb-1 transition-all duration-150 cursor-pointer hover:border-blue-300 ${
                isToday ? 'border-2 border-blue-500 shadow-[0_0_0_2px_rgba(59,130,246,0.15)]' : ''
              } ${!isCurrentMonth ? 'bg-gray-50 text-gray-300' : ''}`}
              onClick={(e) => day && handleClick(day, e)}
              onDoubleClick={() => day && handleDoubleClick(day)}
            >
              {day && (
                <span className={`absolute top-1 left-1 sm:top-2 sm:left-2 text-xs font-semibold z-10 ${isToday ? 'text-blue-600' : isCurrentMonth ? 'text-gray-700' : 'text-gray-300'}`}>{day.getDate()}</span>
              )}
              <div className="flex flex-col gap-0.5 sm:gap-1 mt-5 sm:mt-6">
                {eventsForDay.slice(0, maxEventsMobile).map((event, i) => (
                  <div
                    key={event.appointment.id}
                    className={`w-full text-left rounded-lg px-1 sm:px-2 py-0.5 sm:py-1 truncate font-medium text-[11px] sm:text-xs text-white shadow-sm ${eventColors[i % eventColors.length]} ${isToday ? 'ring-2 ring-blue-200' : ''}`}
                    style={{ minHeight: 18 }}
                  >
                    {event.appointment.eventFrom || event.appointment.programName || 'No Title'}
                  </div>
                ))}
                {showMore && (
                  <div
                    className="w-full text-center text-[11px] text-blue-500 mt-0.5 underline cursor-pointer"
                    onClick={e => {
                      e.stopPropagation();
                      onDayClick?.(day!);
                    }}
                  >
                    +{eventsForDay.length - maxEventsMobile} more
                  </div>
                )}
              </div>
            </div>
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
}: MonthViewProps) {
  return (
    <div className="w-full h-full flex flex-col bg-white rounded-lg shadow-sm">
      <MonthGrid
        date={currentDate}
        currentDate={currentDate}
        events={events}
        onDayDoubleClick={onDayDoubleClick}
        onDayClick={onDayClick}
      />
    </div>
  );
}