import React from "react";
import { Gift, Calendar } from "lucide-react";
import type { Birthday } from "@/app/types/birthday";

interface BirthdayCardProps {
  item: Birthday;
  role: "staff" | "mla";
}

export function BirthdayCard({ item, role }: BirthdayCardProps) {
  const getDateLabel = (day: number, month: number) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `${months[month - 1]} ${day}`;
  };

  return (
    <article className="group rounded-xl border border-gray-200 bg-white px-3 xs:px-4 py-2 xs:py-3 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between gap-2 xs:gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center space-x-2">
            <Gift className="h-3 w-3 xs:h-4 xs:w-4 text-pink-500 flex-shrink-0" />
            <h3 className="truncate font-medium text-xs xs:text-sm sm:text-base text-gray-900">
              {item.fullName}'s Birthday
            </h3>
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
            <Calendar className="h-3.5 w-3.5" />
            <span>{getDateLabel(item.day, item.month)}</span>
            {item.year && (
              <>
                <span className="mx-1">•</span>
                <span>{item.year}</span>
              </>
            )}
          </div>
          {item.phone && (
            <div className="mt-1 text-xs text-gray-500">
              Contact: {item.phone}
            </div>
          )}
          {item.ward && (
            <div className="mt-1 text-xs text-gray-500">
              Ward: {item.ward}
            </div>
          )}
        </div>
      </div>
    </article>
  );
} 