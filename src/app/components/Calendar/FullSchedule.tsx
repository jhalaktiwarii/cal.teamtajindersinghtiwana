'use client'

import { useState, useEffect, useRef, useLayoutEffect } from 'react'
import { Calendar, Clock, Edit, Trash2, X, Check, Share2, Download, Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { CalendarEvent } from '@/app/types'
import { appointmentService } from '@/app/services/appointmentService'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ShareDialog } from '@/app/components/ShareDialog'
import { format } from 'date-fns'
import { RainbowButton } from '@/components/ui/rainbow-button'
import { lower } from '@/utils/strings'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { generateAppointmentsDocx } from '@/lib/utils/pdfGenerator';
import { toMarathiDigits, toMarathiTime, getMarathiDay } from '@/app/utils/dateUtils';
import { DeleteModal } from '@/components/modals/DeleteModal';

interface FullPageScheduleProps {
  date: Date
  onClose: () => void
  events: CalendarEvent[]
  onAddSchedule: (startTime?: string, date?: Date, event?: CalendarEvent) => void
}

export function FullPageSchedule({ date, onClose, events: initialEvents, onAddSchedule }: FullPageScheduleProps) {
  const router = useRouter()
  const [loadingDelete, setLoadingDelete] = useState<string[]>([]) // Track delete loading states
  const [loadingStatus, setLoadingStatus] = useState<string[]>([]) // Track status update loading states
  const [loadingUrgency, setLoadingUrgency] = useState<string[]>([]) // Track urgency update loading states
  const [events, setEvents] = useState(initialEvents);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([])
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [showPdfContent, setShowPdfContent] = useState(false);
  const [pendingPdf, setPendingPdf] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);
  
  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteModalLoading, setDeleteModalLoading] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [deleteModalTitle, setDeleteModalTitle] = useState('');
  const [deleteModalDescription, setDeleteModalDescription] = useState('');

  // Update events when initialEvents changes
  useEffect(() => {
    setEvents(initialEvents);
  }, [initialEvents]);

  useLayoutEffect(() => {
    if (showPdfContent && pendingPdf && pdfRef.current && typeof window !== 'undefined') {
      (async () => {
        const html2pdf = (await import('html2pdf.js')).default;
        html2pdf()
          .set({
            margin: 0.1,
            filename: `schedule-${format(date, 'yyyy-MM-dd')}.pdf`,
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
          })
          .from(pdfRef.current)
          .save()
          .then(() => {
            setShowPdfContent(false);
            setPendingPdf(false);
            toast.success('Schedule PDF downloaded successfully');
          })
          .catch((error: unknown) => {
            setShowPdfContent(false);
            setPendingPdf(false);
            console.error('Error generating PDF:', error);
            toast.error('Failed to generate PDF');
          });
      })();
    }
  }, [showPdfContent, pendingPdf, date]);

  // Format the date properly
  const formatDate = (date: Date) => {
    try {
      const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      // Use Marathi locale and convert digits
      const marathiDate = d.toLocaleDateString('mr-IN', {
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
      });
      return toMarathiDigits(marathiDate);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };
  
  // Check if the selected date is in the past
  const isDateInPast = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate < today;
  };


  const handleEdit = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the details modal
    if (!event?.appointment?.startTime) {
      console.error('Invalid event data for editing');
      toast.error('Could not edit appointment: Invalid data');
      return;
    }

    try {
      const startTime = new Date(event.appointment.startTime).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      onAddSchedule(startTime, new Date(event.appointment.startTime), event);
    } catch (error) {
      console.error('Error processing event data:', error);
      toast.error('Could not edit appointment: Invalid date');
    }
  };

  const handleStatusUpdate = async (eventId: string, newStatus: 'going' | 'not-going' | 'scheduled') => {
    if (loadingStatus.includes(eventId)) return; // Prevent multiple clicks
    
    try {
      setLoadingStatus(prev => [...prev, eventId])
      const result = await appointmentService.updateStatus(eventId, newStatus)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to update status')
      }

      // Update local state immediately
      setEvents(currentEvents => 
        currentEvents.map(event => 
          event.appointment.id === eventId 
            ? { ...event, appointment: { ...event.appointment, status: newStatus } }
            : event
        )
      )
      
              toast.success(`Appointment ${lower(newStatus)} successfully`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update status')
    } finally {
      setLoadingStatus(prev => prev.filter(id => id !== eventId))
    }
  }

  const handleUrgencyUpdate = async (eventId: string, isUrgent: boolean) => {
    if (loadingUrgency.includes(eventId)) return; // Prevent multiple clicks
    
    try {
      setLoadingUrgency(prev => [...prev, eventId])
      const result = await appointmentService.updateUrgency(eventId, isUrgent)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to update urgency')
      }

      // Update local state immediately
      setEvents(currentEvents => 
        currentEvents.map(event => 
          event.appointment.id === eventId 
            ? { ...event, appointment: { ...event.appointment, isUrgent } }
            : event
        )
      )
      
      toast.success(`Appointment urgency updated successfully`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update urgency')
    } finally {
      setLoadingUrgency(prev => prev.filter(id => id !== eventId))
    }
  }

  const handleDelete = async (eventId: string) => {
    if (loadingDelete.includes(eventId)) return; // Prevent multiple clicks
    
    try {
      setLoadingDelete(prev => [...prev, eventId])
      const result = await appointmentService.deleteAppointment(eventId)
      
      if (result.success) {
        // Update local state immediately
        setEvents(currentEvents => currentEvents.filter(event => event.appointment.id !== eventId))
        toast.success('Appointment deleted successfully')
      } else {
        throw new Error(result.error || 'Failed to delete appointment')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete appointment')
    } finally {
      setLoadingDelete(prev => prev.filter(id => id !== eventId))
    }
  }

  const openDeleteModal = (eventId: string, title: string, description: string) => {
    setItemToDelete(eventId);
    setDeleteModalTitle(title);
    setDeleteModalDescription(description);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    
    setDeleteModalLoading(true);
    try {
      if (itemToDelete === 'bulk') {
        const result = await appointmentService.deleteMultipleAppointments(selectedEvents);
        
        if (result.success) {
          setEvents(events.filter(event => !selectedEvents.includes(event.appointment.id)));
          setSelectedEvents([]);
          toast.success('Selected appointments deleted successfully');
          setDeleteModalOpen(false);
          router.refresh();
        } else {
          throw new Error(result.error || 'Failed to delete appointments');
        }
      } else {
        const result = await appointmentService.deleteAppointment(itemToDelete);
        
        if (result.success) {
          setEvents(currentEvents => currentEvents.filter(event => event.appointment.id !== itemToDelete));
          toast.success('Appointment deleted successfully');
          setDeleteModalOpen(false);
        } else {
          throw new Error(result.error || 'Failed to delete appointment');
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete appointment');
    } finally {
      setDeleteModalLoading(false);
    }
  };

  const handleSelectEvent = (eventId: string) => {
    setSelectedEvents(prev => 
      prev.includes(eventId) 
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    )
  }

  const handleDeleteSelected = async () => {
    try {
      setLoadingDelete(prev => [...prev, ...selectedEvents])
      const result = await appointmentService.deleteMultipleAppointments(selectedEvents)
      
      if (result.success) {
        setEvents(events.filter(event => !selectedEvents.includes(event.appointment.id)))
        setSelectedEvents([])
        toast.success('Selected appointments deleted successfully')
        router.refresh() // Refresh the page to update the calendar view
      } else {
        throw new Error(result.error || 'Failed to delete appointments')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete appointments')
    } finally {
      setLoadingDelete(prev => prev.filter(id => !selectedEvents.includes(id)))
    }
  }

  const openBulkDeleteModal = () => {
    setDeleteModalTitle("Delete Selected Appointments?");
    setDeleteModalDescription(`Are you sure you want to delete ${selectedEvents.length} selected appointment(s)? This action cannot be undone.`);
    setItemToDelete('bulk');
    setDeleteModalOpen(true);
  };

  const handleBulkDeleteConfirm = async () => {
    setDeleteModalLoading(true);
    try {
      const result = await appointmentService.deleteMultipleAppointments(selectedEvents);
      
      if (result.success) {
        setEvents(events.filter(event => !selectedEvents.includes(event.appointment.id)));
        setSelectedEvents([]);
        toast.success('Selected appointments deleted successfully');
        setDeleteModalOpen(false);
        router.refresh();
      } else {
        throw new Error(result.error || 'Failed to delete appointments');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete appointments');
    } finally {
      setDeleteModalLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    setShowPdfContent(true);
    setPendingPdf(true);
  };

  const handleDownloadDocx = async () => {
    try {
      await generateAppointmentsDocx(events, {
        personName: 'माननीय आमदार ताजिंदर सिंह तिवाना जी',
      });
      toast.success('Marathi Schedule DOCX downloaded successfully');
    } catch (error) {
      console.error('Error generating DOCX:', error);
      toast.error('Failed to generate DOCX');
    }
  };

  const sortedEvents = [...events].sort((a, b) => new Date(a.appointment.startTime).getTime() - new Date(b.appointment.startTime).getTime());



  return (
    <div className="fixed inset-0 bg-background z-[60] overflow-hidden flex flex-col w-full max-w-full">
      {/* Hidden PDF content for html2pdf.js */}
      {showPdfContent && (
        <div
          ref={pdfRef}
          style={{
            position: 'relative',
            margin: '0 auto',
            width: '210mm',
            height: '297mm',
            background: '#fff',
            color: '#000',
            zIndex: 1000,
            padding: '20mm',
            fontFamily: 'Arial, sans-serif',
            boxSizing: 'border-box',
            fontSize: '18px',
          }}
        >
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '18px',
              overflow: 'hidden',
              margin: '0 auto',
              tableLayout: 'auto',
              border: '1px solid #333',
            }}
            border={1}
          >
            <tbody>
               <tr>
                <td colSpan={4} style={{ padding: '8px', fontWeight: 700, textAlign: 'center', wordBreak: 'break-word', border: '1px solid #333', fontSize: '18px', background: '#fff' }}>
                  माननीय आमदार ताजिंदर सिंह तिवाना जी यांचे कार्यक्रम
                </td>
              </tr>
               <tr>
                <td colSpan={4} style={{ padding: '6px', fontWeight: 700, textAlign: 'center', wordBreak: 'break-word', border: '1px solid #333', fontSize: '18px', background: '#fff' }}>
                  {toMarathiDigits(date.getDate())}/{toMarathiDigits(date.getMonth() + 1)}/{toMarathiDigits(date.getFullYear())} ({getMarathiDay(date)})
                </td>
              </tr>
               <tr style={{ background: '#f2f2f2' }}>
                <th style={{ padding: '6px', fontWeight: 700, textAlign: 'center', wordBreak: 'break-word', border: '1px solid #333', fontSize: '18px' }}>अ.क्र</th>
                <th style={{ padding: '6px', fontWeight: 700, textAlign: 'center', wordBreak: 'break-word', border: '1px solid #333', fontSize: '18px' }}>वेळ</th>
                <th style={{ padding: '6px', fontWeight: 700, textAlign: 'center', wordBreak: 'break-word', border: '1px solid #333', fontSize: '18px' }}>कार्यक्रम</th>
                <th style={{ padding: '6px', fontWeight: 700, textAlign: 'center', wordBreak: 'break-word', border: '1px solid #333', fontSize: '18px' }}>स्थान / संपर्क व्यक्ती</th>
              </tr>
              {/* Special row for public relations office time slot */}
              <tr style={{ background: '#f2f2f2' }}>
                <td colSpan={4} style={{ padding: '6px', fontWeight: 700, textAlign: 'center', wordBreak: 'break-word', border: '1px solid #333', fontSize: '18px' }}>
                  सकाळी ९.०० ते ११.०० वाजता (जनसंपर्क कार्यालय)
                </td>
              </tr>
              {/* Sort events by start time for PDF export */}
              {sortedEvents.map((event, index) => (
                <tr key={event.appointment.id}>
                  <td style={{ padding: '4px', textAlign: 'center', wordBreak: 'break-word', border: '1px solid #333', fontSize: '18px' }}>{toMarathiDigits(index + 1)}</td>
                  <td style={{ padding: '4px', textAlign: 'center', wordBreak: 'break-word', border: '1px solid #333', fontSize: '18px' }}>{toMarathiTime(event.appointment.startTime)}</td>
                  <td style={{ padding: '4px', textAlign: 'left', wordBreak: 'break-word', border: '1px solid #333', fontSize: '18px' }}>{event.appointment.programName}</td>
                  <td style={{ padding: '4px', textAlign: 'left', wordBreak: 'break-word', border: '1px solid #333', fontSize: '18px' }}>
                    {event.appointment.address}<br/>
                    {event.appointment.eventFrom}<br/>
                    {event.appointment.contactNo || ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-2 sm:p-4 border-b gap-2 w-full">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Calendar className="h-5 w-5 text-gray-500" />
          <h2 className="text-lg sm:text-xl font-semibold truncate">{formatDate(date)}</h2>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
          <RainbowButton
            onClick={() => {
              const now = new Date();
              const minutes = now.getMinutes();
              // Round to nearest 5 minutes
              const roundedMinutes = Math.ceil(minutes / 5) * 5;
              const scheduleTime = `${now.getHours().toString().padStart(2, '0')}:${roundedMinutes.toString().padStart(2, '0')}`;
              onAddSchedule(scheduleTime, date);
            }}
            className="h-10 sm:h-8 px-4 text-sm font-medium flex-1 sm:flex-none"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Schedule
          </RainbowButton>
          <div className="flex gap-2 w-full sm:w-auto justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 sm:h-8 sm:w-8"
                >
                  <Download className="h-4 w-4" />
                  <span className="sr-only">Download</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleDownloadPDF}>
                  Download as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownloadDocx}>
                  Download as DOCX
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsShareDialogOpen(true)}
              className="h-10 w-10 sm:h-8 sm:w-8"
            >
              <Share2 className="h-4 w-4" />
              <span className="sr-only">Share</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={onClose}
              className="h-10 w-10 sm:h-8 sm:w-8"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-grow w-full max-w-full">
        <div className="p-2 sm:p-4 space-y-4 w-full max-w-full">
          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No schedules for this day</h3>
              <p className="text-sm text-muted-foreground mb-4">Add a new schedule to get started</p>
              {!isDateInPast() && (
                <Button 
                  onClick={() => {
                    const now = new Date();
                    const minutes = now.getMinutes();
                    // Round to nearest 5 minutes
                    const roundedMinutes = Math.ceil(minutes / 5) * 5;
                    const scheduleTime = `${now.getHours().toString().padStart(2, '0')}:${roundedMinutes.toString().padStart(2, '0')}`;
                    onAddSchedule(scheduleTime, date);
                  }}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Add Schedule
                </Button>
              )}
            </div>
          ) : (
            events.map((event) => (
              <div key={event.appointment.id} className="rounded-lg border bg-card shadow-sm">
                <div className="p-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-3">
                        <div className="hidden sm:block pt-1">
                          <Checkbox
                            checked={selectedEvents.includes(event.appointment.id)}
                            onCheckedChange={() => handleSelectEvent(event.appointment.id)}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start gap-2 flex-wrap">
                            <h3 className="text-base font-semibold">{event.appointment.programName}</h3>
                            {event.appointment.isUrgent && (
                              <Badge variant="destructive" className="uppercase text-xs">Urgent</Badge>
                            )}
                            <Badge 
                              variant="secondary" 
                                              className={lower(event.appointment.status) === 'scheduled' ? 'bg-green-500/15 text-green-700'
                  : lower(event.appointment.status) === 'going' ? 'bg-blue-500/15 text-blue-700'
                                : 'bg-red-500/15 text-red-700'}
                            >
                              {event.appointment.status}
                            </Badge>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">{event.appointment.address}</p>
                          <div className="flex flex-col gap-2 mt-3">
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <span>
                                {new Date(event.appointment.startTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}
                              </span>
                            </div>
                            <div className="text-sm">
                              <div className="font-medium text-muted-foreground">Event From</div>
                              <div>{event.appointment.eventFrom}</div>
                            </div>
                            {event.appointment.contactNo && (
                              <div className="text-sm">
                                <div className="font-medium text-muted-foreground">Contact</div>
                                <div>{event.appointment.contactNo}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Mobile: Edit, Delete, and Urgent buttons */}
                      <div className="flex sm:hidden items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleEdit(event, e)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            openDeleteModal(
                              event.appointment.id,
                              "Delete Appointment?",
                              `Are you sure you want to delete "${event.appointment.programName}"? This action cannot be undone.`
                            );
                          }}
                          className="h-8 w-8 p-0 text-destructive"
                          disabled={loadingStatus.includes(event.appointment.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={event.appointment.isUrgent ? "ghost" : "ghost"}
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUrgencyUpdate(event.appointment.id, !event.appointment.isUrgent);
                          }}
                          className={`h-8 w-8 p-0 ${event.appointment.isUrgent ? 'text-destructive' : ''}`}
                          disabled={loadingUrgency?.includes(event.appointment.id)}
                        >
                          {loadingUrgency?.includes(event.appointment.id) ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                          ) : (
                            <span className="h-4 w-4">⚡</span>
                          )}
                        </Button>
                      </div>

                      {/* Desktop: Edit, Delete, and Urgent buttons */}
                      <div className="hidden sm:flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => handleEdit(event, e)}
                          className="flex items-center gap-1"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            openDeleteModal(
                              event.appointment.id,
                              "Delete Appointment?",
                              `Are you sure you want to delete "${event.appointment.programName}"? This action cannot be undone.`
                            );
                          }}
                          className="flex items-center gap-1 text-destructive"
                          disabled={loadingStatus.includes(event.appointment.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                        <Button
                          variant={event.appointment.isUrgent ? "destructive" : "outline"}
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUrgencyUpdate(event.appointment.id, !event.appointment.isUrgent);
                          }}
                          className="flex items-center gap-1"
                          disabled={loadingUrgency?.includes(event.appointment.id)}
                        >
                          {loadingUrgency?.includes(event.appointment.id) ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                          ) : (
                            <span className="h-4 w-4">⚡</span>
                          )}
                          {event.appointment.isUrgent ? 'Remove Urgent' : 'Mark Urgent'}
                        </Button>
                      </div>
                    </div>

                    <Separator className="my-2" />

                    {/* Status action buttons at the bottom */}
                    <div className="flex flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        {event.appointment.status === 'not-going' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusUpdate(event.appointment.id, 'going');
                            }}
                            className="flex items-center gap-1"
                            disabled={loadingStatus.includes(event.appointment.id)}
                          >
                            {loadingStatus.includes(event.appointment.id) ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                            ) : (
                              <>
                                <Check className="h-4 w-4" />
                                Mark as Going
                              </>
                            )}
                          </Button>
                        ) : event.appointment.status === 'going' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusUpdate(event.appointment.id, 'not-going');
                            }}
                            className="flex items-center gap-1"
                            disabled={loadingStatus.includes(event.appointment.id)}
                          >
                            {loadingStatus.includes(event.appointment.id) ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                            ) : (
                              <>
                                <X className="h-4 w-4" />
                                Mark as Not Going
                              </>
                            )}
                          </Button>
                        ) : (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusUpdate(event.appointment.id, 'going');
                              }}
                              className="flex items-center gap-1"
                              disabled={loadingStatus.includes(event.appointment.id)}
                            >
                              {loadingStatus.includes(event.appointment.id) ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                              ) : (
                                <>
                                  <Check className="h-4 w-4" />
                                  Mark as Going
                                </>
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusUpdate(event.appointment.id, 'not-going');
                              }}
                              className="flex items-center gap-1"
                              disabled={loadingStatus.includes(event.appointment.id)}
                            >
                              {loadingStatus.includes(event.appointment.id) ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                              ) : (
                                <>
                                  <X className="h-4 w-4" />
                                  Mark as Not Going
                                </>
                              )}
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
      
      {selectedEvents.length > 0 && (
        <div className="border-t p-2 sm:p-4 bg-background w-full">
          <Button
            variant="destructive"
            onClick={openBulkDeleteModal}
            className="w-full sm:w-auto"
          >
            Delete Selected ({selectedEvents.length})
          </Button>
        </div>
      )}

      <ShareDialog
        events={events}
        isOpen={isShareDialogOpen}
        onOpenChange={setIsShareDialogOpen}
      />

      <DeleteModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={deleteModalTitle}
        description={deleteModalDescription}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        loading={deleteModalLoading}
      />
    </div>
  )
}
