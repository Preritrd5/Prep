"use client";

import { Card, Badge, Button, PageHeader, EmptyState } from "@/components/ui";
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
  Inbox,
  Filter,
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
    if (filter === "exams")
      return (
        n.category === "upcoming_exam" ||
        n.category === "new_published_exam" ||
        n.category === "mock_result_ready"
      );
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
        return <RotateCcw className="h-4 w-4 text-secondary" />;
      case "upcoming_task":
      case "incomplete_task":
        return <Clock className="h-4 w-4 text-warning" />;
      case "upcoming_exam":
      case "new_published_exam":
      case "mock_result_ready":
        return <Award className="h-4 w-4 text-primary" />;
      case "recommendation":
        return <Sparkles className="h-4 w-4 text-accent" />;
      case "admin_announcement":
        return <ShieldAlert className="h-4 w-4 text-error" />;
      default:
        return <Bell className="h-4 w-4 text-text-muted" />;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notification Center"
        description="Real-time updates for spaced revisions, pending tasks, published mock examinations, and announcements."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Notifications" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                icon={<CheckCircle2 className="h-4 w-4 text-success" />}
                onClick={handleMarkAllAsRead}
              >
                Mark all as read
              </Button>
            )}
            <Link href="/notifications/settings">
              <Button
                variant="outline"
                size="sm"
                icon={<Settings className="h-4 w-4" />}
              >
                Preferences
              </Button>
            </Link>
          </div>
        }
      />

      {/* Browser Notification Opt-In Banner */}
      {browserPermission !== "granted" && (
        <Card variant="default" className="border-primary/20 bg-primary/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 shadow-sm">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-text-primary">
                  Enable Desktop & Mobile Notifications
                </h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  Receive revision alerts and study task reminders even when PrepTrack is in the background.
                </p>
              </div>
            </div>

            <Button
              variant="primary"
              size="sm"
              isLoading={isRequestingBrowser}
              onClick={handleEnableBrowserNotifications}
              className="shrink-0"
            >
              {isRequestingBrowser ? "Requesting..." : "Enable Browser Alerts"}
            </Button>
          </div>
        </Card>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-bg-secondary border border-border text-xs font-semibold">
          <button
            onClick={() => setFilter("all")}
            className={`rounded-lg px-3 py-1.5 transition ${
              filter === "all"
                ? "bg-card text-text-primary shadow-sm"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`rounded-lg px-3 py-1.5 transition ${
              filter === "unread"
                ? "bg-card text-primary shadow-sm font-bold"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setFilter("revisions")}
            className={`rounded-lg px-3 py-1.5 transition ${
              filter === "revisions"
                ? "bg-card text-secondary shadow-sm font-bold"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            Revisions
          </button>
          <button
            onClick={() => setFilter("exams")}
            className={`rounded-lg px-3 py-1.5 transition ${
              filter === "exams"
                ? "bg-card text-primary shadow-sm font-bold"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            Mock Exams
          </button>
        </div>

        <Badge variant={unreadCount > 0 ? "primary" : "neutral"} size="sm">
          {unreadCount} unread alert{unreadCount !== 1 ? "s" : ""}
        </Badge>
      </div>

      {/* Notifications List */}
      <Card variant="default" padding="none">
        {filteredNotifications.length > 0 ? (
          <div className="divide-y divide-border/60">
            {filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors ${
                  !notif.is_read
                    ? "bg-primary/5 hover:bg-primary/10"
                    : "hover:bg-bg-secondary/40"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="h-9 w-9 rounded-xl bg-bg-secondary border border-border flex items-center justify-center shrink-0 mt-0.5">
                    {getCategoryIcon(notif.category)}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4
                        className={`text-sm ${
                          !notif.is_read
                            ? "font-bold text-text-primary"
                            : "font-medium text-text-secondary"
                        }`}
                      >
                        {notif.title}
                      </h4>
                      {!notif.is_read && (
                        <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                      )}
                    </div>

                    <p className="text-xs text-text-secondary leading-relaxed">
                      {notif.message}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-text-muted pt-1">
                      <span>{new Date(notif.created_at).toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}</span>
                      {notif.link && (
                        <Link
                          href={notif.link}
                          className="font-semibold text-primary hover:text-primary-hover flex items-center gap-1"
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
                      className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-bg-secondary transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notif.id)}
                    title="Delete notification"
                    className="p-1.5 rounded-lg text-text-muted hover:text-error hover:bg-bg-secondary transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No notifications to display"
            description="You are completely up to date with your revisions and tasks!"
            icon={<Inbox className="h-10 w-10 text-text-muted" />}
          />
        )}
      </Card>
    </div>
  );
}
