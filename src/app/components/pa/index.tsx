'use client'
import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

import { format } from 'date-fns';
import { useCalendar } from '@/app/hooks/useCalendar';
import { Appointment, CalendarEvent, ViewMode } from '@/app/types';
import { Sidebar } from '../Sidebar';
import { CalendarView } from '../Calendar';
import { FullPageSchedule } from '../Calendar/FullSchedule';
import { AppointmentDetails } from '../AppointmentDetails';
import { AppointmentModal } from '../AppointmentModal';
import type { Birthday } from '@/app/types/birthday';

interface PAViewProps {
  appointments: CalendarEvent[];
  saveAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateAppointment: (id: string, updates: Partial<Appointment>) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
}

export default function PAView({ appointments, saveAppointment, updateAppointment, deleteAppointment }: PAViewProps) {
  const {
    currentDate,
    viewMode,
    setViewMode,
    nextPeriod,
    previousPeriod,
  } = useCalendar();
  
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedAppointmentDate, setSelectedAppointmentDate] = useState<Date>(new Date());
  const [isEditing, setIsEditing] = useState(false);
  const [showFullSchedule, setShowFullSchedule] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Error boundary effect
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Global error caught:', event.error);
      setError(event.error?.message || 'An unexpected error occurred');
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      setError(event.reason?.message || 'An unexpected error occurred');
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  useEffect(() => {
    async function fetchBirthdays() {
      try {
        console.log('Fetching birthdays...');
        const res = await fetch('/api/birthdays');
        if (!res.ok) {
          console.error('Failed to fetch birthdays:', res.status, res.statusText);
          throw new Error(`Failed to fetch birthdays: ${res.status} ${res.statusText}`);
        }
        const data = await res.json();
        console.log('Raw birthday data:', data);
        
        // Filter out any invalid birthday records to prevent crashes
        const validBirthdays = data.filter((birthday: import('@/app/types/birthday').Birthday, index: number) => {
          try {
            console.log(`Validating birthday ${index}:`, birthday);
            
            // Basic validation
            const isValid = birthday && 
                   birthday.id && 
                   birthday.fullName && 
                   typeof birthday.day === 'number' && 
                   typeof birthday.month === 'number' &&
                   birthday.day >= 1 && birthday.day <= 31 &&
                   birthday.month >= 1 && birthday.month <= 12;
            
            if (!isValid) {
              console.warn(`Invalid birthday at index ${index}:`, birthday);
            }
            
            return isValid;
          } catch (error) {
            console.error(`Error validating birthday at index ${index}:`, error, birthday);
            return false;
          }
        });
        
        console.log('Valid birthdays:', validBirthdays);
        setBirthdays(validBirthdays);
      } catch (error) {
        console.error('Error fetching birthdays:', error);
        setBirthdays([]);
      }
    }
    fetchBirthdays();
  }, []);

 
  const handleStatusChange = (id: string, status: 'scheduled' | 'going' | 'not-going' ) => {
    const appointment = appointments.find(apt => apt.appointment.id === id);
    if (appointment) {
      updateAppointment(id, {
        ...appointment.appointment,
        status
      });
    }
  };

  const handleUrgencyChange = (id: string, isUrgent: boolean) => {
    const appointment = appointments.find(apt => apt.appointment.id === id);
    if (appointment) {
      updateAppointment(id, {
        ...appointment.appointment,
        isUrgent
      });
    }
  };

  const handleOpenFullSchedule = (date: Date) => {
    if (!date || !(date instanceof Date)) return;
    try {
      const newDate = new Date(date);
      newDate.setHours(0, 0, 0, 0);
      setSelectedDate(newDate);
      setShowFullSchedule(true);
    } catch (error) {
      console.error('Error handling date:', error);
    }
  };

  const handleCloseFullSchedule = () => {
    setShowFullSchedule(false);
    setSelectedDate(null);
  };

  const handleAddSchedule = (time?: string, date?: Date, eventToEdit?: CalendarEvent) => {
    if (!date) return;
    
    const scheduleDate = new Date(date);
    const today = new Date();
    
    // If it's today, check the time
    if (
      scheduleDate.getDate() === today.getDate() &&
      scheduleDate.getMonth() === today.getMonth() &&
      scheduleDate.getFullYear() === today.getFullYear()
    ) {
      const [hours, minutes] = (time || '').split(':').map(Number);
      if (!isNaN(hours) && !isNaN(minutes)) {
        scheduleDate.setHours(hours, minutes, 0, 0);
        if (scheduleDate < today) {
          const roundedMinutes = Math.ceil(today.getMinutes() / 5) * 5;
          time = `${today.getHours().toString().padStart(2, '0')}:${roundedMinutes.toString().padStart(2, '0')}`;
        }
      }
    }
    
    setIsAppointmentModalOpen(true);
            setSelectedTime(time || format(scheduleDate, 'hh:mm a'));
    setSelectedAppointmentDate(scheduleDate);
    if (eventToEdit) {
      setSelectedEvent(eventToEdit);
      setIsEditing(true);
    } else {
      setSelectedEvent(null);
      setIsEditing(false);
    }
  };

  const handleCloseAppointmentModal = () => {
    setIsAppointmentModalOpen(false);
    setIsEditing(false);
    setSelectedEvent(null);
    setSelectedTime(null);
  };

  const handleSaveAppointment = async (appointmentData: Partial<Appointment>) => {
    try {
      if (isEditing && selectedEvent) {
        await updateAppointment(selectedEvent.appointment.id, {
          ...selectedEvent.appointment,
          ...appointmentData,
        });
      } else {
        if (!appointmentData.userid || 
            !appointmentData.programName || 
            !appointmentData.address || 
            !appointmentData.startTime || 
            !appointmentData.status || 
            !appointmentData.eventFrom || 
            !appointmentData.contactNo ||
            appointmentData.isUrgent === undefined) {
          throw new Error('Missing required fields for appointment');
        }
        
        await saveAppointment({
          userid: appointmentData.userid,
          programName: appointmentData.programName,
          address: appointmentData.address,
          startTime: appointmentData.startTime,
          status: appointmentData.status,
          eventFrom: appointmentData.eventFrom,
          contactNo: appointmentData.contactNo,
          isUrgent: appointmentData.isUrgent,
          notes: appointmentData.notes
        });
      }
      handleCloseAppointmentModal();
      if (selectedDate) {
 
        setSelectedEvent(null);
      }
    } catch (error) {
      console.error('Error saving appointment:', error);
    }
  };

  const handleEditAppointment = () => {
    if (selectedEvent) {
      setSelectedTime(new Date(selectedEvent.appointment.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }));
      setIsAppointmentModalOpen(true);
      setIsEditing(true);
    }
  };

  const handleDeleteAppointment = () => {
    if (selectedEvent) {
      deleteAppointment(selectedEvent.appointment.id);
      setSelectedEvent(null);
    }
  };

  // Birthday handlers
  const handleSaveBirthday = async (bday: Birthday) => {
    try {
      let updatedList: Birthday[] = [];
      if (bday.id) {
        // Update existing
        const res = await fetch(`/api/birthdays/${bday.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bday),
        });
        if (res.ok) {
          const updated = await res.json();
          updatedList = birthdays.map(b => b.id === updated.id ? updated : b);
          setBirthdays(updatedList);
        }
      } else {
        // Create new
        const res = await fetch('/api/birthdays', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bday),
        });
        if (res.ok) {
          const created = await res.json();
          updatedList = [created, ...birthdays];
          setBirthdays(updatedList);
        }
      }
    } catch (error) {
      console.error('Error saving birthday:', error);
    }
  };
  
  const handleDeleteBirthday = async (id: string) => {
    try {
      const res = await fetch(`/api/birthdays/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setBirthdays(prev => prev.filter(b => b.id !== id));
      }
    } catch (error) {
      console.error('Error deleting birthday:', error);
    }
  };


 

  return (
    <div className="flex h-screen overflow-hidden">
      {error && (
        <div className="fixed inset-0 z-50 bg-red-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error Occurred</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => {
                setError(null);
                window.location.reload();
              }}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      )}
      
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700"
        aria-label="Toggle Sidebar"
      >
        {isSidebarOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </button>

      <div 
        className={`fixed inset-y-0 left-0 z-40 w-80 transform transition-transform duration-300 ease-in-out bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {(() => {
          try {
            return (
              <Sidebar
                appointments={appointments}
                onStatusChange={handleStatusChange}
                onUrgencyChange={handleUrgencyChange}
                isDarkMode={false}
                setIsSidebarOpen={setIsSidebarOpen}
                birthdays={birthdays}
                onEditBirthday={handleSaveBirthday}
                onDeleteBirthday={handleDeleteBirthday}
              />
            );
          } catch (error) {
            console.error('Error rendering Sidebar:', error);
            return (
              <div className="p-4">
                <h3 className="text-lg font-semibold text-red-800 mb-2">Sidebar Error</h3>
                <p className="text-red-600 mb-4">Failed to load sidebar</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Reload Page
                </button>
              </div>
            );
          }
        })()}
      </div>

        <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-80' : 'ml-0'}`}>
          <div className="h-full p-4">
            {(() => {
              try {
                return (
                  <CalendarView
                    viewMode={viewMode}
                    currentDate={currentDate}
                    events={appointments}
                    onEventClick={(event) => setSelectedEvent(event)}
                    onPrevious={previousPeriod}
                    onNext={nextPeriod}
                    onViewModeChange={mode => setViewMode(mode as ViewMode)}
                    onAddAppointment={(date, time) => handleAddSchedule(time, date)}
                    onDayDoubleClick={(date, ) => handleOpenFullSchedule(date)}
                    onDateChange={date => setSelectedDate(date)}
                    birthdays={birthdays}
                    onSaveBirthday={handleSaveBirthday}
                    onDeleteBirthday={handleDeleteBirthday}
                  />
                );
              } catch (error) {
                console.error('Error rendering CalendarView:', error);
                return (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-red-800 mb-2">Calendar Error</h3>
                      <p className="text-red-600 mb-4">Failed to load calendar view</p>
                      <button 
                        onClick={() => window.location.reload()}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                      >
                        Reload Page
                      </button>
                    </div>
                  </div>
                );
              }
            })()}
            {showFullSchedule && selectedDate && (
              <FullPageSchedule
                date={selectedDate}
                onClose={handleCloseFullSchedule}
                onAddSchedule={handleAddSchedule}
                events={appointments.filter(event => {
                  if (!selectedDate) return false;
                  const eventDate = new Date(event.appointment.startTime);
                  return (
                    eventDate.getFullYear() === selectedDate.getFullYear() &&
                    eventDate.getMonth() === selectedDate.getMonth() &&
                    eventDate.getDate() === selectedDate.getDate()
                  );
                })}
              />
            )}
          </div>
        </main>
      

      {selectedEvent && (
        <AppointmentDetails
          event={selectedEvent}
          onEdit={handleEditAppointment}
          onDelete={handleDeleteAppointment}
          onClose={() => setSelectedEvent(null)}
        />
      )}

      {isAppointmentModalOpen && (
        <AppointmentModal
          isOpen={isAppointmentModalOpen}
          onClose={handleCloseAppointmentModal}
          onSave={handleSaveAppointment}
          selectedTime={selectedTime}
          selectedDate={selectedAppointmentDate}
          isEditing={isEditing}
          appointment={selectedEvent?.appointment}
        />
      )}
    </div>
  );
}