import React, { useState, useMemo } from 'react';
import { Gift, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BirthdayList } from './Sidebar/BirthdayList';
import BirthdayModal from '../../components/BirthdayModal';
import ExcelImportModal from './ExcelImportModal';
import type { Birthday } from '@/app/types/birthday';
import { includesCI } from '@/utils/strings';
import { DeleteModal } from '@/components/modals/DeleteModal';
import { toast } from 'sonner';

interface BirthdayViewProps {
  birthdays: Birthday[];
  onSave: (birthday: Birthday) => void;
  onDelete: (id: string) => void;
}

  const getNextBirthday = (day: number, month: number): Date => {
  const today = new Date();
  const currentYear = today.getFullYear();
  
   let nextBirthday = new Date(currentYear, month - 1, day);
  
   if (nextBirthday < today) {
    nextBirthday = new Date(currentYear + 1, month - 1, day);
  }
  
  return nextBirthday;
};

export function BirthdayView({ birthdays, onSave, onDelete }: BirthdayViewProps) {
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

  const handleImportComplete = () => {
    // The birthdays will be updated through the parent component's state
    // No need to reload the page
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
      onDelete(itemToDelete);
      toast.success('Birthday deleted successfully');
      setDeleteModalOpen(false);
    } catch (error) {
      toast.error('Failed to delete birthday');
    } finally {
      setDeleteModalLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-1 xs:p-2 sm:p-3 md:p-4 w-full overflow-x-auto min-w-0">
      <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
        <h2 className="text-lg xs:text-xl sm:text-2xl font-bold flex items-center gap-2">
          <Gift className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 text-blue-400" /> 
          <span className="whitespace-nowrap">Birthdays</span>
        </h2>
        <div className="flex flex-col xs:flex-row gap-2 w-full">
          <Button 
            onClick={() => setImportModalOpen(true)} 
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 text-xs xs:text-sm sm:text-base w-full xs:w-auto"
          >
            <Upload className="h-3 w-3 xs:h-4 xs:w-4 mr-1 xs:mr-2" />
            <span className="whitespace-nowrap">Import Excel</span>
          </Button>
          <Button 
            onClick={() => { setEditBirthday(undefined); setModalOpen(true); }} 
            className="bg-blue-500 text-white rounded-md px-2 xs:px-3 sm:px-4 py-2 font-medium shadow hover:bg-blue-600 text-xs xs:text-sm sm:text-base w-full xs:w-auto"
          >
            <span className="whitespace-nowrap">Add Birthday</span>
          </Button>
        </div>
      </div>

      <div className="mb-4 flex flex-col xs:flex-row gap-2 items-start xs:items-center">
        <input
          type="text"
          placeholder="Search by name..."
          className="border rounded px-2 xs:px-3 py-2 w-full text-xs xs:text-sm sm:text-base"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <Button
          variant="outline"
          className="w-full xs:w-auto text-xs xs:text-sm sm:text-base whitespace-nowrap"
          onClick={() => setSearch('')}
        >
          Clear
        </Button>
      </div>
      <h3 className="text-base xs:text-lg font-semibold mb-2">All Birthdays</h3>
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
      <div className="h-20 sm:h-16"></div> {/* Spacer for floating action button */}
      <BirthdayModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditBirthday(undefined); }}
        onSave={onSave}
        onDelete={onDelete}
        initialBirthday={editBirthday}
      />
      <ExcelImportModal
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