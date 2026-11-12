"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Send,
  Bot,
  User,
  TrendingUp,
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  Copy,
  Check,
  RotateCcw,
  MessageSquare,
  ChevronDown,
  Layers,
  X,
  Target,
} from "lucide-react";
import {
  studentGeminiAssistantAction,
  type AssistantTopicContext,
  type AssistantHistoryMessage,
} from "@/app/actions/analytics";
import type {
  StudentPerformanceAnalytics,
  WeakAreaTopic,
  Exam,
  Subject,
} from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/utils";

interface Message {
  role: "assistant" | "user";
  text: string;
  timestamp: string;
}

interface ChatThread {
  id: string;
  title: string;
  updatedAt: string;
  messages: Message[];
  examName?: string;
  subjectName?: string;
  topicName?: string;
}

interface StudyAssistantClientProps {
  analytics: StudentPerformanceAnalytics;
  weakTopics: WeakAreaTopic[];
  studentName: string;
  exams?: Exam[];
  subjects?: Subject[];
}

const STORAGE_KEY = "preptrack_assistant_threads";

export default function StudyAssistantClient({
  analytics,
  weakTopics,
  studentName,
  exams = [],
  subjects = [],
}: StudyAssistantClientProps) {
  // Topic Context State
  const [selectedExamId, setSelectedExamId] = useState<string>("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [selectedTopicId, setSelectedTopicId] = useState<string>("");

  // Flatten available topics for chosen subject
  const currentSubject = subjects.find((s) => s.id === selectedSubjectId);
  const currentExam = exams.find((e) => e.id === selectedExamId);

  const availableTopics = React.useMemo(() => {
    if (!currentSubject) return [];
    const topics: { id: string; title: string }[] = [];
    if (currentSubject.chapters) {
      for (const ch of currentSubject.chapters) {
        if (ch.topics) {
          for (const tp of ch.topics) {
            topics.push({ id: tp.id, title: tp.title });
          }
        }
      }
    }
    return topics;
  }, [currentSubject]);

  const currentTopic = availableTopics.find((t) => t.id === selectedTopicId);

  // Chat Threads State
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string>("default");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editingTitleText, setEditingTitleText] = useState("");

  const initialWelcomeText = React.useMemo(() => {
    return `Hello ${studentName}! I am your PrepTrack AI Study Assistant.

I have analyzed your current preparation metrics:
- Syllabus Progress: ${analytics.syllabusCompletionPercentage}% (${analytics.completedTopics} of ${analytics.totalSyllabusTopics} topics completed)
- MCQ Practice Accuracy: ${analytics.overallAccuracy}% across ${analytics.mcqsAttempted} attempts
- Weak Areas Flagged: ${
    weakTopics.length > 0
      ? weakTopics.map((w) => w.topicTitle).join(", ")
      : "None currently flagged"
  }

How can I help optimize your preparation today? You can select a target exam & syllabus topic above, ask me to explain tough concepts, create a personalized revision schedule, or analyze your mock test performance.`;
  }, [studentName, analytics, weakTopics]);

  // Initialize from LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: ChatThread[] = JSON.parse(saved);
        if (parsed.length > 0) {
          setThreads(parsed);
          setActiveThreadId(parsed[0].id);
          return;
        }
      }
    } catch {
      // ignore
    }

    // Default thread
    const defaultThread: ChatThread = {
      id: "thread-" + Date.now(),
      title: "General Study Guidance",
      updatedAt: new Date().toISOString(),
      messages: [
        {
          role: "assistant",
          text: initialWelcomeText,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ],
    };
    setThreads([defaultThread]);
    setActiveThreadId(defaultThread.id);
  }, [initialWelcomeText]);

  // Save to LocalStorage
  const saveThreads = (updatedThreads: ChatThread[]) => {
    setThreads(updatedThreads);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedThreads));
    } catch {
      // storage quota or error
    }
  };

  const activeThread = React.useMemo(() => {
    return (
      threads.find((t) => t.id === activeThreadId) ||
      threads[0] || {
        id: "default",
        title: "New Conversation",
        updatedAt: new Date().toISOString(),
        messages: [],
      }
    );
  }, [threads, activeThreadId]);

  const messages = activeThread.messages || [];

  const [inputQuery, setInputQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isLoading]);

  // Actions
  const handleNewChat = () => {
    const newThread: ChatThread = {
      id: "thread-" + Date.now(),
      title: currentTopic ? `${currentTopic.title} Discussion` : "New Conversation",
      updatedAt: new Date().toISOString(),
      messages: [
        {
          role: "assistant",
          text: currentTopic
            ? `Hello ${studentName}! I am ready to guide you on **${currentTopic.title}** (${currentSubject?.name || "General"}). Ask me for conceptual explanations, high-yield practice MCQs, or key memory shortcuts.`
            : initialWelcomeText,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ],
      examName: currentExam?.name,
      subjectName: currentSubject?.name,
      topicName: currentTopic?.title,
    };

    const updated = [newThread, ...threads];
    saveThreads(updated);
    setActiveThreadId(newThread.id);
    setIsSidebarOpen(false);
  };

  const handleDeleteThread = (threadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (threads.length <= 1) {
      handleClearCurrentChat();
      return;
    }
    const updated = threads.filter((t) => t.id !== threadId);
    saveThreads(updated);
    if (activeThreadId === threadId) {
      setActiveThreadId(updated[0].id);
    }
  };

  const handleClearCurrentChat = () => {
    if (!confirm("Clear all messages in this conversation?")) return;
    const updated = threads.map((t) => {
      if (t.id === activeThreadId) {
        return {
          ...t,
          updatedAt: new Date().toISOString(),
          messages: [
            {
              role: "assistant" as const,
              text: "Conversation cleared. How can I assist you next?",
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            },
          ],
        };
      }
      return t;
    });
    saveThreads(updated);
  };

  const handleSaveTitle = () => {
    if (!editingTitleText.trim()) {
      setIsEditingTitle(false);
      return;
    }
    const updated = threads.map((t) =>
      t.id === activeThreadId ? { ...t, title: editingTitleText.trim() } : t
    );
    saveThreads(updated);
    setIsEditingTitle(false);
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSend = async (queryText?: string) => {
    const q = queryText || inputQuery;
    if (!q || q.trim() === "" || isLoading) return;

    const userMsg: Message = {
      role: "user",
      text: q.trim(),
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const updatedMessages = [...messages, userMsg];

    // Auto-title conversation on first student query
    let newTitle = activeThread.title;
    if (
      activeThread.title === "New Conversation" ||
      activeThread.title === "General Study Guidance"
    ) {
      newTitle = q.slice(0, 30) + (q.length > 30 ? "..." : "");
    }

    const updatedThread: ChatThread = {
      ...activeThread,
      title: newTitle,
      updatedAt: new Date().toISOString(),
      messages: updatedMessages,
      examName: currentExam?.name || activeThread.examName,
      subjectName: currentSubject?.name || activeThread.subjectName,
      topicName: currentTopic?.title || activeThread.topicName,
    };

    const updatedThreads = threads.map((t) => (t.id === activeThreadId ? updatedThread : t));
    saveThreads(updatedThreads);

    setInputQuery("");
    setIsLoading(true);

    try {
      const topicContext: AssistantTopicContext = {
        examName: currentExam?.name || activeThread.examName,
        subjectName: currentSubject?.name || activeThread.subjectName,
        topicName: currentTopic?.title || activeThread.topicName,
      };

      const historyPayload: AssistantHistoryMessage[] = updatedMessages.map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await studentGeminiAssistantAction(
        q,
        "GENERAL_ASSIST",
        topicContext,
        historyPayload
      );

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

      const threadWithReply: ChatThread = {
        ...updatedThread,
        updatedAt: new Date().toISOString(),
        messages: [...updatedMessages, aiReply],
      };

      saveThreads(threads.map((t) => (t.id === activeThreadId ? threadWithReply : t)));
    } catch {
      const errorReply: Message = {
        role: "assistant",
        text: "An error occurred while communicating with the Study Assistant. Please try again shortly.",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      saveThreads(
        threads.map((t) =>
          t.id === activeThreadId
            ? { ...updatedThread, messages: [...updatedMessages, errorReply] }
            : t
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetryLast = () => {
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
    if (lastUserMessage) {
      handleSend(lastUserMessage.text);
    }
  };

  // Dynamic quick prompts
  const quickPrompts = React.useMemo(() => {
    if (currentTopic) {
      return [
        {
          label: `Explain ${currentTopic.title}`,
          query: `Can you explain the key concepts of "${currentTopic.title}" in simple terms with exam takeaways?`,
        },
        {
          label: "Generate 5 Practice MCQs",
          query: `Please generate 5 high-yield practice MCQs with explanations for "${currentTopic.title}".`,
        },
        {
          label: "Common Pitfalls & Mistakes",
          query: `What are the most common mistakes candidates make in questions related to "${currentTopic.title}"?`,
        },
      ];
    }

    return [
      {
        label: "Create 7-day revision plan",
        query: "Can you create a structured 7-day revision plan prioritizing my weak areas?",
      },
      {
        label: "Analyze weak areas",
        query:
          "Explain why my identified weak topics need attention and what action steps I should take.",
      },
      {
        label: "What should I study next?",
        query: "Based on my pending syllabus and target exams, what topic should I focus on next?",
      },
      {
        label: "Tips to reach 75%+ accuracy",
        query: `My MCQ accuracy is currently at ${analytics.overallAccuracy}%. How can I reach 75%+?`,
      },
    ];
  }, [currentTopic, analytics.overallAccuracy]);

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      {/* 1. TOPIC CONTEXT SELECTOR BAR */}
      <Card className="border-border">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs mb-3">
            <div className="flex items-center gap-2">
              <Badge variant="primary" size="md" className="gap-1.5">
                <Target className="w-3.5 h-3.5" /> Topic Context Filter
              </Badge>
              <span className="text-text-muted hidden sm:inline">
                Ground the AI Assistant in a specific curriculum syllabus or exam
              </span>
            </div>

            {(selectedExamId || selectedSubjectId || selectedTopicId) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedExamId("");
                  setSelectedSubjectId("");
                  setSelectedTopicId("");
                }}
                className="h-7 text-[11px] text-text-muted hover:text-text-primary gap-1"
              >
                <X className="w-3.5 h-3.5" /> Clear Focus
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Target Exam */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
                Target Examination
              </label>
              <select
                value={selectedExamId}
                onChange={(e) => setSelectedExamId(e.target.value)}
                className="w-full rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs text-text-primary focus:border-primary focus:outline-none"
              >
                <option value="">All Target Examinations</option>
                {exams.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.name} ({ex.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
                Curriculum Subject
              </label>
              <select
                value={selectedSubjectId}
                onChange={(e) => {
                  setSelectedSubjectId(e.target.value);
                  setSelectedTopicId("");
                }}
                className="w-full rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs text-text-primary focus:border-primary focus:outline-none"
              >
                <option value="">All Subjects</option>
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Topic */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
                Syllabus Topic
              </label>
              <select
                value={selectedTopicId}
                disabled={!selectedSubjectId || availableTopics.length === 0}
                onChange={(e) => setSelectedTopicId(e.target.value)}
                className="w-full rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs text-text-primary disabled:opacity-50 focus:border-primary focus:outline-none"
              >
                <option value="">
                  {selectedSubjectId
                    ? availableTopics.length > 0
                      ? "Select specific topic..."
                      : "No subtopics in this subject"
                    : "Select a subject first"}
                </option>
                {availableTopics.map((tp) => (
                  <option key={tp.id} value={tp.id}>
                    {tp.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. CHAT LAYOUT: THREADS SIDEBAR + ACTIVE CONVERSATION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* THREADS SIDEBAR (DESKTOP OR TOGGLE MOBILE) */}
        <div
          className={cn(
            "lg:col-span-3 space-y-3",
            isSidebarOpen ? "block" : "hidden lg:block"
          )}
        >
          <Card className="h-[620px] flex flex-col">
            <CardHeader className="p-3 border-b border-border flex flex-row items-center justify-between">
              <span className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-primary" /> Conversations
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={handleNewChat}
                className="h-7 text-xs gap-1 px-2.5"
              >
                <Plus className="w-3.5 h-3.5" /> New
              </Button>
            </CardHeader>

            <CardContent className="p-2 flex-1 overflow-y-auto space-y-1">
              {threads.map((th) => {
                const isActive = th.id === activeThreadId;
                return (
                  <div
                    key={th.id}
                    onClick={() => {
                      setActiveThreadId(th.id);
                      setIsSidebarOpen(false);
                    }}
                    className={cn(
                      "p-2.5 rounded-xl text-xs transition cursor-pointer flex items-center justify-between group",
                      isActive
                        ? "bg-primary text-white font-medium shadow-xs"
                        : "hover:bg-background-secondary text-text-secondary hover:text-text-primary"
                    )}
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="truncate font-medium">{th.title}</p>
                      <p
                        className={cn(
                          "text-[10px] truncate",
                          isActive ? "text-white/80" : "text-text-muted"
                        )}
                      >
                        {th.topicName || th.subjectName || "General guidance"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleDeleteThread(th.id, e)}
                      title="Delete conversation"
                      className={cn(
                        "opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-black/10 transition",
                        isActive ? "text-white" : "text-text-muted hover:text-rose-500"
                      )}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* ACTIVE CONVERSATION PANE */}
        <div className="lg:col-span-9 space-y-4">
          <Card className="flex flex-col h-[620px] overflow-hidden">
            {/* Conversation Header */}
            <div className="p-3 sm:px-5 border-b border-border flex items-center justify-between bg-card text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="lg:hidden p-1.5 rounded-lg border border-border text-text-muted"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>

                {isEditingTitle ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={editingTitleText}
                      onChange={(e) => setEditingTitleText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSaveTitle()}
                      className="px-2 py-0.5 rounded border border-primary bg-card text-xs text-text-primary"
                      autoFocus
                    />
                    <Button size="sm" variant="ghost" onClick={handleSaveTitle} className="h-6 px-1.5 text-[11px]">
                      Save
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-semibold text-text-primary truncate">
                      {activeThread.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingTitleText(activeThread.title);
                        setIsEditingTitle(true);
                      }}
                      className="text-text-muted hover:text-text-primary p-0.5"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleClearCurrentChat}
                  className="h-7 text-xs text-text-muted hover:text-rose-500 gap-1 px-2"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleNewChat}
                  className="h-7 text-xs gap-1 px-2.5"
                >
                  <Plus className="w-3.5 h-3.5" /> New Chat
                </Button>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "flex gap-3 max-w-[85%] group",
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

                  <div className="space-y-1">
                    <div
                      className={cn(
                        "rounded-2xl p-4 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap shadow-xs relative",
                        msg.role === "assistant"
                          ? "bg-card border border-border text-text-primary"
                          : "bg-primary text-white"
                      )}
                    >
                      {msg.text}

                      <div
                        className={cn(
                          "text-[10px] mt-2 flex items-center justify-between gap-4 opacity-75",
                          msg.role === "assistant" ? "text-text-muted" : "text-white/80"
                        )}
                      >
                        <span>{msg.timestamp}</span>

                        {msg.role === "assistant" && (
                          <button
                            type="button"
                            onClick={() => handleCopy(msg.text, idx)}
                            className="flex items-center gap-1 hover:text-text-primary transition"
                            title="Copy reply"
                          >
                            {copiedIndex === idx ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-500" />
                                <span className="text-[9px] text-emerald-500">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span className="text-[9px]">Copy</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 mr-auto max-w-[85%]">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-white shrink-0">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="rounded-2xl bg-card border border-border p-4 text-xs text-text-muted shadow-xs flex items-center gap-2.5">
                    <Spinner size="sm" color="primary" label="Thinking..." />
                    <span>
                      Synthesizing study guidance grounded in your preparation history...
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts Bar */}
            <div className="px-4 py-2 border-t border-border/70 bg-background-secondary/30 flex items-center justify-between gap-2 overflow-x-auto">
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-bold text-text-muted uppercase shrink-0">
                  Suggestions:
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

              {messages.length > 1 && (
                <button
                  type="button"
                  onClick={handleRetryLast}
                  disabled={isLoading}
                  title="Retry last query"
                  className="text-xs text-text-muted hover:text-text-primary flex items-center gap-1 px-2 py-1 rounded border border-border bg-card shrink-0"
                >
                  <RotateCcw className="w-3 h-3" /> Retry
                </button>
              )}
            </div>

            {/* Input Form Bar */}
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
                  placeholder={
                    currentTopic
                      ? `Ask questions about ${currentTopic.title}...`
                      : "Ask your study assistant a preparation doubt or syllabus concept..."
                  }
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
      </div>
    </div>
  );
}
