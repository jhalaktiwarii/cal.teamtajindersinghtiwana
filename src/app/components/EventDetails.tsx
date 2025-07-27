import React from 'react';
import { CalendarEvent } from '../types';
import {  Clock, AlertTriangle, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EventDetailsProps {
  event: CalendarEvent;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function EventDetails({ event, onEdit, onDelete }: EventDetailsProps) {
  const startTime = new Date(event.appointment.startTime);
  const endTime = new Date(event.appointment.endTime);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
      

        <h2 className="text-xl font-semibold mb-4 text-gray-900">
          {event.appointment.programName}
        </h2>

        <div className="space-y-4">
          <div className="flex items-center text-gray-600">
            <Clock className="h-5 w-5 mr-2" />
            <span>
              {startTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })} - {endTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}
            </span>
          </div>

          {event.appointment.isUrgent && (
            <div className="flex items-center text-red-600">
              <AlertTriangle className="h-5 w-5 mr-2" />
              <span>Urgent Appointment</span>
            </div>
          )}

          <div className="text-gray-600">
            <p><strong>Status:</strong> {event.appointment.status}</p>
            {event.appointment.notes && (
              <p><strong>Notes:</strong> {event.appointment.notes}</p>
            )}
          </div>

          <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={onDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}