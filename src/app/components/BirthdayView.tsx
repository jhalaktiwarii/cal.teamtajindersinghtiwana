import React, { useState, useMemo } from 'react';
import type { Birthday } from '@/app/types/birthday';
import { BirthdayList } from './Sidebar/BirthdayList';
import BirthdayModal from '@/components/BirthdayModal';
import { Button } from '@/components/ui/button';
import { Gift } from 'lucide-react';
import { isToday } from 'date-fns';

interface BirthdayViewProps {
  birthdays: Birthday[];
  onSave: (bday: Birthday) => void;
  onDelete: (id: string) => void;
  onToggleGoing: (id: string, going: boolean) => void;
}

export function BirthdayView({ birthdays, onSave, onDelete, onToggleGoing }: BirthdayViewProps) {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editBirthday, setEditBirthday] = useState<Birthday | undefined>(undefined);

  const filtered = useMemo(() => {
    if (!search) return birthdays;
    const s = search.toLowerCase();
    return birthdays.filter(b =>
      b.fullName.toLowerCase().includes(s) ||
      b.designation.toLowerCase().includes(s) ||
      b.phone.includes(s)
    );
  }, [birthdays, search]);

  const today = new Date();
  today.setHours(0,0,0,0);
  // Sort birthdays by next occurrence (upcoming first, past after today)
  const sorted = [...filtered].sort((a, b) => {
    const aDate = new Date(a.birthday);
    const bDate = new Date(b.birthday);
    aDate.setFullYear(today.getFullYear());
    bDate.setFullYear(today.getFullYear());
    if (aDate < today) aDate.setFullYear(today.getFullYear() + 1);
    if (bDate < today) bDate.setFullYear(today.getFullYear() + 1);
    return aDate.getTime() - bDate.getTime();
  });

  const todaysBirthdays = sorted.filter(b => isToday(new Date(b.birthday)));

  return (
    <div className="max-w-2xl mx-auto p-4 w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Gift className="h-6 w-6 text-blue-400" /> Birthdays
        </h2>
        <Button onClick={() => { setEditBirthday(undefined); setModalOpen(true); }} className="bg-blue-500 text-white rounded-md px-4 py-2 font-medium shadow hover:bg-blue-600">Add Birthday</Button>
      </div>
      <div className="mb-4 flex gap-2 items-center">
        <input
          type="text"
          placeholder="Search by name, designation, or phone..."
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
        onToggleGoing={onToggleGoing}
      />
      <BirthdayModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditBirthday(undefined); }}
        onSave={onSave}
        onDelete={onDelete}
        initialBirthday={editBirthday}
      />
    </div>
  );
} 