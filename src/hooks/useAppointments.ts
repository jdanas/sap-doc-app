import { useState, useEffect, useCallback } from "react";
import { DaySchedule } from "@/types/appointment";
import { AppointmentService } from "@/services/appointmentService";

interface UseAppointmentsState {
  schedule: DaySchedule[];
  loading: boolean;
  error: string | null;
}

interface UseAppointmentsReturn extends UseAppointmentsState {
  refreshSchedule: () => Promise<void>;
  bookAppointment: (
    slotId: string,
    patientName: string,
    description?: string
  ) => Promise<void>;
  cancelAppointment: (slotId: string) => Promise<void>;
}

export function useAppointments(currentDate: Date): UseAppointmentsReturn {
  const [state, setState] = useState<UseAppointmentsState>({
    schedule: [],
    loading: true,
    error: null,
  });

  const refreshSchedule = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const schedule = await AppointmentService.getWeekSchedule(currentDate);
      setState((prev) => ({ ...prev, schedule, loading: false }));
    } catch (error) {
      console.error("Failed to fetch schedule:", error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch schedule",
      }));
    }
  }, [currentDate]);

  const bookAppointment = useCallback(
    async (slotId: string, patientName: string, description?: string) => {
      try {
        await AppointmentService.bookTimeSlot(slotId, {
          patientName,
          description,
        });

        // Refresh the entire schedule to ensure data consistency
        await refreshSchedule();
      } catch (error) {
        console.error("Failed to book appointment:", error);
        throw error;
      }
    },
    [refreshSchedule]
  );

  const cancelAppointment = useCallback(async (slotId: string) => {
    try {
      await AppointmentService.cancelBooking(slotId);

      // Refresh the entire schedule to ensure data consistency
      await refreshSchedule();
    } catch (error) {
      console.error("Failed to cancel appointment:", error);
      throw error;
    }
  }, [refreshSchedule]);

  // Fetch schedule when currentDate changes
  useEffect(() => {
    refreshSchedule();
  }, [refreshSchedule]);

  return {
    ...state,
    refreshSchedule,
    bookAppointment,
    cancelAppointment,
  };
}
