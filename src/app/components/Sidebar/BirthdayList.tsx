import React, { useState } from 'react';
import { Edit2, Gift, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { format } from 'date-fns';
import type { Birthday } from '@/app/types/birthday';

interface BirthdayListProps {
  birthdays: Birthday[];
  onEdit?: (bday: Birthday) => void;
  onDelete?: (id: string) => void;
  onToggleGoing?: (id: string, going: boolean) => void;
}

export function BirthdayList({ birthdays, onEdit, onDelete, onToggleGoing }: BirthdayListProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  if (!birthdays || birthdays.length === 0) {
    return (
      <div>
        <h3 className="text-lg font-semibold mb-4">Upcoming Birthdays</h3>
        <div className="p-4 text-center text-sm text-gray-500">
          No birthdays found
        </div>
      </div>
    );
  }

  // Sort by next upcoming birthday (ignoring year)
  const today = new Date();
  const sorted = [...birthdays].sort((a, b) => {
    const nextA = new Date(today.getFullYear(), new Date(a.birthday).getMonth(), new Date(a.birthday).getDate());
    const nextB = new Date(today.getFullYear(), new Date(b.birthday).getMonth(), new Date(b.birthday).getDate());
    if (nextA < today) nextA.setFullYear(today.getFullYear() + 1);
    if (nextB < today) nextB.setFullYear(today.getFullYear() + 1);
    return nextA.getTime() - nextB.getTime();
  });

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Upcoming Birthdays</h3>
      <div className="space-y-2">
        {sorted.map((bday) => (
          <div
            key={bday.id}
            className="flex items-center justify-between p-3 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors shadow-sm"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Gift className="h-4 w-4 text-blue-400" />
                <span className="font-medium text-gray-900 truncate">{bday.fullName}</span>
                <span className="text-xs text-gray-500 ml-2 truncate">{bday.designation}</span>
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                {format(new Date(bday.birthday), 'MMM d')} • {bday.going ? '✅ Going' : '❌ Not Going'}
              </div>
            </div>
            <div className="flex items-center gap-1 ml-2">
              <Switch 
                checked={bday.going} 
                disabled={updatingId === bday.id}
                onCheckedChange={async v => {
                  setUpdatingId(bday.id);
                  await onToggleGoing?.(bday.id, v);
                  setUpdatingId(null);
                }} 
              />
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onEdit?.(bday)} title="Edit">
                <Edit2 className="h-4 w-4 text-blue-500" />
              </Button>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onDelete?.(bday.id)} title="Delete">
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 