export interface Appointment {
  id: string
  programName: string
  address: string
  startTime: string
  endTime: string
  eventFrom: string
  contactNo?: string
  status: 'going' | 'not-going' | 'scheduled'
  isUrgent: boolean
  createdAt: string
  updatedAt: string
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export const appointmentService = {
  async updateStatus(appointmentId: string, newStatus: 'going' | 'not-going' | 'scheduled'): Promise<ApiResponse<Appointment>> {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update appointment status')
      }

      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      console.error('Error updating appointment status:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update appointment status'
      }
    }
  },

  async deleteAppointment(appointmentId: string): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete appointment')
      }

      return { success: true }
    } catch (error) {
      console.error('Error deleting appointment:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete appointment'
      }
    }
  },

  async deleteMultipleAppointments(appointmentIds: string[]): Promise<ApiResponse<void>> {
    try {
      const response = await fetch('/api/appointments/bulk-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ appointmentIds }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete appointments')
      }

      return { success: true }
    } catch (error) {
      console.error('Error deleting multiple appointments:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete appointments'
      }
    }
  },

  async updateUrgency(appointmentId: string, isUrgent: boolean): Promise<ApiResponse<Appointment>> {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isUrgent }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update appointment urgency')
      }

      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      console.error('Error updating appointment urgency:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update appointment urgency'
      }
    }
  }
}
