"use client"

import React from 'react';
import Image from 'next/image';
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
  icon: string
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
    let text = "📅 *Appointments*\n\n";

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
      icon: "https://cdn.simpleicons.org/whatsapp/25D366",
      color: "#25D366",
      getShareUrl: (events) => {
        const text = formatAppointmentsText(events)
        return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`
      },
    },
    {
      name: "Telegram",
      icon: "https://cdn.simpleicons.org/telegram/26A5E4",
      color: "#26A5E4",
      getShareUrl: (events) => {
        const text = formatAppointmentsText(events)
        return `https://t.me/share/url?text=${encodeURIComponent(text)}`
      },
    },
    {
      name: "Email",
      icon: "https://cdn.simpleicons.org/gmail/EA4335",
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
                className="p-2 rounded-full" 
                style={{ backgroundColor: `${option.color}15` }}
              >
                <Image
                  src={option.icon}
                  alt={option.name}
                  width={24}
                  height={24}
                  style={{ filter: "grayscale(0%)" }}
                />
              </div>
              <span className="text-sm font-medium">{option.name}</span>
            </button>
          ))}
        </div>
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <Button onClick={handleNativeShare} className="w-full mt-2">
            Use device sharing
          </Button>
        )}
      </DialogContent>
    </Dialog>
  )
}
