import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Bot, Calendar, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { SimpleHeader } from "@/components/ui/simple-header";
import { AppointmentService } from "@/services/appointmentService";
import { useToast } from "@/hooks/use-toast";

export function ADKQueryPage() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleQuery = async () => {
    if (!query.trim()) {
      toast({
        title: "Error",
        description: "Please enter a query",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setResponse("");

    try {
      // Process the query with our simple agent
      const agentResponse = await processBookingQuery(query);
      setResponse(agentResponse);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to process query";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      setResponse(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const processBookingQuery = async (userQuery: string): Promise<string> => {
    const normalizedQuery = userQuery.toLowerCase();

    // Check if query is about finding available slots
    if (
      normalizedQuery.includes("nearest") ||
      normalizedQuery.includes("available") ||
      normalizedQuery.includes("book") ||
      normalizedQuery.includes("appointment") ||
      normalizedQuery.includes("next") ||
      normalizedQuery.includes("earliest")
    ) {
      try {
        // Get current week schedule
        const today = new Date();
        const schedule = await AppointmentService.getWeekSchedule(today);

        // Find the nearest available slot
        const nearestSlot = findNearestAvailableSlot(schedule);

        if (nearestSlot) {
          return `🎯 **Nearest Available Appointment:**

📅 **Date:** ${formatDisplayDate(nearestSlot.date)}
⏰ **Time:** ${nearestSlot.time}
📍 **Slot ID:** ${nearestSlot.id}

✅ This slot is currently available for booking. Would you like me to help you book this appointment?

💡 **How to book:** Go to the main schedule page and click on this time slot to book your appointment.`;
        } else {
          return `❌ **No Available Slots Found**

Unfortunately, there are no available appointment slots in the current week. 

🔍 **Suggestions:**
- Check the schedule page for next week's availability
- Contact the office directly for urgent appointments
- Try looking at different time preferences

📞 **Alternative:** You can call the office to discuss additional scheduling options.`;
        }
      } catch {
        throw new Error("Failed to check available appointments");
      }
    }

    // Handle other types of queries
    if (
      normalizedQuery.includes("cancel") ||
      normalizedQuery.includes("reschedule")
    ) {
      return `📋 **Appointment Management:**

To cancel or reschedule an appointment:

1. 📱 **View Appointments:** Click "View Appointments" in the header
2. 🗑️ **Cancel:** Use the cancel button next to your appointment
3. 📅 **Reschedule:** Cancel your current appointment and book a new one

💡 **Tip:** Make sure to cancel at least 24 hours in advance when possible.`;
    }

    if (normalizedQuery.includes("help") || normalizedQuery.includes("how")) {
      return `🤖 **SAP Doc Appointment Assistant**

I can help you with:

🔍 **Find Available Slots:**
- "What's the nearest available appointment?"
- "When is the next available slot?"
- "Show me available times"

📅 **Booking Information:**
- "How do I book an appointment?"
- "What times are available?"

🗂️ **Appointment Management:**
- "How do I cancel my appointment?"
- "How do I reschedule?"

💬 **Just ask me anything about appointments and I'll help you!**`;
    }

    // Default response for unrecognized queries
    return `🤖 **I'm here to help with appointments!**

I didn't quite understand your request. Here's what I can help you with:

🔍 **Find appointments:** Try asking "What's the nearest available appointment?"
📅 **Booking help:** Ask "How do I book an appointment?"
🗂️ **Management:** Ask "How do I cancel my appointment?"

💡 **Tip:** Be specific about what you're looking for, and I'll do my best to help!`;
  };

  const findNearestAvailableSlot = (
    schedule: {
      date: string;
      slots: { id: string; date: string; time: string; isBooked: boolean }[];
    }[]
  ) => {
    const now = new Date();

    for (const day of schedule) {
      for (const slot of day.slots) {
        if (!slot.isBooked) {
          const slotDateTime = new Date(`${slot.date} ${slot.time}`);
          if (slotDateTime > now) {
            return slot;
          }
        }
      }
    }
    return null;
  };

  const formatDisplayDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleQuery();
    }
  };

  const sampleQueries = [
    "What's the nearest available appointment?",
    "When is the next available booking slot?",
    "How do I book an appointment?",
    "Show me available times this week",
    "How do I cancel my appointment?",
  ];

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
            <div className="flex items-center space-x-2">
              <Bot className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">
                ADK Assistant
              </h1>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Query Input */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Ask About Appointments</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label
                  htmlFor="query"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Your Query
                </label>
                <Textarea
                  id="query"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about appointments... (e.g., 'What's the nearest available appointment?')"
                  rows={4}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Press Ctrl+Enter or Cmd+Enter to submit
                </p>
              </div>

              <Button
                onClick={handleQuery}
                disabled={loading || !query.trim()}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Ask Assistant
                  </>
                )}
              </Button>

              {/* Sample Queries */}
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Sample Queries:
                </h3>
                <div className="space-y-2">
                  {sampleQueries.map((sample, index) => (
                    <button
                      key={index}
                      onClick={() => setQuery(sample)}
                      className="text-left text-sm text-black-600 bg-white hover:text-blue-800 block w-full p-2 rounded border border-gray-200 hover:bg-blue-50 transition-colors"
                    >
                      "{sample}"
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Response */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bot className="h-5 w-5 text-blue-600" />
                <span>Assistant Response</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600">
                    Processing your query...
                  </span>
                </div>
              ) : response ? (
                <div className="prose prose-sm max-w-none">
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans">
                      {response}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Bot className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>
                    Ask me a question about appointments and I'll help you find
                    the information you need!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ADK Integration Info */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>🚀 ADK Integration Ready</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">
                Google ADK Integration Points:
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>
                  • <strong>Query Processing:</strong> Ready for ADK natural
                  language understanding
                </li>
                <li>
                  • <strong>Appointment Data:</strong> Connected to real
                  appointment database
                </li>
                <li>
                  • <strong>Response Generation:</strong> Structured responses
                  with booking information
                </li>
                <li>
                  • <strong>Action Handling:</strong> Can trigger booking
                  actions and provide guidance
                </li>
              </ul>
              <p className="text-xs text-blue-600 mt-3">
                This page serves as the foundation for integrating Google ADK's
                advanced AI capabilities.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
