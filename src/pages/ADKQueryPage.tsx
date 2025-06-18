import { useState } from "react";
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
      // Process the query with our Google ADK Python service through the CORS proxy
      const response = await fetch("http://localhost:8001/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appName: "sap-doc-app",
          userId: "user-" + new Date().getTime(),
          sessionId: "session-" + new Date().getTime(),
          newMessage: {
            role: "user",
            parts: [{ text: query }]
          }
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to process query");
      }

      const data = await response.json();
      
      // Extract response from ADK API response format
      // The ADK API returns events with content that has parts with text
      let responseText = "";
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
      } else {
        responseText = "Received response in unexpected format. Check console for details.";
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
      </div>
    </div>
  );
}
