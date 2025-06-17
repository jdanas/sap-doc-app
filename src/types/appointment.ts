export interface TimeSlot {
  id: string;
  time: string;
  date: string;
  isBooked: boolean;
  patientName?: string;
  description?: string;
}

export interface BookingFormData {
  patientName: string;
  description: string;
  selectedSlot: TimeSlot | null;
}

export interface DaySchedule {
  date: string;
  dayName: string;
  slots: TimeSlot[];
}