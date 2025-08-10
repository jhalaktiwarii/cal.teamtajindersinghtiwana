"use client"

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { CalendarEvent } from '../../types';
import { AppointmentList } from './AppointmentList';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Download, Search, Share2, LogOut } from 'lucide-react';
import { format, isToday, isTomorrow, isAfter, isBefore, startOfDay, isEqual, addDays } from 'date-fns';
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { ShareDialog } from '../ShareDialog';
import { CollapsibleSection } from '@/components/ui/collapsible-section';
import { BirthdayList } from './BirthdayList';
import type { Birthday } from '@/app/types/birthday';

interface SidebarProps {
  appointments: CalendarEvent[];
  onStatusChange?: (id: string, status: 'going' | 'not-going' | 'scheduled') => void;
  onUrgencyChange?: (id: string, isUrgent: boolean) => void;
  isDarkMode: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  isSidebarOpen?: boolean;
  birthdays: Birthday[];
  onEditBirthday: (bday: Birthday) => void;
  onDeleteBirthday: (id: string) => void;

}

type AppointmentStatus = 'all' | 'going' | 'not-going' | 'scheduled';
type TimeFilter = 'all' | 'today' | 'tomorrow' | 'upcoming' | 'past';

const statusFilters = [
  { value: 'all', label: 'All Status' },
  { value: 'going', label: 'Going' },
  { value: 'not-going', label: 'Not Going' },
  { value: 'scheduled', label: 'Scheduled' },
];

const timeFilters = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'tomorrow', label: 'Tomorrow' },
  { value: 'upcoming', label: 'Upcoming' },
];

