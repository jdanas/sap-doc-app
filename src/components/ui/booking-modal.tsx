import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { TimeSlot, BookingFormData } from '@/types/appointment';
import { formatDisplayDate } from '@/utils/dateUtils';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSlot: TimeSlot | null;
  onBook: (bookingData: BookingFormData) => void;
}

export function BookingModal({ isOpen, onClose, selectedSlot, onBook }: BookingModalProps) {
  const [formData, setFormData] = useState<BookingFormData>({
    patientName: '',
    description: '',
    selectedSlot: null
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSlot && formData.patientName.trim()) {
      onBook({
        ...formData,
        selectedSlot
      });
      setFormData({ patientName: '', description: '', selectedSlot: null });
      onClose();
    }
  };

  const handleClose = () => {
    setFormData({ patientName: '', description: '', selectedSlot: null });
    onClose();
  };

  if (!selectedSlot) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Book Appointment
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Selected Time Slot</h4>
            <p className="text-sm text-gray-600">
              {formatDisplayDate(selectedSlot.date)} at {selectedSlot.time}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="patientName" className="text-sm font-medium text-gray-700">
                Patient Name *
              </Label>
              <Input
                id="patientName"
                type="text"
                value={formData.patientName}
                onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                placeholder="Enter patient name"
                required
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                Description of Health Issue
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the health concern..."
                rows={3}
                className="w-full resize-none"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gray-900 hover:bg-gray-800"
              >
                Book Appointment
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}