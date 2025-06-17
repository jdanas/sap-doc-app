import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  FileText,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SimpleHeader } from "@/components/ui/simple-header";
import { AppointmentService } from "@/services/appointmentService";
import { TimeSlot } from "@/types/appointment";
import { formatDisplayDate } from "@/utils/dateUtils";
import { useToast } from "@/hooks/use-toast";

export function AppointmentsListPage() {
  const [appointments, setAppointments] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const bookedAppointments =
        await AppointmentService.getBookedAppointments();
      setAppointments(bookedAppointments);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load appointments";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const handleCancelAppointment = async (slotId: string) => {
    try {
      await AppointmentService.cancelBooking(slotId);
      setAppointments((prev) => prev.filter((apt) => apt.id !== slotId));
      toast({
        title: "Appointment Cancelled",
        description: "The appointment has been successfully cancelled.",
      });
    } catch (error) {
      toast({
        title: "Cancellation Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to cancel appointment",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center space-x-4 mb-8">
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Schedule
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              Booked Appointments
            </h1>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">Loading appointments...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center space-x-4 mb-8">
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Schedule
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              Booked Appointments
            </h1>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-red-800 font-medium mb-2">
              Error loading appointments
            </h3>
            <p className="text-red-700 mb-4">{error}</p>
            <Button onClick={loadAppointments} variant="outline" size="sm">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SimpleHeader />
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Schedule
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              Booked Appointments
            </h1>
          </div>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {appointments.length} Total
          </Badge>
        </div>

        {/* Appointments List */}
        {appointments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No booked appointments
              </h3>
              <p className="text-gray-500 text-center mb-6">
                There are currently no booked appointments in the system.
              </p>
              <Link to="/">
                <Button>Book New Appointment</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <Card
                key={appointment.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      {/* Patient Info */}
                      <div className="flex items-center space-x-2 mb-3">
                        <User className="h-5 w-5 text-gray-500" />
                        <h3 className="text-lg font-semibold text-gray-900">
                          {appointment.patientName}
                        </h3>
                      </div>

                      {/* Date and Time */}
                      <div className="flex items-center space-x-6 mb-3">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {formatDisplayDate(appointment.date)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {appointment.time}
                          </span>
                        </div>
                      </div>

                      {/* Description */}
                      {appointment.description && (
                        <div className="flex items-start space-x-2">
                          <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
                          <p className="text-sm text-gray-600">
                            {appointment.description}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col space-y-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleCancelAppointment(appointment.id)}
                        className="flex items-center"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Refresh Button */}
        <div className="mt-8 text-center">
          <Button variant="outline" onClick={loadAppointments}>
            Refresh List
          </Button>
        </div>
      </div>
    </div>
  );
}
