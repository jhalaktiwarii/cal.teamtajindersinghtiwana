import React from 'react';
import { Edit, Trash2, X } from 'lucide-react';
import { CalendarEvent } from '../types';
import { formatTime12Hour } from '@/app/utils/dateUtils';

interface AppointmentDetailsProps {
  event: CalendarEvent;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export function AppointmentDetails({ event, onEdit, onDelete ,onClose}: AppointmentDetailsProps) {


  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return formatTime12Hour(dateString);
    } catch (error) {
      console.error('Error formatting time:', error);
      return '';
    }
  };

  if (!event?.appointment) {
    return null;
  }

  const isPastEvent = new Date(event.appointment.startTime).getTime() < new Date().getTime();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-semibold mb-4 text-gray-900">
          Appointment Address
        </h2>

        <div className="space-y-4">
          <div className="flex items-center text-gray-600">
            <span className="font-medium">
              {formatDate(event.appointment.startTime)}
            </span>
            <span className="mx-2">•</span>
            <span>
              {formatTime(event.appointment.startTime)}
            </span>
          </div>

          <div className="flex flex-col space-y-4">
            <div>
              <div className="text-sm text-gray-500">Event From</div>
              <div className="text-base font-medium">{event.appointment.eventFrom}</div>
            </div>

            <div>
              <div className="text-sm text-gray-500">Contact Number</div>
              <div className="text-base font-medium">{event.appointment.contactNo}</div>
            </div>

            <div>
              <div className="text-sm text-gray-500">Status</div>
              <div className="text-base font-medium capitalize">{event.appointment.status}</div>
            </div>

            {event.appointment.notes && (
              <div>
                <div className="text-sm text-gray-500">Notes</div>
                <div className="text-base">{event.appointment.notes}</div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 mt-4">
            {/* <button
              onClick={handleDownload}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full"
              title="Download"
            >
              <Download className="h-5 w-5" />
            </button> */}
            {!isPastEvent && (
              <button
                onClick={onEdit}
                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-full"
                title="Edit"
              >
                <Edit className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={onDelete}
              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-full"
              title="Delete"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}