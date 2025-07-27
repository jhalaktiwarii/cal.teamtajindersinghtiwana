import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarHeaderProps {
  currentDate: Date;
  viewMode: string;
  onPrevious: () => void;
  onNext: () => void;
  onViewModeChange: (mode: string) => void;
}

export function CalendarHeader({
  currentDate,
  viewMode,
  onPrevious,
  onNext,
  onViewModeChange,
}: CalendarHeaderProps) {
  const formatDate = () => {
    const options: Intl.DateTimeFormatOptions = {
      month: 'long',
      year: 'numeric',
    };
    return currentDate.toLocaleDateString('en-US', options);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 w-full items-center sticky top-0 z-20 bg-white dark:bg-gray-900 shadow">
      <div className="flex justify-start">
        <button
          onClick={() => onViewModeChange(viewMode === 'birthday' ? 'month' : 'birthday')}
          className={`ml-12 px-4 py-1 rounded-md capitalize font-semibold border border-blue-200 shadow-sm transition-colors ${
            viewMode === 'birthday'
              ? 'bg-blue-50 text-blue-600 border-blue-400'
              : 'bg-white text-blue-500 hover:bg-blue-50'
          }`}
        >
          Birthday View
        </button>
      </div>
      
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={onPrevious}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </button>
        <h2 className="text-lg font-semibold text-gray-900 whitespace-nowrap">
          {formatDate()}
        </h2>
        <button
          onClick={onNext}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ChevronRight className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      <div className="flex justify-end">
        <div className="w-full sm:w-auto flex bg-gray-100 rounded-lg p-1">
          <div className="grid grid-cols-4 sm:flex w-full">
            {(['day', 'week', 'month', 'year'] as string[]).map((mode) => (
              <button
                key={mode}
                onClick={() => onViewModeChange(mode)}
                className={`px-2 sm:px-4 py-1 rounded-md capitalize text-center ${
                  viewMode === mode
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}