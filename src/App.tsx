import { useState, useMemo } from 'react';
import { Header } from '@/components/ui/header';
import { ScheduleGrid } from '@/components/ui/schedule-grid';
import { BookingModal } from '@/components/ui/booking-modal';
import { StatsCard } from '@/components/ui/stats-card';
import { generateWeekSchedule } from '@/data/mockData';
import { TimeSlot, BookingFormData, DaySchedule } from '@/types/appointment';
import { getMonday, formatDisplayDate } from '@/utils/dateUtils';

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedule, setSchedule] = useState<DaySchedule[]>(() => generateWeekSchedule(currentDate));
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const currentWeekDisplay = useMemo(() => {
    const monday = getMonday(new Date(currentDate));
    const sunday = new Date(monday);
    sunday.setDate(sunday.getDate() + 6);
    
    return `${formatDisplayDate(monday.toISOString().split('T')[0])} - ${formatDisplayDate(sunday.toISOString().split('T')[0])}`;
  }, [currentDate]);

  const stats = useMemo(() => {
    const totalSlots = schedule.reduce((acc, day) => acc + day.slots.length, 0);
    const bookedSlots = schedule.reduce((acc, day) => 
      acc + day.slots.filter(slot => slot.isBooked).length, 0
    );
    const availableSlots = totalSlots - bookedSlots;
    
    return {
      total: totalSlots,
      booked: bookedSlots,
      available: availableSlots
    };
  }, [schedule]);

  const handleSlotClick = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setIsBookingModalOpen(true);
  };

  const handleBooking = (bookingData: BookingFormData) => {
    if (!bookingData.selectedSlot) return;

    setSchedule(prevSchedule => 
      prevSchedule.map(day => ({
        ...day,
        slots: day.slots.map(slot => 
          slot.id === bookingData.selectedSlot!.id
            ? {
                ...slot,
                isBooked: true,
                patientName: bookingData.patientName,
                description: bookingData.description
              }
            : slot
        )
      }))
    );
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentDate(newDate);
    setSchedule(generateWeekSchedule(newDate));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSchedule(generateWeekSchedule(today));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        currentWeek={currentWeekDisplay}
        onPreviousWeek={() => navigateWeek('prev')}
        onNextWeek={() => navigateWeek('next')}
        onToday={goToToday}
      />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatsCard
              title="Total Appointments"
              value={stats.total}
              description="This week's schedule"
            />
            <StatsCard
              title="Booked"
              value={stats.booked}
              description="Confirmed appointments"
            />
            <StatsCard
              title="Available"
              value={stats.available}
              description="Open time slots"
            />
          </div>

          {/* Schedule Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Weekly Schedule</h2>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-white border border-gray-300 rounded"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-100 border border-gray-200 rounded"></div>
                  <span>Booked</span>
                </div>
              </div>
            </div>
            
            <ScheduleGrid
              schedule={schedule}
              onSlotClick={handleSlotClick}
            />
          </div>
        </div>
      </main>

      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        selectedSlot={selectedSlot}
        onBook={handleBooking}
      />
    </div>
  );
}

export default App;