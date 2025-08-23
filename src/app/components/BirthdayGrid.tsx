"use client"

import React from 'react';
import { Gift, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Birthday } from '@/app/types/birthday';

interface BirthdayGridProps {
  birthdays: Birthday[];
  onEdit?: (birthday: Birthday) => void;
  onDelete?: (id: string) => void;
}

// Helper function to get next birthday occurrence
const getNextBirthday = (day: number, month: number): Date => {
  const today = new Date();
  const currentYear = today.getFullYear();
  
  let nextBirthday = new Date(currentYear, month - 1, day);
  
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

// Helper function to format birthday date with ordinal suffix
const formatBirthdayDate = (day: number, month: number): string => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const getOrdinalSuffix = (day: number): string => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };
  
  return `${day}${getOrdinalSuffix(day)} ${months[month - 1]}`;
};

export function BirthdayGrid({ birthdays, onEdit, onDelete }: BirthdayGridProps) {
  
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
    
    // Second priority: Sort by next occurrence date (upcoming first)
    const nextA = getNextBirthday(a.day, a.month);
    const nextB = getNextBirthday(b.day, b.month);
    return nextA.getTime() - nextB.getTime();
  });

  return (
    <div className="w-full">
      {/* Birthday Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sorted.map((bday, index) => {
          const safeName = bday.fullName || 'Unknown';
          const safeId = bday.id || `temp_${index}`;
          const uniqueKey = `${safeId}_${index}_${bday.day}_${bday.month}`;
          const isToday = isBirthdayToday(bday.day, bday.month);
          
          return (
                         <div
               key={uniqueKey}
               className={`bg-white dark:bg-gray-800 rounded-lg border-2 shadow-sm transition-all duration-200 hover:shadow-md relative ${
                 isToday 
                   ? 'border-green-300 bg-green-50 dark:bg-green-900/20' 
                   : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
               }`}
             >
               {/* Action Buttons - Top Right */}
               <div className="absolute top-3 right-3 flex items-center gap-1">
                 <Button 
                   size="sm" 
                   variant="ghost" 
                   className="h-7 w-7 p-0 hover:bg-gray-100 dark:hover:bg-gray-700" 
                   onClick={() => onEdit?.(bday)} 
                   title="Edit"
                 >
                   <Edit2 className="h-3 w-3 text-blue-500" />
                 </Button>
                 <Button 
                   size="sm" 
                   variant="ghost" 
                   className="h-7 w-7 p-0 hover:bg-gray-100 dark:hover:bg-gray-700" 
                   onClick={() => onDelete?.(bday.id)} 
                   title="Delete"
                 >
                   <Trash2 className="h-3 w-3 text-red-500" />
                 </Button>
               </div>

               {/* Name Section */}
               <div className="p-4 pb-2">
                 <div className="flex items-center gap-2 pr-16">
                   <Gift className={`h-4 w-4 ${isToday ? 'text-green-500' : 'text-blue-400'}`} />
                   <h4 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                     {safeName}
                   </h4>
                   {isToday && (
                     <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full font-medium ml-auto">
                       Today!
                     </span>
                   )}
                 </div>
               </div>

               {/* Date Section */}
               <div className="px-4 pb-2">
                 <div className="text-sm text-gray-600 dark:text-gray-300">
                   {formatBirthdayDate(bday.day, bday.month)}
                 </div>
                 {bday.ward && (
                   <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                     Ward: {bday.ward}
                   </div>
                 )}
               </div>

                               {/* Contact & Address Section */}
                <div className="px-4 pb-4">
                  {bday.phone ? (
                    <div className="mb-2">
                      <button
                        onClick={() => window.open(`tel:${bday.phone}`, '_self')}
                        className="text-sm text-gray-700 dark:text-gray-300 font-mono hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 underline decoration-dotted underline-offset-2"
                        title={`Call ${bday.phone}`}
                      >
                        {bday.phone}
                      </button>
                    </div>
                  ) : (
                    <div className="mb-2 flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                      <AlertTriangle className="h-3 w-3" />
                      <span className="text-xs">No phone number</span>
                    </div>
                  )}
                  
                  {bday.address ? (
                    <div className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                      {bday.address}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400 mb-1">
                      <AlertTriangle className="h-3 w-3" />
                      <span className="text-xs">No address</span>
                    </div>
                  )}

                  {!bday.ward && (
                    <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                      <AlertTriangle className="h-3 w-3" />
                      <span className="text-xs">No ward information</span>
                    </div>
                  )}
                </div>
             </div>
          );
        })}
      </div>

      {/* Empty States */}
      {validBirthdays.length === 0 && birthdays.length > 0 && (
        <div className="text-center py-8 text-gray-500">
          <Gift className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-sm">Some birthday entries have invalid data and have been filtered out.</p>
        </div>
      )}
      
      {birthdays.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Gift className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-sm">No birthdays found</p>
        </div>
      )}
    </div>
  );
}
