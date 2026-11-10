"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  Trash2,
  Settings,
  Clock,
  RotateCcw,
  BookOpen,
  Award,
  Sparkles,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import type { StudentNotification, NotificationCategory } from "@/lib/types";
import {
  studentMarkNotificationReadAction,
  studentDeleteNotificationAction,
} from "@/app/actions/analytics";

interface NotificationsClientProps {
  notifications: StudentNotification[];
}

export default function NotificationsClient({
  notifications: initialNotifications,
}: NotificationsClientProps) {
  const [notifications, setNotifications] = useState<StudentNotification[]>(initialNotifications);
  const [filter, setFilter] = useState<string>("all");
  const [browserPermission, setBrowserPermission] = useState<string>(
    typeof window !== "undefined" && "Notification" in window
      ? Notification.permission
      : "default"
  );
  const [isRequestingBrowser, setIsRequestingBrowser] = useState(false);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.is_read;
    if (filter === "revisions") return n.category === "revision_due";
    if (filter === "exams") return n.category === "upcoming_exam" || n.category === "new_published_exam" || n.category === "mock_result_ready";
    return true;
  });

  const handleMarkAsRead = async (id: string) => {
    await studentMarkNotificationReadAction(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const handleMarkAllAsRead = async () => {
    await studentMarkNotificationReadAction();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const handleDelete = async (id: string) => {
    await studentDeleteNotificationAction(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Module 10: Browser Notification opt-in on explicit user click
  const handleEnableBrowserNotifications = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      alert("This browser does not support Web Notifications.");
      return;
    }

    setIsRequestingBrowser(true);
    try {
      const permission = await Notification.requestPermission();
      setBrowserPermission(permission);
      if (permission === "granted") {
        new Notification("PrepTrack Notifications Enabled!", {
          body: "You will now receive timely study task and revision alerts on your device.",
          icon: "/icon.png",
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRequestingBrowser(false);
    }
  };

  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case "revision_due":
        return <RotateCcw className="h-4 w-4 text-purple-600" />;
      case "upcoming_task":
      case "incomplete_task":
        return <Clock className="h-4 w-4 text-amber-600" />;
      case "upcoming_exam":
      case "new_published_exam":
      case "mock_result_ready":
        return <Award className="h-4 w-4 text-indigo-600" />;
      case "recommendation":
        return <Sparkles className="h-4 w-4 text-emerald-600" />;
      case "admin_announcement":
        return <ShieldAlert className="h-4 w-4 text-rose-600" />;
      default:
        return <Bell className="h-4 w-4 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Bell className="h-7 w-7 text-indigo-600" />
            Notification Center
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Real-time updates for spaced revisions, pending tasks, published mock examinations, and announcements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition"
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Mark all as read
            </button>
          )}

          <Link
            href="/student/notifications/settings"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition"
          >
            <Settings className="h-4 w-4 text-slate-500" />
            Preferences
          </Link>
        </div>
      </div>

      {/* Browser Notification Opt-In Banner (Module 10) */}
      {browserPermission !== "granted" && (
        <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-purple-50 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Enable Desktop & Mobile Notifications</h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Receive revision reminders and task alerts even when PrepTrack is in the background.
              </p>
            </div>
          </div>

          <button
            onClick={handleEnableBrowserNotifications}
            disabled={isRequestingBrowser}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition shrink-0"
          >
            {isRequestingBrowser ? "Requesting..." : "Enable Browser Alerts"}
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-1.5 rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setFilter("all")}
            className={`rounded-lg px-3 py-1.5 transition ${
              filter === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`rounded-lg px-3 py-1.5 transition ${
              filter === "unread" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setFilter("revisions")}
            className={`rounded-lg px-3 py-1.5 transition ${
              filter === "revisions" ? "bg-white text-purple-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Revisions
          </button>
          <button
            onClick={() => setFilter("exams")}
            className={`rounded-lg px-3 py-1.5 transition ${
              filter === "exams" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Mock Exams
          </button>
        </div>

        <span className="text-xs text-slate-500">
          {unreadCount} unread alert{unreadCount !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Notifications List */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        {filteredNotifications.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition ${
                  !notif.is_read ? "bg-indigo-50/30" : "hover:bg-slate-50/50"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                    {getCategoryIcon(notif.category)}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4
                        className={`text-sm ${
                          !notif.is_read ? "font-bold text-slate-900" : "font-medium text-slate-700"
                        }`}
                      >
                        {notif.title}
                      </h4>
                      {!notif.is_read && (
                        <span className="h-2 w-2 rounded-full bg-indigo-600" />
                      )}
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                      <span>{new Date(notif.created_at).toLocaleString()}</span>
                      {notif.link && (
                        <Link
                          href={notif.link}
                          className="font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                        >
                          Take action <ExternalLink className="h-3 w-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {!notif.is_read && (
                    <button
                      onClick={() => handleMarkAsRead(notif.id)}
                      title="Mark as read"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notif.id)}
                    title="Delete notification"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400">
            <Bell className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No notifications to display.</p>
            <p className="text-xs text-slate-500 mt-1">You are completely up to date!</p>
          </div>
        )}
      </div>
    </div>
  );
}
