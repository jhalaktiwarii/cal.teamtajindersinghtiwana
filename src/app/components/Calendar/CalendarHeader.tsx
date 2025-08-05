//deployment 
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarHeaderProps {
  currentDate: Date;
  viewMode: string;
  onPrevious: () => void;
  onNext: () => void;
  onViewModeChange: (mode: string) => void;
  isSidebarOpen?: boolean;
}

export function CalendarHeader({
  currentDate,
  viewMode,
  onPrevious,
  onNext,
  onViewModeChange,
  isSidebarOpen = false,
}: CalendarHeaderProps) {
  const formatDate = () => {
    const options: Intl.DateTimeFormatOptions = {
      month: 'long',
      year: 'numeric',
    };
    return currentDate.toLocaleDateString('en-US', options);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 xs:gap-3 sm:gap-4 p-1 xs:p-2 sm:p-3 md:p-4 w-full items-center sticky top-0 z-20 bg-white dark:bg-gray-900 shadow overflow-x-auto min-w-0">
      <div className="flex justify-start overflow-x-auto">
        <button
          onClick={() => onViewModeChange(viewMode === 'birthday' ? 'month' : 'birthday')}
          className={`${isSidebarOpen ? 'ml-12 xs:ml-16 sm:ml-20 md:ml-12' : 'ml-4 xs:ml-8 sm:ml-12'} px-2 xs:px-3 sm:px-4 py-1 rounded-md capitalize font-semibold border border-blue-200 shadow-sm transition-colors text-xs xs:text-sm sm:text-base whitespace-nowrap ${
            viewMode === 'birthday'
              ? 'bg-blue-50 text-blue-600 border-blue-400'
              : 'bg-white text-blue-500 hover:bg-blue-50'
          }`}
        >
          <span className="whitespace-nowrap">Birthday View</span>
        </button>
      </div>
      
      <div className="flex items-center justify-center gap-1 xs:gap-2">
        <button
          onClick={onPrevious}
          className="p-1 xs:p-2 hover:bg-gray-100 rounded-lg"
        >
          <ChevronLeft className="h-4 w-4 xs:h-5 xs:w-5 text-gray-600" />
        </button>
        <h2 className="text-sm xs:text-base sm:text-lg font-semibold text-gray-900 whitespace-nowrap px-1">
          {formatDate()}
        </h2>
        <button
          onClick={onNext}
          className="p-1 xs:p-2 hover:bg-gray-100 rounded-lg"
        >
          <ChevronRight className="h-4 w-4 xs:h-5 xs:w-5 text-gray-600" />
        </button>
      </div>

      <div className="flex justify-end overflow-x-auto">
        <div className="w-full sm:w-auto flex bg-gray-100 rounded-lg p-1 min-w-0">
          <div className="flex w-full gap-0.5 xs:gap-1">
            {(['day', 'week', 'month', 'year'] as string[]).map((mode) => (
              <button
                key={mode}
                onClick={() => onViewModeChange(mode)}
                className={`px-1 xs:px-2 sm:px-3 py-1 rounded-md capitalize text-center text-xs xs:text-sm whitespace-nowrap flex-1 sm:flex-none min-w-0 ${
                  viewMode === mode
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="whitespace-nowrap">{mode}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
