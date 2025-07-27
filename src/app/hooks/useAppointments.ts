import { useState, useCallback, useEffect } from 'react';
import { Appointment, CalendarEvent } from '../types';

export function useAppointments() {
  const [appointments, setAppointments] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = useCallback(async () => {
    try {
      const response = await fetch('/api/appointments');
      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }
      const data = await response.json();
      setAppointments(data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const saveAppointment = useCallback(async (appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointment),
      });

      if (!response.ok) {
        throw new Error('Failed to save appointment');
      }

      // Refresh appointments after saving
      await fetchAppointments();
    } catch (error) {
      console.error('Error saving appointment:', error);
      throw error;
    }
  }, [fetchAppointments]);

  const updateAppointment = useCallback(async (id: string, updates: Partial<Appointment>) => {
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update appointment');
      }

      const updatedAppointment = await response.json();
      setAppointments(prev => prev.map(event => {
        if (event.appointment.id === id) {
          return {
            ...event,
            appointment: updatedAppointment,
          };
        }
        return event;
      }));
    } catch (error) {
      console.error('Error updating appointment:', error);
      throw error;
    }
  }, []);

  const deleteAppointment = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete appointment');
      }

      setAppointments(prev => prev.filter(event => event.appointment.id !== id));
    } catch (error) {
      console.error('Error deleting appointment:', error);
      throw error;
    }
  }, []);

  const updateStatus = useCallback(async (id: string, status: Appointment['status']) => {
    try {
      await updateAppointment(id, { status });
    } catch (error) {
      console.error('Error updating appointment status:', error);
      throw error;
    }
  }, [updateAppointment]);

  const updateUrgency = useCallback((id: string, isUrgent: boolean) => {
    setAppointments(prev => prev.map(event => {
      if (event.appointment.id === id) {
        return {
          ...event,
          appointment: {
            ...event.appointment,
            isUrgent,
            lastModified: new Date().toISOString()
          }
        };
      }
      return event;
    }));
  }, []);

  return {
    appointments,
    loading,
    saveAppointment,
    updateAppointment,
    deleteAppointment,
    updateStatus,
    updateUrgency,
    refreshAppointments: fetchAppointments,
  };
}