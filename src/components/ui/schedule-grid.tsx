import { DaySchedule } from '@/types/appointment';
import { TimeSlot } from './time-slot';
import { formatDisplayDate } from '@/utils/dateUtils';
import { TimeSlot as TimeSlotType } from '@/types/appointment';

interface ScheduleGridProps {
  schedule: DaySchedule[];
  onSlotClick: (slot: TimeSlotType) => void;
}

export function ScheduleGrid({ schedule, onSlotClick }: ScheduleGridProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="grid grid-cols-7 border-b border-gray-200">
        {schedule.map((day) => (
          <div key={day.date} className="p-4 border-r last:border-r-0 border-gray-200">
            <div className="text-center">
              <h3 className="font-semibold text-gray-900 mb-1">{day.dayName}</h3>
              <p className="text-sm text-gray-500">{formatDisplayDate(day.date)}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7">
        {schedule.map((day) => (
          <div key={day.date} className="p-4 border-r last:border-r-0 border-gray-200 space-y-2">
            {day.slots.map((slot) => (
              <TimeSlot
                key={slot.id}
                slot={slot}
                onClick={onSlotClick}
                className="w-full"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}