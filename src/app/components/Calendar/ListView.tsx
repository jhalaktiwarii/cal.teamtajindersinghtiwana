import * as React from "react";
import { startOfDay, formatISO } from "date-fns";
import { useDatePager } from "../../hooks/useDatePager";
import { DateStrip } from "./DateStrip";
import { DayList } from "./DayList";
import { AppointmentCard } from "./AppointmentCard";
import { BirthdayCard } from "./BirthdayCard";
import { CalendarEvent } from "@/app/types";
import type { Birthday } from "@/app/types/birthday";
import { Button } from "@/components/ui/button";

interface ListViewProps {
  role?: "mla" | "staff";
  appointments: CalendarEvent[];
  birthdays: Birthday[];
  view: "appointments" | "birthdays";
  onStatusChange: (id: string, status: 'going' | 'not-going' | 'scheduled') => void;
  searchQuery?: string;
  selectedFilter?: string;
  onFilterChange?: (filter: string) => void;
}

export default function ListView({ 
  role = "mla", 
  appointments, 
  birthdays, 
  view, 
  onStatusChange,
  searchQuery = "",
  selectedFilter = "all",
  onFilterChange
}: ListViewProps) {
  const pager = useDatePager(new Date());

  // Filter appointments based on search, filter, AND selected date
  const filteredAppointments = appointments.filter(apt => {
    const appointmentDate = new Date(apt.appointment.startTime);
    const isSameDate = 
      appointmentDate.getFullYear() === pager.active.getFullYear() &&
      appointmentDate.getMonth() === pager.active.getMonth() &&
      appointmentDate.getDate() === pager.active.getDate();
    
    const matchesFilter = selectedFilter === 'all' || 
      apt.appointment.status === selectedFilter;
    
    const matchesSearch = apt.appointment.programName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.appointment.contactNo?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return isSameDate && matchesFilter && matchesSearch;
  });

  // Group appointments by day ISO (only for the selected date)
  const appointmentsGroupsMap = filteredAppointments.reduce<Record<string, CalendarEvent[]>>((acc, apt) => {
    const iso = formatISO(startOfDay(new Date(apt.appointment.startTime)), { representation: "date" });
    (acc[iso] ||= []).push(apt);
    return acc;
  }, {});
  
  const appointmentsGroups = Object.keys(appointmentsGroupsMap)
    .sort()
    .map(k => ({ dateISO: k, items: appointmentsGroupsMap[k] }));

  // Filter birthdays based on search only (show all birthdays)
  const filteredBirthdays = birthdays.filter(bday => {
    const matchesSearch = !searchQuery || 
      bday.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bday.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bday.ward?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Show all birthdays regardless of month for now
    return matchesSearch;
  });
  
  // Group birthdays by day ISO (for the current month)
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

      {/* Appointment Filters - positioned below date slider */}
      {view === 'appointments' && (
        <div className="flex flex-wrap gap-1 sm:gap-2 mb-4 sm:mb-6 justify-center flex-shrink-0">
          {['all', 'going', 'not-going', 'scheduled'].map((filter) => (
            <Button
              key={filter}
              variant={selectedFilter === filter ? "default" : "outline"}
              onClick={() => onFilterChange?.(filter)}
              className="text-xs sm:text-sm px-2 sm:px-4 h-8 sm:h-10"
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1).replace('-', ' ')}
            </Button>
          ))}
        </div>
      )}

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
                />
          }
        />
      </div>
    </div>
  );
} 