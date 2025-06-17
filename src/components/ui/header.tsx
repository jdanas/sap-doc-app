import { ChevronLeft, ChevronRight, Calendar, List, Bot } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  currentWeek?: string;
  onPreviousWeek?: () => void;
  onNextWeek?: () => void;
  onToday?: () => void;
}

export function Header({
  currentWeek,
  onPreviousWeek,
  onNextWeek,
  onToday,
}: HeaderProps) {
  const location = useLocation();
  const isSchedulePage = location.pathname === "/";

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

        <div className="flex items-center space-x-4">
          {/* Navigation Links */}
          <div className="flex items-center space-x-2">
            {isSchedulePage ? (
              <>
                <Link to="/appointments">
                  <Button variant="outline" size="sm">
                    <List className="h-4 w-4 mr-2" />
                    Appointments
                  </Button>
                </Link>
                <Link to="/adk">
                  <Button variant="outline" size="sm">
                    <Bot className="h-4 w-4 mr-2" />
                    ADK Assistant
                  </Button>
                </Link>
              </>
            ) : (
              <Link to="/">
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule
                </Button>
              </Link>
            )}
          </div>

          {/* Week Navigation - only show on schedule page */}
          {isSchedulePage &&
            currentWeek &&
            onPreviousWeek &&
            onNextWeek &&
            onToday && (
              <>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onPreviousWeek}
                    className="px-3"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <span className="text-sm font-medium text-gray-700 min-w-[120px] text-center">
                    {currentWeek}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onNextWeek}
                    className="px-3"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={onToday}
                  className="text-gray-600 hover:text-gray-900"
                >
                  Today
                </Button>
              </>
            )}
        </div>
      </div>
    </header>
  );
}
