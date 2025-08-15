'use client'
import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { toast } from 'sonner';

import { format } from 'date-fns';
import { useCalendar } from '@/app/hooks/useCalendar';
import { useIsMobile } from '@/hooks/useIsMobile';
import { Appointment, CalendarEvent, ViewMode } from '@/app/types';
import { Sidebar } from '../Sidebar';
import { SidebarDrawer } from '@/components/SidebarDrawer';
import { CalendarView } from '../Calendar';
import { FullPageSchedule } from '../Calendar/FullSchedule';
import { AppointmentDetails } from '../AppointmentDetails';
import { AppointmentModal } from '../AppointmentModal';
import type { Birthday } from '@/app/types/birthday';
import { DeleteModal } from '@/components/modals/DeleteModal';
import BirthdayModal from '@/components/BirthdayModal';

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
  
  const isMobile = useIsMobile();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile); // Default closed on mobile
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedAppointmentDate, setSelectedAppointmentDate] = useState<Date>(new Date());
  const [isEditing, setIsEditing] = useState(false);
  const [isBirthdayModalOpen, setIsBirthdayModalOpen] = useState(false);
  const [selectedBirthday, setSelectedBirthday] = useState<Birthday | null>(null);
  const [showFullSchedule, setShowFullSchedule] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteModalLoading, setDeleteModalLoading] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [deleteModalTitle, setDeleteModalTitle] = useState('');
  const [deleteModalDescription, setDeleteModalDescription] = useState('');
  const [deleteType, setDeleteType] = useState<'appointment' | 'birthday'>('appointment');

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

  const fetchBirthdays = async () => {
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
  };

  useEffect(() => {
    fetchBirthdays();
  }, []);

  // Ensure sidebar is closed when switching to mobile
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    } else {
      setIsSidebarOpen(true);
    }
  }, [isMobile]);



 
  const handleStatusChange = (id: string, status: 'scheduled' | 'going' | 'not-going' ) => {
    const appointment = appointments.find(apt => apt.appointment.id === id);
    if (appointment) {
      updateAppointment(id, {
        ...appointment.appointment,
        status
      }).then(() => {
        toast.success('Appointment status updated');
      }).catch(error => {
        console.error('Error updating appointment status:', error);
        toast.error(`Failed to update appointment status: ${error.message}`);
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
      // Store the event data before closing the modal
      const eventToDelete = selectedEvent;
      // Close the details modal first
      setSelectedEvent(null);
      // Then open the delete modal
      setItemToDelete(eventToDelete.appointment.id);
      setDeleteModalTitle("Delete Appointment?");
      setDeleteModalDescription(`Are you sure you want to delete "${eventToDelete.appointment.programName}"? This action cannot be undone.`);
      setDeleteType('appointment');
      setDeleteModalOpen(true);
    }
  };

  // Birthday handlers
  const handleEditBirthday = (birthday: Birthday) => {
    setSelectedBirthday(birthday);
    setIsBirthdayModalOpen(true);
  };

  const handleSaveBirthday = async (bday: Birthday) => {
    try {
      if (bday.id) {
        // Update existing
        const res = await fetch(`/api/birthdays/${bday.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bday),
        });
        if (res.ok) {
          const updated = await res.json();
          setBirthdays(prev => prev.map(b => b.id === updated.id ? updated : b));
          toast.success('Birthday updated successfully');
        } else {
          throw new Error('Failed to update birthday');
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
          // Add to the beginning of the list
          setBirthdays(prev => [created, ...prev]);
          toast.success('Birthday added successfully');
        } else {
          throw new Error('Failed to create birthday');
        }
      }
      setIsBirthdayModalOpen(false);
      setSelectedBirthday(null);
      
      // Small delay to ensure state is updated before refreshing
      setTimeout(async () => {
        await fetchBirthdays();
      }, 100);
    } catch (error) {
      console.error('Error saving birthday:', error);
      toast.error('Failed to save birthday');
    }
  };
  
  const handleDeleteBirthday = async (id: string) => {
    try {
      const res = await fetch(`/api/birthdays/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setBirthdays(prev => prev.filter(b => b.id !== id));
        toast.success('Birthday deleted successfully');
        
        // Refresh birthdays data to ensure UI is in sync
        await fetchBirthdays();
      } else {
        throw new Error('Failed to delete birthday');
      }
    } catch (error) {
      console.error('Error deleting birthday:', error);
      toast.error('Failed to delete birthday');
    }
  };

  const openDeleteBirthdayModal = (id: string, name: string) => {
    setItemToDelete(id);
    setDeleteModalTitle("Delete Birthday?");
    setDeleteModalDescription(`Are you sure you want to delete "${name}"'s birthday? This action cannot be undone.`);
    setDeleteType('birthday');
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    
    setDeleteModalLoading(true);
    try {
      if (deleteType === 'appointment') {
        await deleteAppointment(itemToDelete);
        setSelectedEvent(null);
        toast.success('Appointment deleted successfully');
      } else {
        // Delete birthday directly here to ensure proper state management
        const res = await fetch(`/api/birthdays/${itemToDelete}`, { method: 'DELETE' });
        if (res.ok) {
          setBirthdays(prev => prev.filter(b => b.id !== itemToDelete));
          toast.success('Birthday deleted successfully');
        } else {
          throw new Error('Failed to delete birthday');
        }
      }
      setDeleteModalOpen(false);
      setItemToDelete(null);
      setDeleteModalTitle('');
      setDeleteModalDescription('');
    } catch (error) {
      toast.error('Failed to delete item');
    } finally {
      setDeleteModalLoading(false);
    }
  };


 

  return (
    <div className="flex h-screen overflow-hidden relative">
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
      
      {/* Mobile menu button */}
      {isMobile && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="fixed top-4 left-4 z-[70] p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="Open Sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
      )}

      {/* Desktop Sidebar */}
      {!isMobile && !showFullSchedule && (
        <aside className="w-80 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
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
                  onEditBirthday={handleEditBirthday}
                  onDeleteBirthday={(id) => {
                    const birthday = birthdays.find(b => b.id === id);
                    if (birthday) {
                      openDeleteBirthdayModal(id, birthday.fullName);
                    }
                  }}
                  onClose={() => setIsSidebarOpen(false)}
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
        </aside>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full p-1 xs:p-2 sm:p-3 md:p-4 overflow-auto thin-scrollbar">
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
                  onDateChange={date => {
                    setSelectedDate(date);
                    handleOpenFullSchedule(date);
                  }}
                  birthdays={birthdays}
                  onSaveBirthday={handleSaveBirthday}
                  onDeleteBirthday={(id) => {
                    const birthday = birthdays.find(b => b.id === id);
                    if (birthday) {
                      openDeleteBirthdayModal(id, birthday.fullName);
                    }
                  }}
                  onRefreshBirthdays={fetchBirthdays}
                  isSidebarOpen={!isMobile}
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

      {/* Mobile Sidebar Drawer */}
      {isMobile && (
        <SidebarDrawer
          open={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          width={340}
        >
          <Sidebar
            appointments={appointments}
            onStatusChange={handleStatusChange}
            onUrgencyChange={handleUrgencyChange}
            isDarkMode={false}
            setIsSidebarOpen={setIsSidebarOpen}
            birthdays={birthdays}
            onEditBirthday={handleEditBirthday}
            onDeleteBirthday={(id) => {
              const birthday = birthdays.find(b => b.id === id);
              if (birthday) {
                openDeleteBirthdayModal(id, birthday.fullName);
              }
            }}
            onClose={() => setIsSidebarOpen(false)}
          />
        </SidebarDrawer>
      )}
      

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

      <DeleteModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={deleteModalTitle}
        description={deleteModalDescription}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        loading={deleteModalLoading}
      />

      <BirthdayModal
        open={isBirthdayModalOpen}
        onClose={() => {
          setIsBirthdayModalOpen(false);
          setSelectedBirthday(null);
        }}
        onSave={handleSaveBirthday}
        onDelete={(id) => {
          const birthday = birthdays.find(b => b.id === id);
          if (birthday) {
            openDeleteBirthdayModal(id, birthday.fullName);
          }
        }}
        initialBirthday={selectedBirthday || undefined}
      />
    </div>
  );
}