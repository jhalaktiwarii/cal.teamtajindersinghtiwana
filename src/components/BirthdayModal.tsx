import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
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
  const [designation, setDesignation] = useState(initialBirthday?.designation || '');
  const [address, setAddress] = useState(initialBirthday?.address || '');
  const [phone, setPhone] = useState(initialBirthday?.phone || '');
  const [birthday, setBirthday] = useState<Date>(initialBirthday ? new Date(initialBirthday.birthday) : new Date());
  const [going, setGoing] = useState(initialBirthday?.going ?? true);
  const [reminder, setReminder] = useState<Date>(initialBirthday?.reminder ? new Date(`1970-01-01T${initialBirthday.reminder}`) : new Date());
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFullName(initialBirthday?.fullName || '');
    setDesignation(initialBirthday?.designation || '');
    setAddress(initialBirthday?.address || '');
    setPhone(initialBirthday?.phone || '');
    setBirthday(initialBirthday ? new Date(initialBirthday.birthday) : new Date());
    setGoing(initialBirthday?.going ?? true);
    setReminder(initialBirthday?.reminder ? new Date(`1970-01-01T${initialBirthday.reminder}`) : new Date());
  }, [initialBirthday, open]);

  const handleSave = () => {
    setIsSaving(true);
    if (initialBirthday?.id) {
      onSave({
        id: initialBirthday.id,
        fullName,
        designation,
        address,
        phone,
        birthday: birthday.toISOString(),
        going,
        reminder: reminder.toTimeString().slice(0,5),
      });
    } else {
      const newBirthday: NewBirthday = {
        fullName,
        designation,
        address,
        phone,
        birthday: birthday.toISOString(),
        going,
        reminder: reminder.toTimeString().slice(0,5),
      };
      onSave(newBirthday as Birthday); // Cast to Birthday for compatibility
    }
    setIsSaving(false);
    onClose();
  };

  const handleDelete = () => {
    if (onDelete && initialBirthday) {
      onDelete(initialBirthday.id);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl font-bold text-center">{initialBirthday ? 'Edit Birthday' : 'Add Birthday'}</DialogTitle>
        </DialogHeader>
        <form className="p-6 pt-2 space-y-4" onSubmit={e => { e.preventDefault(); handleSave(); }}>
          <div>
            <label className="block mb-1 font-medium">Full Name</label>
            <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Enter full name" required />
          </div>
          <div>
            <label className="block mb-1 font-medium">Designation</label>
            <Input value={designation} onChange={e => setDesignation(e.target.value)} placeholder="Enter designation" required />
          </div>
          <div>
            <label className="block mb-1 font-medium">Address</label>
            <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="Enter address" required />
          </div>
          <div>
            <label className="block mb-1 font-medium">Phone Number</label>
            <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Enter phone number" required />
          </div>
          <div className="flex items-center gap-2">
            <label className="block font-medium">Going</label>
            <Switch checked={going} onCheckedChange={setGoing} />
            <span className="ml-2 text-xs text-gray-500">{going ? '✅ Going' : '❌ Not Going'}</span>
          </div>
          <div>
            <label className="block mb-1 font-medium">Birthday (recurs annually)</label>
            <Input type="date" value={birthday.toISOString().slice(0,10)} onChange={e => setBirthday(new Date(e.target.value))} required />
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