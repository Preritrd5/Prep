"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Send,
  Bot,
  User,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { studentGeminiAssistantAction } from "@/app/actions/analytics";
import type { StudentPerformanceAnalytics, WeakAreaTopic } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Message {
  role: "assistant" | "user";
  text: string;
  timestamp: string;
}

interface StudyAssistantClientProps {
  analytics: StudentPerformanceAnalytics;
  weakTopics: WeakAreaTopic[];
  studentName: string;
}

export default function StudyAssistantClient({
  analytics,
  weakTopics,
  studentName,
}: StudyAssistantClientProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: `Hello ${studentName}! I am your PrepTrack AI Study Assistant.

I have analyzed your current preparation metrics:
- Syllabus Progress: ${analytics.syllabusCompletionPercentage}% (${analytics.completedTopics} of ${analytics.totalSyllabusTopics} topics completed)
- MCQ Practice Accuracy: ${analytics.overallAccuracy}% across ${analytics.mcqsAttempted} attempts
- Weak Areas Flagged: ${
        weakTopics.length > 0
          ? weakTopics.map((w) => w.topicTitle).join(", ")
          : "None currently flagged"
      }

How can I help optimize your preparation today? You can ask me to draft a weekly revision schedule, explain weak conceptual areas, or recommend high-yield practice priorities.`,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);

  const [inputQuery, setInputQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (queryText?: string) => {
    const q = queryText || inputQuery;
    if (!q || q.trim() === "" || isLoading) return;

    const userMsg: Message = {
      role: "user",
      text: q,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setIsLoading(true);

    try {
      const res = await studentGeminiAssistantAction(q);
      const aiReply: Message = {
        role: "assistant",
        text:
          res.response ||
          "I was unable to analyze your preparation query at this moment.",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, aiReply]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "An error occurred while communicating with the Study Assistant. Please try again shortly.",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    {
      label: "Create a 7-day revision plan",
      query:
        "Can you create a structured 7-day revision plan prioritizing my weak areas?",
    },
    {
      label: "Analyze my weak areas",
      query:
        "Explain why my identified weak topics need attention and what action steps I should take.",
    },
    {
      label: "What should I study next?",
      query:
        "Based on my pending syllabus and target exams, what topic should I focus on next?",
    },
    {
      label: "Tips to improve MCQ accuracy",
      query: `My MCQ accuracy is currently at ${analytics.overallAccuracy}%. How can I reach 75%+?`,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Context Summary Banner */}
      <Card>
        <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Badge variant="primary" size="md">
              Grounded in Student Data
            </Badge>
            <span className="text-text-muted">
              {analytics.syllabusCompletionPercentage}% syllabus completed
            </span>
          </div>

          <div className="flex items-center gap-2 text-text-muted">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span>Overall Accuracy: {analytics.overallAccuracy}%</span>
          </div>
        </CardContent>
      </Card>

      {/* Chat Conversation Card */}
      <Card className="flex flex-col h-[580px] overflow-hidden">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={cn(
                "flex gap-3 max-w-[85%]",
                msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-xl shrink-0 text-xs",
                  msg.role === "assistant"
                    ? "bg-primary text-white"
                    : "bg-background-secondary text-text-primary border border-border"
                )}
              >
                {msg.role === "assistant" ? (
                  <Bot className="h-4 w-4" />
                ) : (
                  <User className="h-4 w-4" />
                )}
              </div>

              <div
                className={cn(
                  "rounded-2xl p-4 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap",
                  msg.role === "assistant"
                    ? "bg-card border border-border text-text-primary shadow-xs"
                    : "bg-primary text-white"
                )}
              >
                {msg.text}
                <div
                  className={cn(
                    "text-[10px] mt-2 text-right opacity-70",
                    msg.role === "assistant"
                      ? "text-text-muted"
                      : "text-white/80"
                  )}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 mr-auto max-w-[85%]">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-white shrink-0">
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-2xl bg-card border border-border p-4 text-xs text-text-muted shadow-xs flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
                <span>Analyzing curriculum data & formulating study recommendations...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Prompts Bar */}
        <div className="px-4 py-2 border-t border-border/70 bg-background-secondary/30 flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] font-bold text-text-muted uppercase shrink-0">
            Suggested:
          </span>
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(qp.query)}
              disabled={isLoading}
              className="text-[11px] font-medium whitespace-nowrap rounded-lg border border-border bg-card px-2.5 py-1 text-text-primary hover:border-primary/40 hover:bg-background-secondary transition shrink-0"
            >
              {qp.label}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-border/70 bg-card">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask your study assistant a preparation question..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              disabled={isLoading}
              className="flex-1 rounded-xl border border-input-border bg-card px-3.5 py-2 text-xs sm:text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <Button
              type="submit"
              size="md"
              isLoading={isLoading}
              disabled={!inputQuery.trim()}
              leftIcon={<Send className="h-4 w-4" />}
            >
              Send
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
