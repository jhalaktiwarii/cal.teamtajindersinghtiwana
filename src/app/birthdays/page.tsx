'use client'

import React, { useState, useEffect, useMemo } from 'react';
import { Gift, Upload, X, ArrowLeft, Menu, FileText, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BirthdayGrid } from '../components/BirthdayGrid';
import BirthdayModal from '../../components/BirthdayModal';
import ExcelImportModal from '../components/ExcelImportModal';
import CSVImportModal from '../components/CSVImportModal';
import DuplicateRemovalModal from '@/app/components/DuplicateRemovalModal';
import { DeleteModal } from '@/components/modals/DeleteModal';
import type { Birthday } from '../types/birthday';
import { includesCI } from '@/utils/strings';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Sidebar } from '../components/Sidebar';
import { SidebarDrawer } from '@/components/SidebarDrawer';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useAppointments } from '../hooks/useAppointments';

// Helper function to get next birthday occurrence
const getNextBirthday = (day: number, month: number): Date => {
  const today = new Date();
  const currentYear = today.getFullYear();
  
  let nextBirthday = new Date(currentYear, month - 1, day);
  
  if (nextBirthday < today) {
    nextBirthday = new Date(currentYear + 1, month - 1, day);
  }
  
  return nextBirthday;
};

export default function BirthdaysPage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const { appointments, updateAppointment } = useAppointments();
  
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [csvImportModalOpen, setCsvImportModalOpen] = useState(false);
  const [duplicateRemovalModalOpen, setDuplicateRemovalModalOpen] = useState(false);
  const [editBirthday, setEditBirthday] = useState<Birthday | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
  
  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteModalLoading, setDeleteModalLoading] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [deleteModalTitle, setDeleteModalTitle] = useState('');
  const [deleteModalDescription, setDeleteModalDescription] = useState('');

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
      const validBirthdays = data.filter((birthday: Birthday, index: number) => {
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
    } finally {
      setIsLoading(false);
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

  // Sidebar handlers
  const handleStatusChange = (id: string, status: 'scheduled' | 'going' | 'not-going') => {
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

  const handleEditBirthday = (birthday: Birthday) => {
    setEditBirthday(birthday);
    setModalOpen(true);
  };

  const filtered = useMemo(() => {
    if (!search) return birthdays;
    return birthdays.filter(b =>
      includesCI(b?.fullName, search) ||
      includesCI(b?.phone, search) ||
      includesCI(b?.ward, search)
    );
  }, [birthdays, search]);

  // Sort birthdays by next occurrence (upcoming first, past after today)
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const nextA = getNextBirthday(a.day, a.month);
      const nextB = getNextBirthday(b.day, b.month);
      return nextA.getTime() - nextB.getTime();
    });
  }, [filtered]);

  const handleSaveBirthday = async (bday: Birthday) => {
    try {
      const method = bday.id ? 'PUT' : 'POST';
      const url = bday.id ? `/api/birthdays/${bday.id}` : '/api/birthdays';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bday),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${bday.id ? 'update' : 'create'} birthday`);
      }

      const result = await response.json();

      if (bday.id) {
        setBirthdays(prev => prev.map(b => b.id === bday.id ? result : b));
        toast.success('Birthday updated successfully');
      } else {
        setBirthdays(prev => [...prev, result]);
        toast.success('Birthday added successfully');
      }
      
      setModalOpen(false);
      setEditBirthday(undefined);
    } catch (error) {
      console.error('Error saving birthday:', error);
      toast.error(`Failed to ${bday.id ? 'update' : 'create'} birthday`);
    }
  };

  const handleDeleteBirthday = async (id: string) => {
    try {
      setDeleteModalLoading(true);
      
      const response = await fetch(`/api/birthdays/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete birthday');
      }

      setBirthdays(prev => prev.filter(b => b.id !== id));
      toast.success('Birthday deleted successfully');
      setDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error('Error deleting birthday:', error);
      toast.error('Failed to delete birthday');
    } finally {
      setDeleteModalLoading(false);
    }
  };

  const openDeleteBirthdayModal = (id: string, name: string) => {
    setItemToDelete(id);
    setDeleteModalTitle('Delete Birthday');
    setDeleteModalDescription(`Are you sure you want to delete ${name}'s birthday? This action cannot be undone.`);
    setDeleteModalOpen(true);
  };

  const handleImportComplete = () => {
    // Refresh birthdays data after import
    fetchBirthdays();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading birthdays...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden relative">
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
      {!isMobile && (
        <aside className="w-80 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
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
        </aside>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full p-1 xs:p-2 sm:p-3 md:p-4 overflow-auto thin-scrollbar">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 mb-4">
            <div className="flex items-center justify-between h-16 px-4">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.back()}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </Button>
                <div className="flex items-center space-x-2">
                  <Gift className="h-6 w-6 text-blue-500" />
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Birthdays</h1>
                </div>
              </div>
            </div>
          </div>

          {/* Birthday Content */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <Button 
                onClick={() => setImportModalOpen(true)} 
                variant="outline"
                className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
              >
                <Upload className="h-4 w-4 mr-2" />
                Import Excel
              </Button>
              <Button 
                onClick={() => setCsvImportModalOpen(true)} 
                variant="outline"
                className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
              >
                <FileText className="h-4 w-4 mr-2" />
                Import CSV
              </Button>
              <Button 
                onClick={() => setDuplicateRemovalModalOpen(true)} 
                variant="outline"
                className="bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Remove Duplicates
              </Button>
              <Button 
                onClick={() => { setEditBirthday(undefined); setModalOpen(true); }} 
                className="bg-blue-500 text-white hover:bg-blue-600"
              >
                Add Birthday
              </Button>
            </div>

            {/* Search */}
            <div className="mb-6 flex flex-col sm:flex-row gap-2 items-start sm:items-center">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search by name, phone, or ward..."
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 pr-8 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <Button
                variant="outline"
                onClick={() => setSearch('')}
                className="w-full sm:w-auto"
              >
                Clear
              </Button>
            </div>

            {/* Birthday Grid */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                All Birthdays ({sorted.length})
              </h3>
              <BirthdayGrid 
                birthdays={sorted} 
                onEdit={(b: Birthday) => { setEditBirthday(b); setModalOpen(true); }}
                onDelete={(id: string) => {
                  const birthday = birthdays.find(b => b.id === id);
                  if (birthday) {
                    openDeleteBirthdayModal(id, birthday.fullName);
                  }
                }}
              />
            </div>
          </div>
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

      {/* Modals */}
      <BirthdayModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditBirthday(undefined); }}
        onSave={handleSaveBirthday}
        onDelete={handleDeleteBirthday}
        initialBirthday={editBirthday}
      />
      
      <ExcelImportModal
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImportComplete={handleImportComplete}
      />

      <CSVImportModal
        open={csvImportModalOpen}
        onClose={() => setCsvImportModalOpen(false)}
        onImportComplete={handleImportComplete}
      />

      <DuplicateRemovalModal
        open={duplicateRemovalModalOpen}
        onClose={() => setDuplicateRemovalModalOpen(false)}
        onComplete={handleImportComplete}
      />

      <DeleteModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={() => {
          if (itemToDelete) {
            return handleDeleteBirthday(itemToDelete);
          }
        }}
        title={deleteModalTitle}
        description={deleteModalDescription}
        loading={deleteModalLoading}
      />
    </div>
  );
}
