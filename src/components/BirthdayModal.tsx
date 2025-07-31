import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import { TimePicker } from '@/components/ui/time-picker';
import type { Birthday } from '@/app/types/birthday';

type NewBirthday = Omit<Birthday, 'id'>;

interface BirthdayModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (birthday: Birthday) => void;
  onDelete?: (id: string) => void;
  initialBirthday?: Birthday;
}

export default function BirthdayModal({ open, onClose, onSave, onDelete, initialBirthday }: BirthdayModalProps) {
  const [fullName, setFullName] = useState(initialBirthday?.fullName || '');
  const [address, setAddress] = useState(initialBirthday?.address || '');
  const [phone, setPhone] = useState(initialBirthday?.phone || '');
  const [day, setDay] = useState(initialBirthday?.day || 1);
  const [month, setMonth] = useState(initialBirthday?.month || 1);
  const [year, setYear] = useState(initialBirthday?.year || new Date().getFullYear());

  const [reminder, setReminder] = useState<Date>(() => {
    if (initialBirthday?.reminder) {
      try {
        // Try to parse the reminder time, fallback to current time if invalid
        const reminderDate = new Date(`1970-01-01T${initialBirthday.reminder}`);
        if (isNaN(reminderDate.getTime())) {
          return new Date();
        }
        return reminderDate;
      } catch {
        return new Date();
      }
    }
    return new Date();
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFullName(initialBirthday?.fullName || '');
    setAddress(initialBirthday?.address || '');
    setPhone(initialBirthday?.phone || '');
    setDay(initialBirthday?.day || 1);
    setMonth(initialBirthday?.month || 1);
    setYear(initialBirthday?.year || new Date().getFullYear());

    if (initialBirthday?.reminder) {
      try {
        const reminderDate = new Date(`1970-01-01T${initialBirthday.reminder}`);
        if (!isNaN(reminderDate.getTime())) {
          setReminder(reminderDate);
        }
      } catch {
        // Keep current reminder time if parsing fails
      }
    }
  }, [initialBirthday, open]);

  const handleSave = () => {
    setIsSaving(true);
    if (initialBirthday?.id) {
      onSave({
        id: initialBirthday.id,
        fullName,
        address: address || undefined,
        phone: phone || undefined,
        day,
        month,
        year,
        reminder: reminder.toTimeString().slice(0,5),
      });
    } else {
      const newBirthday: NewBirthday = {
        fullName,
        address: address || undefined,
        phone: phone || undefined,
        day,
        month,
        year,
        reminder: reminder.toTimeString().slice(0,5),
      };
      onSave(newBirthday as Birthday); // Cast to Birthday for compatibility
    }
    setIsSaving(false);
    onClose();
  };

  const handleDelete = () => {
    if (initialBirthday?.id && onDelete) {
      onDelete(initialBirthday.id);
      onClose();
    }
  };

  const getDaysInMonth = (month: number, year?: number) => {
    // Use current year as fallback if year is not provided
    const effectiveYear = year || new Date().getFullYear();
    return new Date(effectiveYear, month, 0).getDate();
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl font-bold text-center">{initialBirthday ? 'Edit Birthday' : 'Add Birthday'}</DialogTitle>
        </DialogHeader>
        <form className="p-6 pt-2 space-y-4" onSubmit={e => { e.preventDefault(); handleSave(); }}>
          <div>
            <label className="block mb-1 font-medium">Full Name *</label>
            <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Enter full name" required />
          </div>
          <div>
            <label className="block mb-1 font-medium">Address (Optional)</label>
            <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="Enter address" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Phone Number (Optional)</label>
            <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Enter phone number" />
          </div>
          
          {/* Birthday Date Fields */}
          <div className="space-y-2">
            <label className="block font-medium">Birthday (recurs annually) *</label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Day</label>
                <select 
                  value={day} 
                  onChange={e => setDay(Number(e.target.value))}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  {Array.from({ length: getDaysInMonth(month, year) }, (_, i) => i + 1).map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Month</label>
                <select 
                  value={month} 
                  onChange={e => {
                    const newMonth = Number(e.target.value);
                    setMonth(newMonth);
                    // Adjust day if it exceeds the new month's days
                    const maxDays = getDaysInMonth(newMonth, year);
                    if (day > maxDays) {
                      setDay(maxDays);
                    }
                  }}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  {months.map((monthName, index) => (
                    <option key={index + 1} value={index + 1}>{monthName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Year</label>
                <select 
                  value={year} 
                  onChange={e => {
                    const newYear = Number(e.target.value);
                    setYear(newYear);
                    // Adjust day if it exceeds the new year's February days (leap year)
                    if (month === 2) {
                      const maxDays = getDaysInMonth(month, newYear);
                      if (day > maxDays) {
                        setDay(maxDays);
                      }
                    }
                  }}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  {years.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>


          <div>
            <label className="block mb-1 font-medium">Reminder Time</label>
            <TimePicker date={reminder} setDate={d => setReminder(d || new Date())} />
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="w-full bg-blue-500 text-white hover:bg-blue-600 h-10 mt-2 rounded-md font-medium transition-colors" disabled={isSaving}>
              {isSaving ? 'Saving...' : initialBirthday ? 'Save Changes' : 'Add Birthday'}
            </Button>
            {initialBirthday && onDelete && (
              <Button type="button" className="w-full bg-red-500 text-white hover:bg-red-600 h-10 mt-2 rounded-md font-medium transition-colors" onClick={handleDelete}>
                Delete
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 