import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Bot, Calendar, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { SimpleHeader } from "@/components/ui/simple-header";
import { useToast } from "@/hooks/use-toast";

export function ADKQueryPage() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<{
    userId: string;
    sessionId: string;
    appName: string;
  } | null>(null);
  const { toast } = useToast();

  // Create session when component mounts
  useEffect(() => {
    const createSession = async () => {
      try {
        setResponse("Initializing ADK session...");

        const sessionResponse = await fetch(
          "http://localhost:8001/create-session",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!sessionResponse.ok) {
          throw new Error(
            `Failed to create ADK session: ${sessionResponse.status} ${sessionResponse.statusText}`
          );
        }

        const sessionData = await sessionResponse.json();

        if (!sessionData.success) {
          throw new Error(sessionData.error || "Failed to create ADK session");
        }

        // Store session info
        setSessionInfo({
          userId: sessionData.userId,
          sessionId: sessionData.sessionId,
          appName: sessionData.appName,
        });

        setSessionReady(true);
        setResponse(
          "ADK session ready! You can now ask questions about appointments."
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to initialize session";
        setResponse(`Error initializing session: ${errorMessage}`);
        toast({
          title: "Session Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    };

    createSession();
  }, [toast]);

  const handleQuery = async () => {
    if (!query.trim()) {
      toast({
        title: "Error",
        description: "Please enter a query",
        variant: "destructive",
      });
      return;
    }

    if (!sessionReady || !sessionInfo) {
      toast({
        title: "Error",
        description:
          "Session not ready. Please wait for initialization to complete.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setResponse("Processing your query...");

    try {
      // Use the existing session info
      const { userId, sessionId, appName } = sessionInfo;

      // Process the query with our Google ADK Python service through the CORS proxy
      const response = await fetch("http://localhost:8001/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appName: appName,
          userId: userId,
          sessionId: sessionId,
          newMessage: {
            role: "user",
            parts: [{ text: query }],
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to process query");
      }

      const data = await response.json();

      // Extract response from ADK API response format
      // The ADK API can return different formats depending on the response type
      let responseText = "";

      // Check if we have the stream format (array of events)
      if (Array.isArray(data)) {
        // Find events with content, role=model and text parts
        for (const event of data) {
          if (event.content && event.content.role === "model") {
            for (const part of event.content.parts || []) {
              if (part.text) {
                responseText += part.text;
              }
            }
          }
        }
      } else if (data.response) {
        // Handle old format for backward compatibility
        responseText = data.response;
      } else if (
        data.selectedResponse &&
        data.selectedResponse.candidates &&
        data.selectedResponse.candidates.length > 0
      ) {
        // Handle format from /run endpoint which contains candidateResponses
        const candidate = data.selectedResponse.candidates[0];
        if (candidate.content && candidate.content.parts) {
          for (const part of candidate.content.parts) {
            if (part.text) {
              responseText += part.text;
            }
          }
        }
      } else if (data.text) {
        // Simple text response
        responseText = data.text;
      } else {
        responseText =
          "Received response in unexpected format. Check console for details.";
        console.error("Unexpected response format:", data);
      }

      setResponse(responseText);
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
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  ADK Assistant
                </h1>
                <div className="flex items-center space-x-2 mt-1">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      sessionReady ? "bg-green-500" : "bg-yellow-500"
                    }`}
                  />
                  <span className="text-sm text-gray-600">
                    {sessionReady ? "Session Ready" : "Initializing..."}
                  </span>
                </div>
              </div>
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
                disabled={loading || !query.trim() || !sessionReady}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : !sessionReady ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Initializing Session...
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
      </div>
    </div>
  );
}
