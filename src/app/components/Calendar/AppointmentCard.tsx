import React from "react";
import { CheckCircle2, XCircle, Clock3, AlertTriangle } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CalendarEvent } from "@/app/types";

interface AppointmentCardProps {
  item: CalendarEvent;
  role: "staff" | "mla";
  onStatusChange: (id: string, status: 'going' | 'not-going' | 'scheduled') => void;
}

export function AppointmentCard({ item, role, onStatusChange }: AppointmentCardProps) {
  const appointment = item.appointment;
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'going':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'not-going':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getBackgroundColor = (status: string, isUrgent: boolean) => {
    if (isUrgent) {
      switch (status) {
        case 'not-going':
          return 'bg-red-50 hover:bg-red-100 border-l-4 border-red-500';
        case 'going':
          return 'bg-emerald-50 hover:bg-emerald-100 border-l-4 border-emerald-500';
        case 'scheduled':
          return 'bg-blue-50 hover:bg-blue-100 border-l-4 border-blue-500';
        default:
          return 'bg-amber-50 hover:bg-amber-100 border-l-4 border-amber-500';
      }
    }
    
    switch (status) {
      case 'not-going':
        return 'bg-red-50 hover:bg-red-100';
      case 'going':
        return 'bg-emerald-50 hover:bg-emerald-100';
      case 'scheduled':
        return 'bg-blue-50 hover:bg-blue-100';
      default:
        return 'bg-yellow-50 hover:bg-yellow-100';
    }
  };

  return (
    <article className={cn(
      "group rounded-xl border bg-white px-3 xs:px-4 py-2 xs:py-3 shadow-sm hover:shadow-md transition-all duration-200",
      getBackgroundColor(appointment?.status || 'scheduled', appointment?.isUrgent || false)
    )}>
      <div className="flex items-center justify-between gap-2 xs:gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center space-x-2">
            <h3 className={cn(
              "truncate font-medium text-xs xs:text-sm sm:text-base",
              appointment?.isUrgent ? "text-red-700" : "text-gray-900"
            )}>
              {appointment?.programName}
            </h3>
            {appointment?.isUrgent && (
              <AlertTriangle className="h-3 w-3 text-red-500 flex-shrink-0" />
            )}
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
            <Clock3 className="h-3.5 w-3.5" />
            <span className="whitespace-nowrap">
              {appointment?.startTime ? 
                format(parseISO(appointment.startTime), "h:mm a") : 
                'Time not set'}
            </span>
            {appointment?.address && (
              <>
                <span className="mx-1">•</span>
                <span className="truncate">{appointment.address}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 xs:gap-2">
          {/* Role-aware actions */}
          {role === "staff" && (
            <div className="flex items-center gap-1">
              {appointment?.status === 'going' && (
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => appointment?.id && onStatusChange(appointment.id, 'not-going')}
                  className="h-5 w-5 xs:h-6 xs:w-6 p-0 hover:bg-red-100"
                  title="Mark as Not Going"
                >
                  <XCircle className="h-3 w-3 xs:h-4 xs:w-4 text-red-600" />
                </Button>
              )}
              {appointment?.status === 'not-going' && (
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => appointment?.id && onStatusChange(appointment.id, 'going')}
                  className="h-5 w-5 xs:h-6 xs:w-6 p-0 hover:bg-emerald-100"
                  title="Mark as Going"
                >
                  <CheckCircle2 className="h-3 w-3 xs:h-4 xs:w-4 text-emerald-600" />
                </Button>
              )}
              {appointment?.status !== 'going' && appointment?.status !== 'not-going' && (
                <>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => appointment?.id && onStatusChange(appointment.id, 'going')}
                    className="h-5 w-5 xs:h-6 xs:w-6 p-0 hover:bg-emerald-100"
                    title="Mark as Going"
                  >
                    <CheckCircle2 className="h-3 w-3 xs:h-4 xs:w-4 text-emerald-600" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => appointment?.id && onStatusChange(appointment.id, 'not-going')}
                    className="h-5 w-5 xs:h-6 xs:w-6 p-0 hover:bg-red-100"
                    title="Mark as Not Going"
                  >
                    <XCircle className="h-3 w-3 xs:h-4 xs:w-4 text-red-600" />
                  </Button>
                </>
              )}
            </div>
          )}

          {role === "mla" && (
            <div className="flex items-center gap-1">
              {appointment?.status === 'scheduled' && (
                <>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => appointment?.id && onStatusChange(appointment.id, 'going')}
                    className="h-5 w-5 xs:h-6 xs:w-6 p-0 hover:bg-emerald-100"
                    title="Approve"
                  >
                    <CheckCircle2 className="h-3 w-3 xs:h-4 xs:w-4 text-emerald-600" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => appointment?.id && onStatusChange(appointment.id, 'not-going')}
                    className="h-5 w-5 xs:h-6 xs:w-6 p-0 hover:bg-red-100"
                    title="Decline"
                  >
                    <XCircle className="h-3 w-3 xs:h-4 xs:w-4 text-red-600" />
                  </Button>
                </>
              )}
              {appointment?.status === 'going' && (
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => appointment?.id && onStatusChange(appointment.id, 'not-going')}
                  className="h-5 w-5 xs:h-6 xs:w-6 p-0 hover:bg-red-100"
                  title="Decline"
                >
                  <XCircle className="h-3 w-3 xs:h-4 xs:w-4 text-red-600" />
                </Button>
              )}
              {appointment?.status === 'not-going' && (
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => appointment?.id && onStatusChange(appointment.id, 'going')}
                  className="h-5 w-5 xs:h-6 xs:w-6 p-0 hover:bg-emerald-100"
                  title="Approve"
                >
                  <CheckCircle2 className="h-3 w-3 xs:h-4 xs:w-4 text-emerald-600" />
                </Button>
              )}
            </div>
          )}
          
          {/* Status chip */}
          <span className={cn(
            "inline-flex items-center px-1.5 xs:px-2 py-0.5 xs:py-1 rounded-full text-xs font-medium whitespace-nowrap border",
            getStatusColor(appointment?.status ?? 'scheduled')
          )}>
            {(appointment?.status ?? 'Scheduled').charAt(0).toUpperCase() + 
             (appointment?.status ?? 'scheduled').slice(1)}
          </span>
        </div>
      </div>
    </article>
  );
} 