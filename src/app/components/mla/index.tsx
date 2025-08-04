"use client"

import React, { useState, } from 'react';
import { useAppointments } from '@/app/hooks/useAppointments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, addDays, startOfToday, parseISO } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Search, LogOut, CheckCircle2, XCircle, AlertTriangle, X, Download, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { signOut } from "next-auth/react";
import { jsPDF } from 'jspdf';
import { ShareDialog } from '../ShareDialog';
import { CalendarEvent } from '@/app/types';
import { toMarathiTime } from '@/app/utils/dateUtils';

export default function MLAView() {
  const { appointments, loading, updateAppointment } = useAppointments();
  const [selectedDate, setSelectedDate] = useState(startOfToday());
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [startIndex, setStartIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  
  const dates = Array.from({ length: 3 }, (_, i) => addDays(startOfToday(), startIndex + i));

  const handleStatusChange = async (id: string, newStatus: 'going' | 'not-going' | 'scheduled') => {
    try {
      await updateAppointment(id, { status: newStatus });
    } catch (error) {
      console.error('Error updating appointment status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'going':
        return 'bg-emerald-100 text-emerald-800';
      case 'not-going':
        return 'bg-red-100 text-red-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getAppointmentBackground = (status: string, isUrgent: boolean) => {
    switch (status) {
      case 'not-going':
        return isUrgent ? 'bg-red-200 hover:bg-red-100' : 'bg-red-50 hover:bg-red-25';
      case 'going':
        return isUrgent ? 'bg-emerald-200 hover:bg-emerald-100' : 'bg-emerald-50 hover:bg-emerald-25';
      case 'scheduled':
        return isUrgent ? 'bg-blue-200 hover:bg-blue-100' : 'bg-blue-50 hover:bg-blue-25';
      default:
        if (isUrgent) {
          return 'bg-amber-200 hover:bg-amber-100 border-l-4 border-red-500';
        }
        return 'bg-yellow-50 hover:bg-yellow-25';
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchesFilter = selectedFilter === 'all' || 
      apt.appointment.status === selectedFilter;
    
    const matchesSearch = apt.appointment.programName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.appointment.contactNo.includes(searchQuery);
    
    const appointmentDate = new Date(apt.appointment.startTime);
    const matchesDate = appointmentDate.toDateString() === selectedDate.toDateString();
    
    return matchesFilter && matchesSearch && matchesDate;
  });

  const handleNext = () => setStartIndex(prev => prev + 1);
  const handlePrev = () => setStartIndex(prev => Math.max(0, prev - 1));



  interface PDFOptions {
    title: string;
    subtitle: string;
  }

  const generateAppointmentsPDF = (appointments: CalendarEvent[], options: PDFOptions) => {
    const doc = new jsPDF();
    doc.setFontSize(24);
    doc.text(options.title, 10, 20);
    doc.setFontSize(18);
    doc.text(options.subtitle, 10, 30);
    appointments.forEach((appointment: CalendarEvent, index: number) => {
      doc.text(`Appointment ${index + 1}`, 10, 40 + index * 20);
      doc.text(`Program Name: ${appointment.appointment.programName}`, 10, 50 + index * 20);
      doc.text(`Date: ${format(parseISO(appointment.appointment.startTime), "PPP")}`, 10, 60 + index * 20);
      doc.text(`Time: ${toMarathiTime(appointment.appointment.startTime)}`, 10, 70 + index * 20);
      doc.text(`Contact: ${appointment.appointment.contactNo}`, 10, 80 + index * 20);
      doc.text(`Status: ${appointment.appointment.status}`, 10, 90 + index * 20);
    });
    return doc;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-gray-900">
       <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <span className="md:inline text-blue-600 dark:text-blue-400 font-semibold">My Calender App</span>
            <div className="relative flex-1 hidden sm:block">
              <Search className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
              <Input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 sm:pl-10 text-sm sm:text-base h-8 sm:h-10" 
                placeholder="Search appointments..."
              />
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8 sm:h-10 sm:w-10"
              onClick={() => signOut()}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

       <div className="relative px-4 sm:hidden mb-4 mt-4">
        <Input
          className="w-full rounded-xl bg-slate-100 pl-6 focus-visible:ring-slate-200"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search appointments..."
          style={{ boxShadow: "rgba(0, 0, 0, 0.15) 2.4px 2.4px 3.2px" }}
        />
        {searchQuery === "" ? (
          <Search
            className="absolute right-7 top-3 h-4 w-4 text-slate-600"
            size={25}
          />
        ) : (
          <X
            className="absolute right-7 top-3 h-4 w-4 cursor-pointer text-slate-600"
            size={25}
            onClick={() => setSearchQuery("")}
          />
        )}
      </div>

       <main className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
         <div className="mb-4 sm:mb-6">
          <div className="flex items-center justify-center gap-2 sm:gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 sm:h-10 sm:w-10"
                onClick={handlePrev}
                disabled={startIndex === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="flex gap-1 sm:gap-2">
                {dates.map((date) => (
                  <button
                    key={date.toISOString()}
                    onClick={() => setSelectedDate(date)}
                    className={cn(
                      "flex flex-col items-center min-w-[60px] sm:min-w-[80px] py-1 sm:py-2 px-2 sm:px-3 rounded-xl",
                      selectedDate.toDateString() === date.toDateString()
                        ? "bg-blue-600 text-white"
                        : "hover:bg-gray-100"
                    )}
                  >
                    <span className="text-xs font-medium">
                      {format(date, 'EEE')}
                    </span>
                    <span className="text-base sm:text-lg font-bold">
                      {format(date, 'd')}
                    </span>
                  </button>
                ))}
              </div>

              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 sm:h-10 sm:w-10"
                onClick={handleNext}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-8 sm:h-10 px-2 sm:px-4">
                  <CalendarIcon className="h-4 w-4" />
                  <span className="hidden sm:inline ml-2">Pick Date</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-1 sm:gap-2 mb-4 sm:mb-6">
          {['all', 'going', 'not-going', 'scheduled'].map((filter) => (
            <Button
              key={filter}
              variant={selectedFilter === filter ? "default" : "outline"}
              onClick={() => setSelectedFilter(filter)}
              className="text-xs sm:text-sm px-2 sm:px-4 h-8 sm:h-10"
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1).replace('-', ' ')}
            </Button>
          ))}
        </div>

        {/* Appointments */}
        <div className="space-y-1">
          {filteredAppointments.map((event, index) => {
            const key = event.appointment?.id || `appointment-${index}`;
            return (
              <Dialog key={key}>
                <DialogTrigger asChild>
                  <div
                    className={cn(
                      "flex items-center justify-between p-2 rounded-lg transition-colors",
                      getAppointmentBackground(event.appointment?.status || 'scheduled', event.appointment?.isUrgent || false),
                      "cursor-pointer"
                    )}
                  >
                    <div className="flex-1 min-w-0 mr-2">
                      <div className="flex items-center space-x-2">
                        <p className={cn(
                          "text-sm font-medium truncate",
                          event.appointment?.isUrgent ? "text-red-700" : "text-gray-900"
                        )}>
                          {event.appointment?.programName}
                        </p>
                        {event.appointment?.isUrgent && (
                          <AlertTriangle className="h-3 w-3 text-red-500" />
                        )}
                      </div>
                      <div className="flex items-center text-xs text-gray-500 mt-0.5">
                        <span className="whitespace-nowrap">
                          {event.appointment?.startTime ? 
                            format(parseISO(event.appointment.startTime), "h:mm a") : 
                            'Time not set'}
                        </span>
                        <span className="mx-2">•</span>
                        <span className="truncate">{event.appointment?.address}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {event.appointment?.status === 'going' && (
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => {
                              if (event.appointment?.id) {
                                handleStatusChange(event.appointment.id, 'not-going');
                              }
                            }}
                            className="h-6 w-6 p-0"
                            title="Mark as Not Going"
                          >
                            <XCircle className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      )}
                      {event.appointment?.status === 'not-going' && (
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => {
                              if (event.appointment?.id) {
                                handleStatusChange(event.appointment.id, 'going');
                              }
                            }}
                            className="h-6 w-6 p-0"
                            title="Mark as Going"
                          >
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          </Button>
                        </div>
                      )}
                      {event.appointment?.status !== 'going' && event.appointment?.status !== 'not-going' && (
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => {
                              if (event.appointment?.id) {
                                handleStatusChange(event.appointment.id, 'going');
                              }
                            }}
                            className="h-6 w-6 p-0"
                            title="Mark as Going"
                          >
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => {
                              if (event.appointment?.id) {
                                handleStatusChange(event.appointment.id, 'not-going');
                              }
                            }}
                            className="h-6 w-6 p-0"
                            title="Mark as Not Going"
                          >
                            <XCircle className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      )}
                      <span className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap",
                        getStatusColor(event.appointment?.status ?? 'scheduled')
                      )}>
                        {(event.appointment?.status ?? 'Scheduled').charAt(0).toUpperCase() + 
                         (event.appointment?.status ?? 'scheduled').slice(1)}
                      </span>
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Appointment Address</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium leading-none">Schedule</h4>
                        <div className="text-sm text-muted-foreground">
                          <div>Date: {event.appointment?.startTime ? format(parseISO(event.appointment.startTime), "PPP") : 'Date not set'}</div>
                          <div>Time: {event.appointment?.startTime ? `${format(parseISO(event.appointment.startTime), "h:mm a")}` : 'Time not set'}</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium leading-none">Address</h4>
                        <div className="text-sm text-muted-foreground">
                          {event.appointment?.address || 'No address provided'}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium leading-none">Contact</h4>
                        <div className="text-sm text-muted-foreground">
                          {event.appointment?.contactNo || 'No contact provided'}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium leading-none">Status</h4>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (event.appointment?.id) {
                                handleStatusChange(event.appointment.id, 'going');
                              }
                            }}
                            className={cn(
                              "rounded-full",
                              event.appointment?.status === 'going' && "bg-emerald-100 text-emerald-800"
                            )}
                          >
                            Going
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (event.appointment?.id) {
                                handleStatusChange(event.appointment.id, 'not-going');
                              }
                            }}
                            className={cn(
                              "rounded-full",
                              event.appointment?.status === 'not-going' && "bg-red-100 text-red-800"
                            )}
                          >
                            Not Going
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-medium">Urgent</h4>
                        <Switch
                          checked={event.appointment?.isUrgent}
                          disabled
                        />
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            );
          })}
          {filteredAppointments.length === 0 && (
            <div className="p-4 text-center text-sm text-gray-500">
              No appointments found
            </div>
          )}
        </div>
      </main>
      {/* Export and Share Buttons */}
      <div className="fixed bottom-4 right-4 flex gap-2">
        <Button
          variant="outline"
          className="bg-white"
          onClick={() => {
            const doc = generateAppointmentsPDF(filteredAppointments, {
              title: 'Appointments Schedule',
              subtitle: 'Current View',
            });
            doc.save(`appointments-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
          }}
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
        <Button
          variant="outline"
          className="bg-white"
          onClick={() => setIsShareDialogOpen(true)}
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </div>

      <ShareDialog
        isOpen={isShareDialogOpen}
        onOpenChange={setIsShareDialogOpen}
        events={filteredAppointments}
      />
    </div>
  );
}