export function Sidebar({ 
  appointments, 
  onStatusChange, 
  onUrgencyChange, 
  setIsSidebarOpen,
  birthdays,
  onEditBirthday,
  onDeleteBirthday,

}: SidebarProps) {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<AppointmentStatus>('all');
  const [, setSelectedTimeFilter] = useState<TimeFilter>('all');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedExportFilters, setSelectedExportFilters] = useState<TimeFilter[]>([]);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [selectedEvents, setSelectedEvents] = useState<CalendarEvent[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  // Screen size detection
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkScreenSize();
    
    // Add resize listener
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Auto-open sidebar for MLA role on mobile
  useEffect(() => {
    if (session?.user?.role === 'mla' && isMobile) {
      setIsSidebarOpen(true);
    }
  }, [session?.user?.role, isMobile, setIsSidebarOpen]);

  const filterAppointments = useCallback((appointments: CalendarEvent[], status: AppointmentStatus, time: TimeFilter) => {
    return appointments.filter(event => {
      const appointmentDate = new Date(event.appointment.startTime);
      const now = new Date();
      const selectedDateStart = selectedDate ? startOfDay(selectedDate) : null;
      
      if (selectedDate && selectedDateStart && !isEqual(startOfDay(appointmentDate), selectedDateStart)) {
        return false;
      }
      
      // Status filter
      if (status !== 'all' && event.appointment.status !== status) {
        return false;
      }

      // Time filter
      switch (time) {
        case 'today': {
          const today = startOfDay(now);
          return isEqual(startOfDay(appointmentDate), today);
        }
        case 'tomorrow': {
          const tomorrow = startOfDay(addDays(now, 1));
          return isEqual(startOfDay(appointmentDate), tomorrow);
        }
        case 'upcoming':
          return isAfter(appointmentDate, now) && 
                 !isToday(appointmentDate) && 
                 !isTomorrow(appointmentDate);
        case 'past':
          return isBefore(appointmentDate, startOfDay(now));
        default:
          return true;
      }
    });
  }, [selectedDate]);

  const filteredAppointments = useMemo(() => {
    return appointments.filter(event => {
      const appointmentDate = new Date(event.appointment.startTime);
      
      // Search query filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = 
          event.appointment.programName.toLowerCase().includes(searchLower) ||
          event.appointment.address.toLowerCase().includes(searchLower) ||
          event.appointment.notes?.toLowerCase().includes(searchLower) ||
          event.appointment.eventFrom.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }

      // Selected date filter
      if (selectedDate) {
        return isEqual(startOfDay(appointmentDate), startOfDay(selectedDate));
      }

      // Status filter
      if (selectedStatus !== 'all' && event.appointment.status !== selectedStatus) {
        return false;
      }

      return true;
    });
  }, [appointments, searchQuery, selectedDate, selectedStatus]);

  // Group appointments by time sections
  const todayAppointments = filterAppointments(appointments, selectedStatus, 'today');
  const tomorrowAppointments = filterAppointments(appointments, selectedStatus, 'tomorrow');
  const upcomingAppointments = filterAppointments(appointments, selectedStatus, 'upcoming');

  const handleExport = async () => {
    try {
      // PDF export functionality is currently disabled.
      console.error('PDF generation functionality is currently disabled.');
      // toast.success('Schedule downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      // toast.error('Failed to generate PDF');
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold ml-12">My Calender App</h2>
          <div className="flex gap-2">
           
          </div>
        </div>

        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search appointments..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1">
                  {statusFilters.find(f => f.value === selectedStatus)?.label || 'Status'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {statusFilters.map((filter) => (
                  <DropdownMenuItem
                    key={filter.value}
                    onClick={() => setSelectedStatus(filter.value as AppointmentStatus)}
                  >
                    {filter.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  size="sm"
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1" 
              onClick={() => {
                setSelectedDate(undefined);
                setSelectedStatus('all');
                setSelectedTimeFilter('all');
                setSearchQuery('');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {(selectedDate || selectedStatus !== 'all' || searchQuery) ? (
          <CollapsibleSection
            title={
              selectedDate
                ? `Appointments for ${format(selectedDate, "PPP")}`
                : selectedStatus !== 'all'
                ? `${statusFilters.find(f => f.value === selectedStatus)?.label} Appointments`
                : "Search Results"
            }
            badge={filteredAppointments.length}
            defaultOpen={true}
          >
            <AppointmentList
              appointments={filteredAppointments}
              onStatusChange={onStatusChange}
              onUrgencyChange={onUrgencyChange}
            />
            {filteredAppointments.length === 0 && (
              <div className="text-center text-gray-500 py-4">
                No appointments found for the selected filters
              </div>
            )}
          </CollapsibleSection>
        ) : (
          <>
            <CollapsibleSection 
              title="Today's Appointments" 
              badge={todayAppointments.length}
              defaultOpen={todayAppointments.length > 0}
            >
              <AppointmentList
                appointments={todayAppointments}
                onStatusChange={onStatusChange}
                onUrgencyChange={onUrgencyChange}
              />
            </CollapsibleSection>

            <CollapsibleSection 
              title="Tomorrow's Appointments" 
              badge={tomorrowAppointments.length}
              defaultOpen={false}
            >
              <AppointmentList
                appointments={tomorrowAppointments}
                onStatusChange={onStatusChange}
                onUrgencyChange={onUrgencyChange}
              />
            </CollapsibleSection>

            <CollapsibleSection 
              title="Upcoming Appointments" 
              badge={upcomingAppointments.length}
              defaultOpen={false}
            >
              <AppointmentList
                appointments={upcomingAppointments}
                onStatusChange={onStatusChange}
                onUrgencyChange={onUrgencyChange}
              />
            </CollapsibleSection>
          </>
        )}

        <CollapsibleSection 
          title="Upcoming Birthdays" 
          badge={birthdays.length}
          defaultOpen={false}
        >
          <BirthdayList 
            birthdays={birthdays} 
            onEdit={b => onEditBirthday(b)}
            onDelete={onDeleteBirthday}
          />
        </CollapsibleSection>
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {timeFilters.map((filter) => (
                <DropdownMenuCheckboxItem
                  key={filter.value}
                  checked={selectedExportFilters.includes(filter.value as TimeFilter)}
                  onCheckedChange={(checked) => {
                    setSelectedExportFilters(prev => 
                      checked 
                        ? [...prev, filter.value as TimeFilter]
                        : prev.filter(f => f !== filter.value)
                    );
                  }}
                >
                  {filter.label}
                </DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleExport}>
                Export Selected
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => {
              const eventsToShare = selectedDate || selectedStatus !== 'all' || searchQuery
                ? filteredAppointments
                : [...todayAppointments, ...tomorrowAppointments, ...upcomingAppointments];
              setSelectedEvents(eventsToShare);
              setIsShareDialogOpen(true);
            }}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>

        <Button 
          variant="destructive" 
          size="sm" 
          className="w-full"
          onClick={() => signOut({ callbackUrl: '/' })}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign out
        </Button>
      </div>

      {selectedEvents.length > 0 && (
        <ShareDialog 
          events={selectedEvents} 
          isOpen={isShareDialogOpen}
          onOpenChange={setIsShareDialogOpen}
        />
      )}
    </div>
  );
}