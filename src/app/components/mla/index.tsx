"use client"

import React, { useState, useEffect } from 'react';
import { useAppointments } from '@/app/hooks/useAppointments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format, startOfToday, parseISO } from 'date-fns';
import { Search, LogOut, X, Download, Share2, Gift } from 'lucide-react';
import { signOut } from "next-auth/react";
import { jsPDF } from 'jspdf';
import { ShareDialog } from '../ShareDialog';
import { CalendarEvent } from '@/app/types';
import { toMarathiTime } from '@/app/utils/dateUtils';
import type { Birthday } from '@/app/types/birthday';
import { includesCI } from '@/utils/strings';
import ListView from '../Calendar/ListView';
import { toast } from 'sonner';
import { DeleteModal } from '@/components/modals/DeleteModal';

export default function MLAView() {
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

  const handleStatusChange = async (id: string, newStatus: 'going' | 'not-going' | 'scheduled') => {
    try {
      await updateAppointment(id, { status: newStatus });
      toast.success('Appointment status updated');
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast.error('Failed to update appointment status.');
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

  const handleSaveBirthday = async (bday: Birthday) => {
    try {
      if (bday.id) {
        // Update existing birthday
        const res = await fetch(`/api/birthdays/${bday.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bday),
        });
        if (res.ok) {
          const updated = await res.json();
          setBirthdays(prev => prev.map(b => b.id === updated.id ? updated : b));
        }
      } else {
        // Create new birthday
        const res = await fetch('/api/birthdays', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bday),
        });
        if (res.ok) {
          const newBirthday = await res.json();
          setBirthdays(prev => [newBirthday, ...prev]);
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
    } catch (error) {
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
    doc.setFontSize(24);
    doc.text(options.title, 10, 20);
    doc.setFontSize(18);
    doc.text(options.subtitle, 10, 30);
    appointments.forEach((appointment: CalendarEvent, index: number) => {
      doc.text(`Appointment ${index + 1}`, 10, 40 + index * 20);
      doc.text(`Program Name: ${appointment.appointment.programName}`, 10, 50 + index * 20);
      doc.text(`Date: ${format(parseISO(appointment.appointment.startTime), "PPP")}`, 10, 60 + index * 20);
      doc.text(`Time: ${toMarathiTime(appointment.appointment.startTime)}`, 10, 70 + index * 20);
      doc.text(`Contact: ${appointment.appointment.contactNo}`, 10, 80 + index * 20);
      doc.text(`Status: ${appointment.appointment.status}`, 10, 90 + index * 20);
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
          className="w-full rounded-xl bg-slate-100 pl-6 focus-visible:ring-slate-200"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search appointments..."
          style={{ boxShadow: "rgba(0, 0, 0, 0.15) 2.4px 2.4px 3.2px" }}
        />
        {searchQuery === "" ? (
          <Search
            className="absolute right-7 top-3 h-4 w-4 text-slate-600"
            size={25}
          />
        ) : (
          <X
            className="absolute right-7 top-3 h-4 w-4 cursor-pointer text-slate-600"
            size={25}
            onClick={() => setSearchQuery("")}
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
               role="mla"
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
             />
           </div>
         </div>
       </main>
      {/* Export and Share Buttons */}
      <div className="fixed bottom-4 left-4 flex gap-2">
        <Button
          variant="outline"
          className="bg-white"
          onClick={() => {
            const doc = generateAppointmentsPDF(appointments, {
              title: 'Appointments Schedule',
              subtitle: 'Current View',
            });
            doc.save(`appointments-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
          }}
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
        <Button
          variant="outline"
          className="bg-white"
          onClick={() => setIsShareDialogOpen(true)}
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </div>

      <ShareDialog
        isOpen={isShareDialogOpen}
        onOpenChange={setIsShareDialogOpen}
        events={appointments}
      />

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