import { Calendar } from "lucide-react";

export function SimpleHeader() {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Calendar className="h-8 w-8 text-gray-700" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">SAP - MeetDoc</h1>
            <p className="text-sm text-gray-500">Appointment booking system</p>
          </div>
        </div>
      </div>
    </header>
  );
}
