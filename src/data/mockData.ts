import { TimeSlot, DaySchedule } from '@/types/appointment';
import { formatDate, getWeekDates, getMonday } from '@/utils/dateUtils';

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
];

const generateTimeSlots = (date: string): TimeSlot[] => {
  return TIME_SLOTS.map((time) => ({
    id: `${date}-${time}`,
    time,
    date,
    isBooked: Math.random() < 0.3, // 30% chance of being booked
    patientName: Math.random() < 0.3 ? 'John Doe' : undefined,
    description: Math.random() < 0.3 ? 'Regular checkup' : undefined,
  }));
};

export const generateWeekSchedule = (startDate: Date = new Date()): DaySchedule[] => {
  const monday = getMonday(new Date(startDate));
  const weekDates = getWeekDates(monday);
  
  return weekDates.map(date => ({
    date: formatDate(date),
    dayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
    slots: generateTimeSlots(formatDate(date))
  }));
};