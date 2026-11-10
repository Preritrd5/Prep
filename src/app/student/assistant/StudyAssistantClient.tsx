"use client";

import { useState } from "react";
import {
  Sparkles,
  Send,
  Bot,
  User,
  ShieldCheck,
  AlertCircle,
  BookOpen,
  RotateCcw,
  TrendingUp,
  HelpCircle,
} from "lucide-react";
import { studentGeminiAssistantAction } from "@/app/actions/analytics";
import type { StudentPerformanceAnalytics, WeakAreaTopic } from "@/lib/types";

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
      text: `Hello ${studentName}! I am your **PrepTrack AI Study Assistant**.

I have reviewed your current preparation status:
- **Syllabus Progress:** ${analytics.syllabusCompletionPercentage}% (${analytics.completedTopics} of ${analytics.totalSyllabusTopics} topics completed)
- **MCQ Practice Accuracy:** ${analytics.overallAccuracy}% across ${analytics.mcqsAttempted} attempts
- **Weak Areas Flagged:** ${weakTopics.length > 0 ? weakTopics.map((w) => w.topicTitle).join(", ") : "None currently flagged"}

How can I help optimize your preparation today? You can ask me to draft a weekly revision schedule, explain weak conceptual areas, or recommend high-yield practice priorities.`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
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
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setIsLoading(true);

    try {
      const res = await studentGeminiAssistantAction(q);
      const aiReply: Message = {
        role: "assistant",
        text: res.response || "I was unable to analyze your preparation query at this moment.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiReply]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "An error occurred while communicating with the Study Assistant. Please try again shortly.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    { label: "Create a 7-day revision plan", query: "Can you create a structured 7-day revision plan prioritizing my weak areas?" },
    { label: "Analyze my weak areas", query: "Explain why my identified weak topics need attention and what action steps I should take." },
    { label: "What should I study next?", query: "Based on my pending syllabus and target exams, what topic should I focus on next?" },
    { label: "Tips to improve MCQ accuracy", query: "My MCQ accuracy is currently at " + analytics.overallAccuracy + "%. How can I reach 75%+?" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-indigo-600" />
            AI Study Assistant
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Powered by Google Gemini 2.5 Flash with real-time context from your syllabus progress and test accuracy.
          </p>
        </div>

        <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Server-Side & Data Isolated</span>
        </div>
      </div>

      {/* Chat Canvas */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm flex flex-col h-[650px] overflow-hidden">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 ${
                m.role === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <div
                className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 text-white ${
                  m.role === "user" ? "bg-slate-900" : "bg-indigo-600"
                }`}
              >
                {m.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed space-y-2 ${
                  m.role === "user"
                    ? "bg-slate-900 text-white rounded-tr-none"
                    : "bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none"
                }`}
              >
                <div className="whitespace-pre-wrap font-sans">{m.text}</div>
                <div
                  className={`text-[10px] text-right ${
                    m.role === "user" ? "text-slate-400" : "text-slate-400"
                  }`}
                >
                  {m.timestamp}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 text-xs text-slate-500 rounded-tl-none flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-600 animate-spin" />
                <span>Analyzing your syllabus data and formulating study recommendations...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center gap-2 overflow-x-auto">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0">
            Quick Inquiries:
          </span>
          {quickPrompts.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(chip.query)}
              disabled={isLoading}
              className="rounded-full bg-white border border-slate-200 px-3 py-1 text-[11px] font-semibold text-slate-700 hover:border-indigo-300 hover:text-indigo-700 transition shrink-0 shadow-xs"
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask anything about your syllabus, revision schedule, or test performance..."
              disabled={isLoading}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={isLoading || !inputQuery.trim()}
              className="rounded-xl bg-indigo-600 p-2.5 text-white hover:bg-indigo-700 transition disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>

          <p className="text-[10px] text-slate-400 mt-2 text-center">
            AI suggestions are recommendations based on your personal metrics. Official notifications and rules are issued exclusively by examination authorities.
          </p>
        </div>
      </div>
    </div>
  );
}
