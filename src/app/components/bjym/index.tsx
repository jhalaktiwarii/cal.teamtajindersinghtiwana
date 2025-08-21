"use client"

import React, { useState, useEffect } from 'react';
import { useAppointments } from '@/app/hooks/useAppointments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format, parseISO } from 'date-fns';
import { Search, LogOut, X, Download, Share2, Gift } from 'lucide-react';
import { signOut } from "next-auth/react";
import { jsPDF } from 'jspdf';
import { ShareDialog } from '../ShareDialog';
import { CalendarEvent } from '@/app/types';
import { toMarathiTime } from '@/app/utils/dateUtils';
import type { Birthday } from '@/app/types/birthday';

import ListView from '../Calendar/ListView';
import { toast } from 'sonner';
import { DeleteModal } from '@/components/modals/DeleteModal';
import { AppointmentDetails } from '../AppointmentDetails';

export default function BJYMView() {
  const { appointments, loading, updateAppointment } = useAppointments();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'appointments' | 'birthdays'>('appointments');
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  
  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteModalLoading, setDeleteModalLoading] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [deleteModalTitle, setDeleteModalTitle] = useState('');
  const [deleteModalDescription, setDeleteModalDescription] = useState('');
  
  // Appointment details modal state
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const handleStatusChange = async (id: string, newStatus: 'going' | 'not-going' | 'scheduled') => {
    try {
      await updateAppointment(id, { status: newStatus });
      toast.success('Appointment status updated');
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast.error('Failed to update appointment status.');
    }
  };

  const handleEditAppointment = () => {
    // For now, just close the modal - edit functionality can be added later
    setSelectedEvent(null);
    toast.info('Edit functionality coming soon');
  };

  const handleDeleteAppointment = () => {
    if (selectedEvent?.appointment?.id) {
      // For now, just close the modal - delete functionality can be added later
      setSelectedEvent(null);
      toast.info('Delete functionality coming soon');
    }
  };

  // Helper functions moved to individual card components

  // Filtered appointments are now handled in the ListView component

  // Birthday functionality
  useEffect(() => {
    async function fetchBirthdays() {
      try {
        const res = await fetch('/api/birthdays');
        if (!res.ok) {
          console.error('Failed to fetch birthdays:', res.status, res.statusText);
          throw new Error(`Failed to fetch birthdays: ${res.status} ${res.statusText}`);
        }
        const data = await res.json();
        
        // Filter out any invalid birthday records to prevent crashes
        const validBirthdays = data.filter((bday: Birthday) => {
          const isValid = bday && 
            bday.id && 
            bday.fullName && 
            typeof bday.day === 'number' && 
            typeof bday.month === 'number' &&
            bday.day >= 1 && bday.day <= 31 &&
            bday.month >= 1 && bday.month <= 12;
          
          return isValid;
        });
        
        setBirthdays(validBirthdays);
      } catch (error) {
        console.error('Error fetching birthdays:', error);
      }
    }

    fetchBirthdays();
  }, []);



  const openDeleteBirthdayModal = (id: string, name: string) => {
    setItemToDelete(id);
    setDeleteModalTitle("Delete Birthday?");
    setDeleteModalDescription(`Are you sure you want to delete "${name}"'s birthday? This action cannot be undone.`);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    
    setDeleteModalLoading(true);
    try {
      const res = await fetch(`/api/birthdays/${itemToDelete}`, { method: 'DELETE' });
      if (res.ok) {
        setBirthdays(prev => prev.filter(b => b.id !== itemToDelete));
        toast.success('Birthday deleted successfully');
        setDeleteModalOpen(false);
      } else {
        throw new Error('Failed to delete birthday');
      }
    } catch {
      toast.error('Failed to delete birthday');
    } finally {
      setDeleteModalLoading(false);
    }
  };

  interface PDFOptions {
    title: string;
    subtitle: string;
  }

  const generateAppointmentsPDF = (appointments: CalendarEvent[], options: PDFOptions) => {
    const doc = new jsPDF();
    
    // Add organization header
    doc.setFontSize(16);
    doc.text('भारतीय जनता युवा मोर्चा मुंबई', 10, 20);
    doc.setFontSize(14);
    doc.text('अध्यक्ष तजिंदर सिंह तिवाना', 10, 30);
    
    // Add title and subtitle
    doc.setFontSize(20);
    doc.text(options.title, 10, 45);
    doc.setFontSize(16);
    doc.text(options.subtitle, 10, 55);
    
    // Add appointments
    let yPosition = 70;
    appointments.forEach((appointment: CalendarEvent, index: number) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(12);
      doc.text(`Appointment ${index + 1}`, 10, yPosition);
      doc.setFontSize(10);
      doc.text(`Program Name: ${appointment.appointment.programName}`, 10, yPosition + 8);
      doc.text(`Date: ${format(parseISO(appointment.appointment.startTime), "PPP")}`, 10, yPosition + 16);
      doc.text(`Time: ${toMarathiTime(appointment.appointment.startTime)}`, 10, yPosition + 24);
      doc.text(`Contact: ${appointment.appointment.contactNo}`, 10, yPosition + 32);
      doc.text(`Status: ${appointment.appointment.status}`, 10, yPosition + 40);
      
      yPosition += 55; // Increase spacing between appointments
    });
    
    return doc;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-screen flex flex-col bg-[#fafafa] dark:bg-gray-900">
       <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-10 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <span className="md:inline text-blue-600 dark:text-blue-400 font-semibold">Team Tajinder Singh Tiwana</span>
            <div className="relative flex-1 hidden sm:block">
              <Search className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
              <Input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 sm:pl-10 pr-8 sm:pr-10 text-sm sm:text-base h-8 sm:h-10" 
                placeholder="Search appointments..."
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 h-4 sm:h-5 w-4 sm:w-5 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 sm:h-5 w-4 sm:w-5" />
                </button>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8 sm:h-10 sm:w-10"
              onClick={() => signOut()}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

       <div className="relative px-4 sm:hidden mb-4 mt-4 flex-shrink-0">
        <Input
          className="w-full rounded-xl bg-slate-100 pl-6 pr-8 focus-visible:ring-slate-200"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search appointments..."
          style={{ boxShadow: "rgba(0, 0, 0, 0.15) 2.4px 2.4px 3.2px" }}
        />
        {searchQuery ? (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-7 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 hover:text-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        ) : (
          <Search
            className="absolute right-7 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600"
          />
        )}
      </div>

       <main className="flex-1 max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6 overflow-hidden">
         <div className="flex flex-col h-full">
           {/* View Mode Toggle */}
           <div className="flex justify-center mb-4 sm:mb-6 flex-shrink-0">
             <div className="flex bg-gray-100 rounded-lg p-1">
               <Button
                 variant={viewMode === 'appointments' ? "default" : "ghost"}
                 onClick={() => setViewMode('appointments')}
                 className="rounded-md"
               >
                 Appointments
               </Button>
               <Button
                 variant={viewMode === 'birthdays' ? "default" : "ghost"}
                 onClick={() => setViewMode('birthdays')}
                 className="rounded-md"
               >
                 <Gift className="h-4 w-4 mr-2" />
                 Birthdays
               </Button>
             </div>
           </div>

           {/* ListView Component */}
           <div className="flex-1 overflow-hidden">
             <ListView
               role="BJYM"
               appointments={appointments}
               birthdays={birthdays}
               view={viewMode}
               onStatusChange={handleStatusChange}
               searchQuery={searchQuery}
               selectedFilter={selectedFilter}
               onFilterChange={setSelectedFilter}
               onDeleteBirthday={(id) => {
                 const birthday = birthdays.find(b => b.id === id);
                 if (birthday) {
                   openDeleteBirthdayModal(id, birthday.fullName);
                 }
               }}
               onAppointmentClick={setSelectedEvent}
             />
           </div>
         </div>
       </main>
      {/* Export and Share Buttons */}
      <div className="fixed bottom-4 left-2 sm:left-4 flex flex-col xs:flex-row gap-2 xs:gap-3 z-50">
        <Button
          variant="outline"
          className="bg-white shadow-lg text-sm xs:text-base px-4 xs:px-6 py-3 xs:py-4 h-12 xs:h-14"
          onClick={() => {
            const doc = generateAppointmentsPDF(appointments, {
              title: 'Appointments Schedule',
              subtitle: 'Current View',
            });
            doc.save(`bjym-mumbai-appointments-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
          }}
        >
          <Download className="h-5 w-5 xs:h-6 xs:w-6 mr-2 xs:mr-3" />
          <span className="font-semibold">Export</span>
        </Button>
        <Button
          variant="outline"
          className="bg-white shadow-lg text-sm xs:text-base px-4 xs:px-6 py-3 xs:py-4 h-12 xs:h-14"
          onClick={() => setIsShareDialogOpen(true)}
        >
          <Share2 className="h-5 w-5 xs:h-6 xs:w-6 mr-2 xs:mr-3" />
          <span className="font-semibold">Share</span>
        </Button>
      </div>

      <ShareDialog
        isOpen={isShareDialogOpen}
        onOpenChange={setIsShareDialogOpen}
        events={appointments}
      />

      {selectedEvent && (
        <AppointmentDetails
          event={selectedEvent}
          onEdit={handleEditAppointment}
          onDelete={handleDeleteAppointment}
          onClose={() => setSelectedEvent(null)}
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
    </div>
  );
}