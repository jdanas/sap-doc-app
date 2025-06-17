import { cn } from '@/lib/utils';
import { TimeSlot as TimeSlotType } from '@/types/appointment';

interface TimeSlotProps {
  slot: TimeSlotType;
  onClick: (slot: TimeSlotType) => void;
  className?: string;
}

export function TimeSlot({ slot, onClick, className }: TimeSlotProps) {
  const handleClick = () => {
    if (!slot.isBooked) {
      onClick(slot);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={slot.isBooked}
      className={cn(
        "p-3 text-sm font-medium rounded-lg border transition-all duration-200",
        "hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1",
        slot.isBooked
          ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
          : "bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:bg-gray-50 cursor-pointer",
        className
      )}
    >
      <div className="flex flex-col items-center space-y-1">
        <span className="font-semibold">{slot.time}</span>
        {slot.isBooked && (
          <span className="text-xs text-gray-400">Booked</span>
        )}
      </div>
    </button>
  );
}