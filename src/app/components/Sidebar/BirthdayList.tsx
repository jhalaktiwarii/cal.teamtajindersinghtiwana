"use client"

import React from 'react';
import { Gift, Edit2, Trash2, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Birthday } from '@/app/types/birthday';

interface BirthdayListProps {
  birthdays: Birthday[];
  onEdit?: (birthday: Birthday) => void;
  onDelete?: (id: string) => void;
}

// Helper function to get next birthday occurrence
const getNextBirthday = (day: number, month: number): Date => {
  const today = new Date();
  const currentYear = today.getFullYear();
  
  // Create birthday for current year
  let nextBirthday = new Date(currentYear, month - 1, day);
  
  // If birthday has passed this year, set it for next year
  if (nextBirthday < today) {
    nextBirthday = new Date(currentYear + 1, month - 1, day);
  }
  
  return nextBirthday;
};

// Helper function to check if birthday is today
const isBirthdayToday = (day: number, month: number): boolean => {
  const today = new Date();
  return today.getDate() === day && today.getMonth() === month - 1;
};

// Helper function to format birthday date
const formatBirthdayDate = (day: number, month: number, ward?: string): string => {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  const dateString = `${months[month - 1]} ${day}`;
  return ward ? `${dateString}, Ward ${ward}` : dateString;
};

export function BirthdayList({ birthdays, onEdit, onDelete }: BirthdayListProps) {
  
  // Filter out invalid birthdays and create a clean list
  const validBirthdays = birthdays.filter(bday => 
    bday && 
    bday.fullName && 
    typeof bday.day === 'number' && 
    typeof bday.month === 'number' &&
    bday.day >= 1 && bday.day <= 31 &&
    bday.month >= 1 && bday.month <= 12
  );
  
  const sorted = [...validBirthdays].sort((a, b) => {
    // First priority: Today's birthdays come first
    const aIsToday = isBirthdayToday(a.day, a.month);
    const bIsToday = isBirthdayToday(b.day, b.month);
    
    if (aIsToday && !bIsToday) return -1;
    if (!aIsToday && bIsToday) return 1;
    if (aIsToday && bIsToday) return 0;
    
    // Second priority: Sort by next occurrence date
    const nextA = getNextBirthday(a.day, a.month);
    const nextB = getNextBirthday(b.day, b.month);
    return nextA.getTime() - nextB.getTime();
  });

  return (
    <div>
      <div className="space-y-2">
        {sorted.map((bday, index) => {
          // Create a unique key that handles all edge cases
          const safeName = bday.fullName || 'Unknown';
          const safeId = bday.id || `temp_${index}`;
          const uniqueKey = `${safeId}_${index}_${bday.day}_${bday.month}`;
          const isToday = isBirthdayToday(bday.day, bday.month);
          
          return (
            <div
              key={uniqueKey}
              className={`flex items-center justify-between p-2 xs:p-3 rounded-xl transition-colors shadow-sm ${
                isToday 
                  ? 'bg-green-50 hover:bg-green-100 border-2 border-green-200' 
                  : 'bg-blue-50 hover:bg-blue-100'
              }`}
            >
              <div className="flex-1 min-w-0 mr-2">
                <div className="flex items-center gap-1 xs:gap-2">
                  <Gift className={`h-3 w-3 xs:h-4 xs:w-4 ${isToday ? 'text-green-500' : 'text-blue-400'}`} />
                  <span className="font-medium text-gray-900 truncate text-sm xs:text-base">{safeName}</span>
                  {isToday && (
                    <span className="text-xs bg-green-500 text-white px-1 xs:px-2 py-0.5 xs:py-1 rounded-full font-medium whitespace-nowrap">
                      Today!
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {formatBirthdayDate(bday.day, bday.month, bday.ward)}
                </div>
              </div>
              <div className="flex items-center gap-0.5 xs:gap-1 ml-1 xs:ml-2">
                {bday.phone && (
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-6 w-6 xs:h-7 xs:w-7" 
                    onClick={() => window.open(`tel:${bday.phone}`, '_self')} 
                    title={`Call ${bday.phone}`}
                  >
                    <Phone className="h-3 w-3 xs:h-4 xs:w-4 text-green-500" />
                  </Button>
                )}
                <Button size="icon" variant="ghost" className="h-6 w-6 xs:h-7 xs:w-7" onClick={() => onEdit?.(bday)} title="Edit">
                  <Edit2 className="h-3 w-3 xs:h-4 xs:w-4 text-blue-500" />
                </Button>
                <Button size="icon" variant="ghost" className="h-6 w-6 xs:h-7 xs:w-7" onClick={() => onDelete?.(bday.id)} title="Delete">
                  <Trash2 className="h-3 w-3 xs:h-4 xs:w-4 text-red-500" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
      {validBirthdays.length === 0 && birthdays.length > 0 && (
        <div className="text-center py-4 text-gray-500">
          <p className="text-sm xs:text-base">Some birthday entries have invalid data and have been filtered out.</p>
        </div>
      )}
      {birthdays.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          <p className="text-sm xs:text-base">No birthdays found</p>
        </div>
      )}
    </div>
  );
} 