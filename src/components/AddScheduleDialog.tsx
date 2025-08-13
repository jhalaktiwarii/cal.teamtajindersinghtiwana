import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { TimePicker } from '@/components/ui/time-picker';
import { Calendar } from '@/components/ui/calendar';
import { Appointment } from '@/app/types';

interface AddScheduleDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}

export default function AddScheduleDialog({ open, onClose, onSave }: AddScheduleDialogProps) {
  const [programName, setProgramName] = useState('');
  const [address, setAddress] = useState('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startTime, setStartTime] = useState<Date | undefined>(new Date());
  const [eventFrom, setEventFrom] = useState('');
  const [contactNo, setContactNo] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    const start = new Date(date!);
    start.setHours(startTime?.getHours() || 0, startTime?.getMinutes() || 0, 0, 0);
    await onSave({
      programName,
      address,
      startTime: start.toISOString(),
      eventFrom,
      contactNo: contactNo || undefined,
      isUrgent: false,
      userid: contactNo || '',
      status: 'scheduled',
    });
    setIsSaving(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-full p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl font-bold text-center">Add Appointment</DialogTitle>
          <div className="text-center text-gray-500 text-base mt-1 mb-2 font-medium">Create Appointment</div>
        </DialogHeader>
        <form className="p-6 pt-2 space-y-4" onSubmit={e => { e.preventDefault(); handleSave(); }}>
          <div>
            <label className="block mb-1 font-medium">Program Name</label>
            <Input value={programName} onChange={e => setProgramName(e.target.value)} placeholder="Enter program name" required />
          </div>
          <div>
            <label className="block mb-1 font-medium">Address</label>
            <Textarea value={address} onChange={e => setAddress(e.target.value)} placeholder="Enter address" required className="resize-none" />
          </div>
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="block mb-1 font-medium">Date</label>
              <Button type="button" variant="outline" className="w-full justify-start" onClick={() => setShowDatePicker(v => !v)}>
                {date ? date.toLocaleDateString() : 'Pick a date'}
              </Button>
              {showDatePicker && (
                <div className="absolute z-50 mt-2 bg-white border rounded shadow-lg">
                  <Calendar mode="single" selected={date} onSelect={d => { setDate(d); setShowDatePicker(false); }} />
                </div>
              )}
            </div>
            <div className="flex-1">
              <label className="block mb-1 font-medium">Start Time</label>
              <TimePicker date={startTime} setDate={setStartTime} />
            </div>

          </div>
          <div>
            <label className="block mb-1 font-medium">Event From</label>
            <Input value={eventFrom} onChange={e => setEventFrom(e.target.value)} placeholder="Enter event organizer" required />
          </div>
          <div>
            <label className="block mb-1 font-medium">Contact No</label>
            <Input value={contactNo} onChange={e => setContactNo(e.target.value)} placeholder="Enter contact number" />
          </div>
          <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-10 mt-2 rounded-md font-medium transition-colors" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Appointment'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
} 