"use client"

import React from 'react';
import { Gift, Edit2, Trash2 } from 'lucide-react';
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

// Helper function to format birthday date
const formatBirthdayDate = (day: number, month: number): string => {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  return `${months[month - 1]} ${day}`;
};

export function BirthdayList({ birthdays, onEdit, onDelete }: BirthdayListProps) {
  
  const sorted = [...birthdays].sort((a, b) => {
    const nextA = getNextBirthday(a.day, a.month);
    const nextB = getNextBirthday(b.day, b.month);
    return nextA.getTime() - nextB.getTime();
  });

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Upcoming Birthdays</h3>
      <div className="space-y-2">
        {sorted.map((bday) => (
          <div
            key={bday.id}
            className="flex items-center justify-between p-3 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors shadow-sm"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Gift className="h-4 w-4 text-blue-400" />
                <span className="font-medium text-gray-900 truncate">{bday.fullName}</span>
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                {formatBirthdayDate(bday.day, bday.month)}
              </div>
            </div>
            <div className="flex items-center gap-1 ml-2">
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onEdit?.(bday)} title="Edit">
                <Edit2 className="h-4 w-4 text-blue-500" />
              </Button>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onDelete?.(bday.id)} title="Delete">
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 