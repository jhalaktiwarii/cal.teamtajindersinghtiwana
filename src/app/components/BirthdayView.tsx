import React, { useState, useMemo } from 'react';
import { Gift, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BirthdayList } from './Sidebar/BirthdayList';
import BirthdayModal from '../../components/BirthdayModal';
import ExcelImportModal from './ExcelImportModal';
import type { Birthday } from '@/app/types/birthday';

interface BirthdayViewProps {
  birthdays: Birthday[];
  onSave: (birthday: Birthday) => void;
  onDelete: (id: string) => void;
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

export function BirthdayView({ birthdays, onSave, onDelete }: BirthdayViewProps) {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [editBirthday, setEditBirthday] = useState<Birthday | undefined>(undefined);

  const filtered = useMemo(() => {
    if (!search) return birthdays;
    const s = search.toLowerCase();
    return birthdays.filter(b =>
      b.fullName.toLowerCase().includes(s) ||
      (b.phone && b.phone.includes(s))
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

  const handleImportComplete = () => {
    // Refresh the birthdays list
    window.location.reload();
  };

  return (
    <div className="max-w-2xl mx-auto p-4 w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Gift className="h-6 w-6 text-blue-400" /> Birthdays
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
      <div className="mb-4 flex gap-2 items-center">
        <input
          type="text"
          placeholder="Search by name..."
          className="border rounded px-3 py-2 w-full max-w-xs"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
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
      <h3 className="text-lg font-semibold mb-2">All Birthdays</h3>
      <BirthdayList 
        birthdays={sorted} 
        onEdit={b => { setEditBirthday(b); setModalOpen(true); }}
        onDelete={onDelete}
      />
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
    </div>
  );
} 