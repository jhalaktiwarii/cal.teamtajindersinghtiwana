import React, { useRef } from 'react';
import { MonthView } from './MonthView';
import { WeekView } from './WeekView';
import { DayView } from './DayView';
import { YearView } from './YearView';
import { CalendarHeader } from './CalendarHeader';
import { CalendarEvent } from '../../types';
import { BirthdayView } from '../BirthdayView';
import type { Birthday } from '../../types/birthday';

interface CalendarViewProps {
  viewMode: string;
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onPrevious: () => void;
  onNext: () => void;
  onViewModeChange: (mode: string) => void;
  onAddAppointment: (date: Date, time?: string) => void;
  onDayDoubleClick: (date: Date, time?: string) => void;
  onDateChange: (date: Date) => void;
  birthdays: Birthday[];
  onSaveBirthday: (bday: Birthday) => void;
  onDeleteBirthday: (id: string) => void;
}

const viewModes: (string)[] = ['day', 'week', 'month', 'year', 'birthday'];

export function CalendarView({
  viewMode,
  currentDate,
  events,
  onEventClick,
  onPrevious,
  onNext,
  onViewModeChange,
  onAddAppointment,
  onDayDoubleClick,
  birthdays,
  onSaveBirthday,
  onDeleteBirthday,

}: CalendarViewProps) {
  // Swipe gesture support
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].screenX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].screenX;
    if (touchStartX.current !== null && touchEndX.current !== null) {
      const diff = touchEndX.current - touchStartX.current;
      if (Math.abs(diff) > 50) { // threshold
        const currentIdx = viewModes.indexOf(viewMode);
        if (diff < 0) {
          // Swipe left: next view
          const nextIdx = (currentIdx + 1) % viewModes.length;
          onViewModeChange(viewModes[nextIdx]);
        } else {
          // Swipe right: previous view
          const prevIdx = (currentIdx - 1 + viewModes.length) % viewModes.length;
          onViewModeChange(viewModes[prevIdx]);
        }
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div
      className="flex flex-col h-full min-h-0 bg-white dark:bg-gray-900 w-full max-w-full"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      <CalendarHeader
        currentDate={currentDate}
        viewMode={viewMode}
        onPrevious={onPrevious}
        onNext={onNext}
        onViewModeChange={onViewModeChange}
      />
      <div className="flex-1 min-h-0 overflow-auto hide-scrollbar w-full">
        {viewMode === 'birthday' ? (
          <BirthdayView 
            birthdays={birthdays}
            onSave={onSaveBirthday}
            onDelete={onDeleteBirthday}
          />
        ) : viewMode === 'month' ? (
          <MonthView
            events={events}
            currentDate={currentDate}
            onEventClick={onEventClick}
            onDayDoubleClick={onDayDoubleClick}
            onAddAppointment={onAddAppointment}
          />
        ) : viewMode === 'week' ? (
          <WeekView
            events={events}
            currentDate={currentDate}
            onEventClick={onEventClick}
            onDayDoubleClick={onDayDoubleClick}
            onAddAppointment={onAddAppointment}
          />
        ) : viewMode === 'day' ? (
          <DayView
            events={events}
            currentDate={currentDate}
            onEventClick={onEventClick}
            onDayDoubleClick={onDayDoubleClick}
          />
        ) : (
          <YearView
            events={events}
            currentDate={currentDate}
            onDayDoubleClick={onDayDoubleClick}
            onEventClick={onEventClick}
          />
        )}
      </div>
    </div>
  );
}