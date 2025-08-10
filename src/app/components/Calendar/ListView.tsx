import * as React from "react";
import { startOfDay, formatISO } from "date-fns";
import { useDatePager } from "../../hooks/useDatePager";
import { DateStrip } from "./DateStrip";
import { DayList } from "./DayList";
import { AppointmentCard } from "./AppointmentCard";
import { BirthdayCard } from "./BirthdayCard";
import { CalendarEvent } from "@/app/types";
import type { Birthday } from "@/app/types/birthday";

interface ListViewProps {
  role?: "mla" | "staff";
  appointments: CalendarEvent[];
  birthdays: Birthday[];
  view: "appointments" | "birthdays";
  onStatusChange: (id: string, status: 'going' | 'not-going' | 'scheduled') => void;
  onApproveBirthday?: (id: string) => void;
  onDeclineBirthday?: (id: string) => void;
  searchQuery?: string;
  selectedFilter?: string;
}

export default function ListView({ 
  role = "mla", 
  appointments, 
  birthdays, 
  view, 
  onStatusChange,
  onApproveBirthday,
  onDeclineBirthday,
  searchQuery = "",
  selectedFilter = "all"
}: ListViewProps) {
  const pager = useDatePager(new Date());

  // Filter appointments based on search and filter (show all, not just selected date)
  const filteredAppointments = appointments.filter(apt => {
    const matchesFilter = selectedFilter === 'all' || 
      apt.appointment.status === selectedFilter;
    
    const matchesSearch = apt.appointment.programName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.appointment.contactNo?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  // Group appointments by day ISO
  const appointmentsGroupsMap = filteredAppointments.reduce<Record<string, CalendarEvent[]>>((acc, apt) => {
    const iso = formatISO(startOfDay(new Date(apt.appointment.startTime)), { representation: "date" });
    (acc[iso] ||= []).push(apt);
    return acc;
  }, {});
  
  const appointmentsGroups = Object.keys(appointmentsGroupsMap)
    .sort()
    .map(k => ({ dateISO: k, items: appointmentsGroupsMap[k] }));

  // Group birthdays by day ISO (for current month)
  const currentMonth = pager.active.getMonth() + 1;
  const filteredBirthdays = birthdays.filter(bday => bday.month === currentMonth);
  
  const birthdaysGroupsMap = filteredBirthdays.reduce<Record<string, Birthday[]>>((acc, bday) => {
    const iso = formatISO(new Date(2024, bday.month - 1, bday.day), { representation: "date" });
    (acc[iso] ||= []).push(bday);
    return acc;
  }, {});
  
  const birthdaysGroups = Object.keys(birthdaysGroupsMap)
    .sort()
    .map(k => ({ dateISO: k, items: birthdaysGroupsMap[k] }));

  const groups = view === 'appointments' ? appointmentsGroups : birthdaysGroups;

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-wrap items-center justify-center gap-3 pb-6 flex-shrink-0">
        <DateStrip
          active={pager.active}
          direction={pager.direction}
          onPrev={pager.goPrev}
          onNext={pager.goNext}
          onPick={pager.pick}
        />
      </div>

      <div className="flex-1 overflow-hidden">
        <DayList
          groups={groups}
          activeISO={pager.activeISO}
          renderItem={(item) =>
            view === "appointments"
              ? <AppointmentCard 
                  key={item.appointment?.id || `appointment-${Math.random()}`} 
                  item={item} 
                  role={role} 
                  onStatusChange={onStatusChange}
                />
              : <BirthdayCard 
                  key={item.id || `birthday-${Math.random()}`} 
                  item={item} 
                  role={role} 
                  onApprove={onApproveBirthday}
                  onDecline={onDeclineBirthday}
                />
          }
        />
      </div>
    </div>
  );
} 