"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { TimePicker } from "@/components/ui/time-picker"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

const formSchema = z.object({
  programName: z.string().min(2, {
    message: "Program name must be at least 2 characters.",
  }),
  address: z.string().min(10, {
    message: "Address must be at least 10 characters.",
  }),
  time: z.date({
    required_error: "Please select a time",
  }),
  eventFrom: z.string().min(2, {
    message: "Event organizer must be at least 2 characters.",
  }),
  contactNo: z.string().min(10, {
    message: "Contact number must be at least 10 digits.",
  }),
})

interface AppointmentFormProps {
  initialDate?: Date | null;
  onClose?: () => void;
}

export default function AppointmentForm({ initialDate, onClose }: AppointmentFormProps) {
  const [open, setOpen] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      programName: "",
      address: "",
      time: initialDate || new Date(),
      eventFrom: "",
      contactNo: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    setOpen(false);
    if (onClose) onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v && onClose) onClose(); }}>
      <DialogTrigger asChild>
        <Button variant="outline">Add Event</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] p-0 gap-0">
        <Card className="border-0 rounded-t-lg bg-gradient-to-r from-blue-500 to-blue-600">
          <DialogHeader className="p-6">
            <DialogTitle className="text-2xl font-semibold text-white">Add Event</DialogTitle>
          </DialogHeader>
        </Card>
        <ScrollArea className="max-h-[calc(90vh-120px)] px-6">
          <div className="py-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="programName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Program Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter program name" 
                          className="h-11" 
                          {...field} 
                        />
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
                      <FormLabel className="text-sm font-medium">Address</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter address"
                          className="resize-none h-24"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Time</FormLabel>
                      <FormControl>
                        <TimePicker
                          date={field.value}
                          setDate={(date) => field.onChange(date)}
                        />
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
                      <FormLabel className="text-sm font-medium">Event From</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter event organizer" 
                          className="h-11" 
                          {...field} 
                        />
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
                      <FormLabel className="text-sm font-medium">Contact No</FormLabel>
                      <FormControl>
                        <Input 
                          type="tel" 
                          placeholder="Enter contact number"
                          className="h-11" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </div>
        </ScrollArea>
        <div className="p-6 border-t">
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => { setOpen(false); if (onClose) onClose(); }}
              className="h-11"
            >
              Cancel
            </Button>
            <Button 
              onClick={form.handleSubmit(onSubmit)}
              className="h-11 bg-blue-500 text-white hover:bg-blue-600"
            >
              Save Event
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
