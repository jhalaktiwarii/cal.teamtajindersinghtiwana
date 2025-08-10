import React, { useState, useMemo } from 'react';
import { Gift, Upload, Download, Trash2, Database, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BirthdayList } from './Sidebar/BirthdayList';
import BirthdayModal from '../../components/BirthdayModal';
import LocalExcelImportModal from './LocalExcelImportModal';
import { useLocalBirthdays } from '../hooks/useLocalBirthdays';
import type { Birthday } from '@/app/types/birthday';
import { toast } from 'sonner';
import { includesCI } from '@/utils/strings';
import { DeleteModal } from '@/components/modals/DeleteModal';

export function LocalBirthdayView() {
  const {
    birthdays,
    isLoading,
    createBirthday,
    updateBirthday,
    deleteBirthday,
    clearAllBirthdays,
    exportBirthdays,
    importBirthdays
  } = useLocalBirthdays();

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [editBirthday, setEditBirthday] = useState<Birthday | undefined>(undefined);
  
  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteModalLoading, setDeleteModalLoading] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [deleteModalTitle, setDeleteModalTitle] = useState('');
  const [deleteModalDescription, setDeleteModalDescription] = useState('');

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

  const todaysBirthdays = useMemo(() => {
    return sorted.filter(b => isBirthdayToday(b.day, b.month));
  }, [sorted]);

  const handleImportComplete = (importedBirthdays: Birthday[]) => {
    // The imported birthdays are already added to local storage by the hook
    toast.success(`Successfully imported ${importedBirthdays.length} birthdays to local storage`);
  };

  const handleSave = async (birthday: Birthday) => {
    try {
      if (birthday.id.startsWith('local_bday_')) {
        // Update existing birthday
        await updateBirthday(birthday.id, birthday);
        toast.success('Birthday updated successfully');
      } else {
        // Create new birthday
        const birthdayData = {
          fullName: birthday.fullName,
          address: birthday.address,
          phone: birthday.phone,
          ward: birthday.ward,
          day: birthday.day,
          month: birthday.month,
          year: birthday.year,
          reminder: birthday.reminder
        };
        await createBirthday(birthdayData);
        toast.success('Birthday added successfully');
      }
    } catch {
      toast.error('Failed to save birthday');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteBirthday(id);
      toast.success('Birthday deleted successfully');
    } catch {
      toast.error('Failed to delete birthday');
    }
  };

  const openDeleteModal = (id: string, name: string) => {
    setItemToDelete(id);
    setDeleteModalTitle("Delete Birthday?");
    setDeleteModalDescription(`Are you sure you want to delete "${name}"'s birthday? This action cannot be undone.`);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    
    setDeleteModalLoading(true);
    try {
      await deleteBirthday(itemToDelete);
      toast.success('Birthday deleted successfully');
      setDeleteModalOpen(false);
    } catch (error) {
      toast.error('Failed to delete birthday');
    } finally {
      setDeleteModalLoading(false);
    }
  };



  const handleExport = () => {
    try {
      exportBirthdays();
      toast.success('Birthdays exported successfully');
    } catch {
      toast.error('Failed to export birthdays');
    }
  };

  const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importBirthdays(file)
        .then(() => {
          toast.success('Birthdays imported successfully');
        })
        .catch((error) => {
          toast.error(`Failed to import: ${error.message}`);
        });
    }
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all local birthdays? This action cannot be undone.')) {
      clearAllBirthdays();
      toast.success('All birthdays cleared');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-4 w-full">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading birthdays...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Database className="h-6 w-6 text-green-400" /> Local Birthdays
        </h2>
        <div className="flex gap-2">
          <Button 
            onClick={() => setImportModalOpen(true)} 
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
          >
            <Upload className="h-4 w-4 mr-2" />
            Import Excel
          </Button>
          <Button 
            onClick={() => { setEditBirthday(undefined); setModalOpen(true); }} 
            className="bg-blue-500 text-white rounded-md px-4 py-2 font-medium shadow hover:bg-blue-600"
          >
            Add Birthday
          </Button>
        </div>
      </div>

      {/* Local Storage Actions */}
      <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-medium text-yellow-800 mb-2">Local Storage Actions</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="text-blue-600 border-blue-300 hover:bg-blue-50"
          >
            <Download className="h-4 w-4 mr-1" />
            Export JSON
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => document.getElementById('json-import')?.click()}
            className="text-green-600 border-green-300 hover:bg-green-50"
          >
            <Upload className="h-4 w-4 mr-1" />
            Import JSON
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearAll}
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        </div>
        <input
          id="json-import"
          type="file"
          accept=".json"
          onChange={handleImportJSON}
          className="hidden"
        />
        <p className="text-xs text-yellow-700 mt-2">
          💡 Data is stored in your browser&apos;s local storage. It will persist until you clear it or clear your browser data.
        </p>
      </div>

      <div className="mb-4 flex gap-2 items-center">
        <div className="relative flex-1 max-w-xs">
          <input
            type="text"
            placeholder="Search by name..."
            className="border rounded px-3 py-2 w-full pr-8"
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
          className="ml-2"
          onClick={() => setSearch('')}
        >
          Clear
        </Button>
      </div>

      <div className="mb-4">
        <Button
          className="bg-green-500 text-white rounded-md px-4 py-2 font-medium shadow hover:bg-green-600"
          onClick={() => alert('Wishes sent to all!')}
          disabled={todaysBirthdays.length === 0}
        >
          Send All Wishes ({todaysBirthdays.length})
        </Button>
      </div>

      <h3 className="text-lg font-semibold mb-2">All Birthdays ({birthdays.length})</h3>
      
      {birthdays.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Gift className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No birthdays stored locally yet.</p>
          <p className="text-sm">Add some birthdays or import from Excel to get started!</p>
        </div>
      ) : (
        <BirthdayList 
          birthdays={sorted} 
          onEdit={b => { setEditBirthday(b); setModalOpen(true); }}
          onDelete={(id) => {
            const birthday = birthdays.find(b => b.id === id);
            if (birthday) {
              openDeleteModal(id, birthday.fullName);
            }
          }}
        />
      )}

      <BirthdayModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditBirthday(undefined); }}
        onSave={handleSave}
        onDelete={(id) => {
          const birthday = birthdays.find(b => b.id === id);
          if (birthday) {
            openDeleteModal(id, birthday.fullName);
          }
        }}
        initialBirthday={editBirthday}
      />
      
      <LocalExcelImportModal
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImportComplete={handleImportComplete}
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

// Helper function to get next birthday occurrence
const getNextBirthday = (day: number, month: number): Date => {
  const today = new Date();
  const currentYear = today.getFullYear();
  
  // Create birthday for current year
  let nextBirthday = new Date(currentYear, month - 1, day);
  
  // If birthday has passed this year, set it for next year
  if (nextBirthday < today) {
    nextBirthday = new Date(currentYear + 1, month - 1, day);
  }
  
  return nextBirthday;
};

// Helper function to check if birthday is today
const isBirthdayToday = (day: number, month: number): boolean => {
  const today = new Date();
  return today.getDate() === day && today.getMonth() === month - 1;
}; 