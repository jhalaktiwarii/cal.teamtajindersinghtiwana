import React from 'react';

export function WeekDayHeader() {
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
    <div key={`${day}-${index}`} className="bg-gray-50 p-1 text-center font-medium">
      {day}
    </div>
  ));

  return <>{weekDays}</>;
}