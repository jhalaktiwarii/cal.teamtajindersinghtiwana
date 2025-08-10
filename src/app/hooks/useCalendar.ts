import { useState } from 'react';
import { ViewMode } from '../types';

export function useCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');

  const nextPeriod = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      switch (viewMode) {
        case 'day':
          newDate.setDate(prev.getDate() + 1);
          break;
        case 'week':
          newDate.setDate(prev.getDate() + 7);
          break;
        case 'month':
          newDate.setMonth(prev.getMonth() + 1);
          break;
        case 'year':
          newDate.setFullYear(prev.getFullYear() + 1);
          break;
        case 'birthday':
          // Birthday view doesn't need date navigation
          return prev;
      }
      return newDate;
    });
  };

  const previousPeriod = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      switch (viewMode) {
        case 'day':
          newDate.setDate(prev.getDate() - 1);
          break;
        case 'week':
          newDate.setDate(prev.getDate() - 7);
          break;
        case 'month':
          newDate.setMonth(prev.getMonth() - 1);
          break;
        case 'year':
          newDate.setFullYear(prev.getFullYear() - 1);
          break;
        case 'birthday':
          // Birthday view doesn't need date navigation
          return prev;
      }
      return newDate;
    });
  };

  return {
    currentDate,
    setCurrentDate,
    viewMode,
    setViewMode,
    nextPeriod,
    previousPeriod,
  };
}