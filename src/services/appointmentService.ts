import { TimeSlot, DaySchedule } from "@/types/appointment";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export class AppointmentService {
  private static async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    try {
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        throw new Error(
          errorData.error || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Get time slots for a date range
   */
  static async getTimeSlots(
    startDate?: string,
    endDate?: string
  ): Promise<DaySchedule[]> {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const queryString = params.toString();
    const endpoint = `/appointments/slots${
      queryString ? `?${queryString}` : ""
    }`;

    return this.request<DaySchedule[]>(endpoint);
  }

  /**
   * Get a specific time slot by ID
   */
  static async getTimeSlot(slotId: string): Promise<TimeSlot> {
    return this.request<TimeSlot>(`/appointments/slots/${slotId}`);
  }

  /**
   * Book a time slot
   */
  static async bookTimeSlot(
    slotId: string,
    bookingData: { patientName: string; description?: string }
  ): Promise<TimeSlot> {
    return this.request<TimeSlot>(`/appointments/slots/${slotId}/book`, {
      method: "POST",
      body: JSON.stringify(bookingData),
    });
  }

  /**
   * Cancel a booking
   */
  static async cancelBooking(slotId: string): Promise<TimeSlot> {
    return this.request<TimeSlot>(`/appointments/slots/${slotId}/book`, {
      method: "DELETE",
    });
  }

  /**
   * Get week schedule (helper method)
   */
  static async getWeekSchedule(startDate: Date): Promise<DaySchedule[]> {
    const monday = new Date(startDate);
    monday.setDate(startDate.getDate() - startDate.getDay() + 1);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const startDateStr = monday.toISOString().split("T")[0];
    const endDateStr = sunday.toISOString().split("T")[0];

    return this.getTimeSlots(startDateStr, endDateStr);
  }

  /**
   * Get only booked appointments
   */
  static async getBookedAppointments(): Promise<TimeSlot[]> {
    return this.request<TimeSlot[]>("/appointments/booked");
  }
}
