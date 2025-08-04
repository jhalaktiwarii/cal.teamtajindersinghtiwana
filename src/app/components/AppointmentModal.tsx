"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TimePicker } from "@/components/ui/time-picker";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { type Appointment } from "@/lib/schema/appointments";

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTime?: string | null;
  onSave: (appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  selectedDate: Date;
  selectedTime?: string | null;
  isEditing?: boolean;
  appointment?: Appointment;
}

const formSchema = z.object({
  programName: z.string().min(2, { message: "Program name must be at least 2 characters." }),
  address: z.string().min(4, { message: "Address must be at least 4 characters." }),
  startTime: z.date({ required_error: "Please select a start time" }),
  eventFrom: z.string().min(2, { message: "Event organizer must be at least 2 characters." }),
  contactNo: z.string().min(10, { message: "Contact number must be at least 10 digits." }),
  isUrgent: z.boolean().default(false),
});

export function AppointmentModal({
  isOpen,
  onClose,
  initialTime,
  onSave,
  selectedDate,
  isEditing,
  appointment,
}: AppointmentModalProps) {
  const now = useMemo(() => new Date(), []);

  const minTime = useMemo(() => {
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const selectedDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    return selectedDay.getTime() === today.getTime() ? now : selectedDay;
  }, [selectedDate, now]);

  const initialTimes = useMemo(() => {
    let startTime: Date;
    const baseDate = selectedDate || now;

    if (appointment?.startTime) {
      startTime = new Date(appointment.startTime);
    } else if (initialTime) {
      const [hours, minutes] = initialTime.split(':').map(Number);
      startTime = new Date(baseDate);
      startTime.setHours(hours);
      startTime.setMinutes(minutes);

      if (startTime < minTime) {
        startTime = new Date(minTime);
      }
    } else {
      startTime = new Date(Math.max(baseDate.getTime(), minTime.getTime()));
    }

    return { startTime };
  }, [appointment, initialTime, selectedDate, minTime, now]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      programName: appointment?.programName || "",
      address: appointment?.address || "",
      eventFrom: appointment?.eventFrom || "",
      contactNo: appointment?.contactNo || "",
      isUrgent: appointment?.isUrgent || false,
      startTime: undefined,
    },
  });

  useEffect(() => {
    if (initialTimes?.startTime) {
      form.setValue('startTime', initialTimes.startTime);
    }
  }, [form, initialTimes]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      await onSave({
        programName: values.programName,
        address: values.address,
        startTime: values.startTime.toISOString(),
        eventFrom: values.eventFrom,
        contactNo: values.contactNo,
        status: appointment?.status || 'scheduled',
        isUrgent: values.isUrgent,
        userid: values.contactNo,
      });
      onClose();
      form.reset();
    } catch (error) {
      console.error("Error saving appointment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] md:max-w-[600px] h-[100dvh] sm:h-auto max-h-[90vh] overflow-y-auto p-4">
        <DialogHeader className="mb-3">
          <DialogTitle className="text-lg font-semibold text-center">
            {isEditing ? 'Edit Appointment' : 'Add Appointment'}
          </DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2.5">
              <FormField
                control={form.control}
                name="programName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Program Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter program name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter address" className="resize-none" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <TimePicker date={field.value} setDate={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="eventFrom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event From</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter event organizer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact No</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="Enter contact number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-black text-white hover:bg-black/90 h-9 mt-3 rounded-md font-medium transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? 'Saving...'
                  : isEditing
                    ? 'Update Appointment'
                    : 'Save Appointment'}
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
