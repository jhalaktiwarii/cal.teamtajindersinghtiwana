"use client"

import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { CalendarEvent } from '../../types';
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface AppointmentListProps {
  appointments: CalendarEvent[];
  onStatusChange?: (id: string, status: 'scheduled' | 'going' | 'not-going') => void;
  onUrgencyChange?: (id: string, isUrgent: boolean) => void;
}

export function AppointmentList({ 
  appointments,
  onStatusChange,
  onUrgencyChange,
}: AppointmentListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'going':
        return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/50';
      case 'not-going':
        return 'bg-red-50 text-red-700 ring-1 ring-red-200/50';
      case 'scheduled':
        return 'bg-blue-50 text-blue-700 ring-1 ring-blue-200/50';
      default:
        return 'bg-slate-50 text-slate-700 ring-1 ring-slate-200/50';
    }
  };

  const getAppointmentBackground = (status: string, isUrgent: boolean) => {
    const baseClasses = "bg-white backdrop-blur-sm";
    const borderClasses = isUrgent 
      ? "ring-1 ring-red-200/70 shadow-[inset_0_0_0_1px_rgba(254,202,202,0.3)]" 
      : "ring-1 ring-slate-200/70";
    
    switch (status) {
      case 'not-going':
        return cn(
          baseClasses,
          borderClasses,
          isUrgent 
            ? "hover:ring-red-300/70 hover:shadow-[inset_0_0_0_1px_rgba(252,165,165,0.4)]" 
            : "hover:ring-slate-300/70",
          "group-hover:bg-red-50/30"
        );
      case 'going':
        return cn(
          baseClasses,
          borderClasses,
          isUrgent 
            ? "hover:ring-red-300/70 hover:shadow-[inset_0_0_0_1px_rgba(252,165,165,0.4)]" 
            : "hover:ring-slate-300/70",
          "group-hover:bg-emerald-50/30"
        );
      case 'scheduled':
        return cn(
          baseClasses,
          borderClasses,
          isUrgent 
            ? "hover:ring-red-300/70 hover:shadow-[inset_0_0_0_1px_rgba(252,165,165,0.4)]" 
            : "hover:ring-slate-300/70",
          "group-hover:bg-blue-50/30"
        );
      default:
        return cn(
          baseClasses,
          borderClasses,
          isUrgent 
            ? "hover:ring-red-300/70 hover:shadow-[inset_0_0_0_1px_rgba(252,165,165,0.4)]" 
            : "hover:ring-slate-300/70",
          "group-hover:bg-slate-50/30"
        );
    }
  };

  if (!appointments || appointments.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-gray-500">
        No appointments found
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {appointments.map((event, index) => {
        const key = event.appointment?.id || `appointment-${index}`;
        return (
          <Dialog key={key}>
            <DialogTrigger asChild>
              <div
                className={cn(
                  "group flex items-center justify-between p-3 rounded-xl my-0.5 first:mt-0 last:mb-0",
                  "transition-all duration-200 ease-out",
                  getAppointmentBackground(event.appointment?.status || 'scheduled', event.appointment?.isUrgent || false),
                  "cursor-pointer",
                  "hover:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08)] hover:-translate-y-0.5",
                  "border border-transparent relative",
                  event.appointment?.isUrgent && "border-red-200"
                )}
              >
                <div className="flex-1 min-w-0 mr-2">
                  <div className="flex items-center space-x-2">
                    <p className={cn(
                      "text-sm font-medium truncate",
                      event.appointment?.isUrgent ? "text-red-700" : "text-gray-900"
                    )}>
                      {event.appointment?.programName}
                    </p>
                    {event.appointment?.isUrgent && (
                      <AlertTriangle className="h-3 w-3 text-red-500" />
                    )}
                  </div>
                  <div className="flex items-center text-xs text-gray-500 mt-0.5">
                    <span className="whitespace-nowrap">
                      {event.appointment?.startTime ? 
                        format(parseISO(event.appointment.startTime), "h:mm a") : 
                        'Time not set'}
                    </span>
                    <span className="mx-2">•</span>
                    <span className="truncate">{event.appointment?.address}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {event.appointment?.status === 'going' && (
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => {
                          if (onStatusChange && event.appointment?.id) {
                            onStatusChange(event.appointment.id, 'not-going');
                          }
                        }}
                        className="h-6 w-6 p-0"
                        title="Mark as Not Going"
                      >
                        <XCircle className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  )}
                  {event.appointment?.status === 'not-going' && (
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => {
                          if (onStatusChange && event.appointment?.id) {
                            onStatusChange(event.appointment.id, 'going');
                          }
                        }}
                        className="h-6 w-6 p-0"
                        title="Mark as Going"
                      >
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      </Button>
                    </div>
                  )}
                  {event.appointment?.status !== 'going' && event.appointment?.status !== 'not-going' && (
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => {
                          if (onStatusChange && event.appointment?.id) {
                            onStatusChange(event.appointment.id, 'going');
                          }
                        }}
                        className="h-6 w-6 p-0"
                        title="Mark as Going"
                      >
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => {
                          if (onStatusChange && event.appointment?.id) {
                            onStatusChange(event.appointment.id, 'not-going');
                          }
                        }}
                        className="h-6 w-6 p-0"
                        title="Mark as Not Going"
                      >
                        <XCircle className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  )}
                  <span className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap",
                    getStatusColor(event.appointment?.status ?? 'scheduled')
                  )}>
                    {(event.appointment?.status ?? 'Scheduled').charAt(0).toUpperCase() + 
                     (event.appointment?.status ?? 'scheduled').slice(1)}
                  </span>
                </div>
              </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Appointment Details</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium leading-none">Schedule</h4>
                    <div className="text-sm text-muted-foreground">
                      <div>Date: {event.appointment?.startTime ? format(parseISO(event.appointment.startTime), "PPP") : 'Date not set'}</div>
                      <div>Time: {event.appointment?.startTime ? `${format(parseISO(event.appointment.startTime), "h:mm a")}` : 'Time not set'}</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium leading-none">Event From</h4>
                    <div className="text-sm text-muted-foreground">
                      {event.appointment?.eventFrom || 'Not specified'}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium leading-none">Contact Number</h4>
                    <div className="text-sm text-muted-foreground">
                      {event.appointment?.contactNo || 'Not provided'}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium leading-none">Status</h4>
                    <div className="text-sm text-muted-foreground capitalize">
                      {event.appointment?.status || 'Not set'}
                    </div>
                  </div>
                  {event.appointment?.notes && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium leading-none">Notes</h4>
                      <div className="text-sm text-muted-foreground">
                        {event.appointment.notes}
                      </div>
                    </div>
                  )}
                  <div className="flex items-center space-x-2 pt-4 border-t">
                    <div className="flex-1 space-y-1">
                      <div className="text-sm font-medium leading-none">Urgent Appointment</div>
                      <div className="text-sm text-muted-foreground">
                        Mark this appointment as urgent
                      </div>
                    </div>
                    <Switch
                      checked={event.appointment?.isUrgent}
                      onCheckedChange={(checked) => onUrgencyChange?.(event.appointment?.id, checked)}
                    />
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        );
      })}
    </div>
  );
}