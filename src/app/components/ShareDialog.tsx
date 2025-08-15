"use client"

import React from 'react';
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CalendarEvent } from '../types'
import { format, parseISO } from 'date-fns'

interface ShareOption {
  name: string
  icon: React.ReactNode
  color: string
  getShareUrl: (events: CalendarEvent[]) => string
}

interface ShareDialogProps {
  events: CalendarEvent[]
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function ShareDialog({ events, isOpen, onOpenChange }: ShareDialogProps) {
  const formatAppointmentsText = (events: CalendarEvent[]) => {
    // Group appointments by date
    const groupedEvents = events.reduce((acc, event) => {
      const date = format(parseISO(event.appointment.startTime), 'PPP');
      if (!acc[date]) acc[date] = [];
      acc[date].push(event);
      return acc;
    }, {} as Record<string, CalendarEvent[]>);

    // Format text with sections
    let text = "*Appointments*\n\n";

    Object.entries(groupedEvents).forEach(([date, dateEvents]) => {
      text += `*${date}*\n`;
      dateEvents.forEach(event => {
        const { appointment } = event;
        const time = appointment.startTime ? format(parseISO(appointment.startTime), 'h:mm a') : 'Time not set';
        const status = appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1);
        
        text += `⏰ ${time}\n`;
        text += `📍 ${appointment.programName}\n`;
        if (appointment.address) text += `📝 ${appointment.address}\n`;
        if (appointment.eventFrom) text += `👤 From: ${appointment.eventFrom}\n`;
        if (appointment.contactNo) text += `📞 Contact: ${appointment.contactNo}\n`;
        text += `🔵 Status: ${status}\n`;
        if (appointment.isUrgent) text += `⚠️ Urgent\n`;
        if (appointment.notes) text += `📌 Notes: ${appointment.notes}\n`;
        text += '\n';
      });
    });

    return text;
  }

  const shareOptions: ShareOption[] = [
    {
      name: "WhatsApp",
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
        </svg>
      ),
      color: "#25D366",
      getShareUrl: (events) => {
        const text = formatAppointmentsText(events)
        return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`
      },
    },
    {
      name: "Telegram",
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
        </svg>
      ),
      color: "#26A5E4",
      getShareUrl: (events) => {
        const text = formatAppointmentsText(events)
        return `https://t.me/share/url?text=${encodeURIComponent(text)}`
      },
    },
    {
      name: "Gmail",
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-.904.732-1.636 1.636-1.636h20.728c.904 0 1.636.732 1.636 1.636zM12 13.5L1.636 4.364h20.728L12 13.5z"/>
        </svg>
      ),
      color: "#EA4335",
      getShareUrl: (events) => {
        const text = formatAppointmentsText(events)
        return `mailto:?subject=Appointment Address&body=${encodeURIComponent(text)}`
      },
    },
  ]

  const handleShare = (option: ShareOption) => {
    try {
      const shareUrl = option.getShareUrl(events)
      window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=600')
      onOpenChange(false)
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Appointment Address",
          text: formatAppointmentsText(events),
          url: window.location.href,
        })
        onOpenChange(false)
      } catch (error) {
        console.error('Error sharing:', error)
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share Appointments</DialogTitle>
          <DialogDescription>
            Choose how you&apos;d like to share your appointments
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-4 py-4">
          {shareOptions.map((option) => (
            <button
              key={option.name}
              onClick={() => handleShare(option)}
              className="flex flex-col items-center gap-2 rounded-lg p-3 hover:bg-muted transition-colors"
            >
              <div 
                className="p-2 rounded-full flex items-center justify-center" 
                style={{ backgroundColor: `${option.color}15` }}
              >
                <div style={{ color: option.color }}>
                  {option.icon}
                </div>
              </div>
              <span className="text-sm font-medium">{option.name}</span>
            </button>
          ))}
        </div>
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <Button onClick={handleNativeShare} className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700">
            Use device sharing
          </Button>
        )}
      </DialogContent>
    </Dialog>
  )
}
