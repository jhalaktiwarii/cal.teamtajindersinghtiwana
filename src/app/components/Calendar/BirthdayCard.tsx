import React from "react";
import { Check, X, Gift, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Birthday } from "@/app/types/birthday";

interface BirthdayCardProps {
  item: Birthday;
  role: "staff" | "mla";
  onApprove?: (id: string) => void;
  onDecline?: (id: string) => void;
}

export function BirthdayCard({ item, role, onApprove, onDecline }: BirthdayCardProps) {
  const getDateLabel = (day: number, month: number) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `${months[month - 1]} ${day}`;
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'approved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'declined':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
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
        </div>

        <div className="flex items-center gap-1 xs:gap-2">
          {/* Status chip */}
          <span className={cn(
            "inline-flex items-center px-1.5 xs:px-2 py-0.5 xs:py-1 rounded-full text-xs font-medium whitespace-nowrap border",
            getStatusColor(item.status)
          )}>
            {(item.status ?? 'Pending').charAt(0).toUpperCase() + 
             (item.status ?? 'pending').slice(1)}
          </span>

           {role === "mla" && (
            <div className="flex items-center gap-1">
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => onApprove?.(item.id)}
                className="h-6 w-6 xs:h-8 xs:w-8 p-0 hover:bg-emerald-100"
                title="Approve"
              >
                <Check className="h-3 w-3 xs:h-4 xs:w-4 text-emerald-600" />
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => onDecline?.(item.id)}
                className="h-6 w-6 xs:h-8 xs:w-8 p-0 hover:bg-red-100"
                title="Decline"
              >
                <X className="h-3 w-3 xs:h-4 xs:w-4 text-red-600" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
} 