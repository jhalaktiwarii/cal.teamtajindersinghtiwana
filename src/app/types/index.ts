export interface Appointment {
  id: string;
  userid: string;
  programName: string;
  address: string;
  startTime: string;
  status: 'going' | 'not-going' | 'scheduled';
  notes?: string;
  isUrgent: boolean;
  eventFrom: string;
  contactNo: string;
  createdAt: string;
  updatedAt: string;
}

export interface Patient {
  id: string;
  name: string;
}

export type ViewMode = 'day' | 'week' | 'month' | 'year';

export interface CalendarEvent {
  appointment: Appointment;
}