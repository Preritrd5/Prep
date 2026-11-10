import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sweepExpiredExamAttempts } from "@/app/actions/exams-online";

export async function POST(request: Request) {
  // 1. Authorization: Verify bearer token against process.env.CRON_SECRET
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET || "preptrack-internal-cron-key";

  if (authHeader !== `Bearer ${cronSecret}` && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminClient = createAdminClient();
  const startTime = Date.now();
  let recordsProcessed = 0;
  const details: Record<string, any> = { created: [] };

  try {
    const todayStr = new Date().toISOString().split("T")[0];

    // 2. Fetch all active students with notification preferences
    const { data: students } = await adminClient
      .from("profiles")
      .select("id, email, full_name")
      .eq("role", "student");

    for (const student of students || []) {
      // Check preferences
      const { data: prefs } = await adminClient
        .from("student_notification_preferences")
        .select("*")
        .eq("student_id", student.id)
        .maybeSingle();

      // Check quiet hours if enabled
      if (prefs?.quiet_hours_enabled && prefs.quiet_hours_start && prefs.quiet_hours_end) {
        const now = new Date();
        const currentHoursMinutes = now.toTimeString().slice(0, 5);
        if (
          currentHoursMinutes >= prefs.quiet_hours_start ||
          currentHoursMinutes <= prefs.quiet_hours_end
        ) {
          // Skip during quiet hours
          continue;
        }
      }

      // Check 1: Revisions Due Today (Module 9)
      if (prefs?.revisions_due !== false) {
        const { data: dueRevs } = await adminClient
          .from("revision_schedules")
          .select("id, topic_id, topics(title)")
          .eq("student_id", student.id)
          .eq("scheduled_date", todayStr)
          .eq("is_completed", false);

        for (const rev of dueRevs || []) {
          // Idempotency check: did we already notify today for this revision?
          const { data: existing } = await adminClient
            .from("student_notifications")
            .select("id")
            .eq("student_id", student.id)
            .eq("category", "revision_due")
            .eq("entity_id", rev.id)
            .gte("created_at", `${todayStr}T00:00:00.000Z`)
            .maybeSingle();

          if (!existing) {
            await adminClient.from("student_notifications").insert({
              student_id: student.id,
              category: "revision_due",
              title: "Revision Scheduled for Today",
              message: `You have a scheduled spaced review for "${(rev as any).topics?.title || "Topic"}".`,
              link: "/student/revisions",
              entity_type: "revision_schedule",
              entity_id: rev.id,
            });
            recordsProcessed++;
            details.created.push(`Revision due for student ${student.id}`);
          }
        }
      }

      // Check 2: Incomplete Study Tasks Today
      if (prefs?.incomplete_tasks !== false) {
        const { data: dueTasks } = await adminClient
          .from("study_tasks")
          .select("id, title")
          .eq("student_id", student.id)
          .eq("scheduled_date", todayStr)
          .neq("status", "Completed");

        if (dueTasks && dueTasks.length > 0) {
          const { data: existing } = await adminClient
            .from("student_notifications")
            .select("id")
            .eq("student_id", student.id)
            .eq("category", "incomplete_task")
            .gte("created_at", `${todayStr}T00:00:00.000Z`)
            .maybeSingle();

          if (!existing) {
            await adminClient.from("student_notifications").insert({
              student_id: student.id,
              category: "incomplete_task",
              title: "Daily Tasks Pending",
              message: `You have ${dueTasks.length} study tasks scheduled for today pending completion.`,
              link: "/student/tasks",
              entity_type: "study_tasks_batch",
              entity_id: todayStr,
            });
            recordsProcessed++;
            details.created.push(`Incomplete tasks for student ${student.id}`);
          }
        }
      }

      // Check 3: Published Mock Tests Newly Available
      if (prefs?.new_published_exams !== false) {
        const { data: publishedMocks } = await adminClient
          .from("exam_templates")
          .select("id, title")
          .eq("status", "Published")
          .order("created_at", { ascending: false })
          .limit(1);

        if (publishedMocks && publishedMocks.length > 0) {
          const mock = publishedMocks[0];
          const { data: existing } = await adminClient
            .from("student_notifications")
            .select("id")
            .eq("student_id", student.id)
            .eq("category", "new_published_exam")
            .eq("entity_id", mock.id)
            .maybeSingle();

          if (!existing) {
            await adminClient.from("student_notifications").insert({
              student_id: student.id,
              category: "new_published_exam",
              title: "New Mock Examination Available",
              message: `New mock examination "${mock.title}" has been published. Benchmark your readiness!`,
              link: `/student/exams/online`,
              entity_type: "exam_template",
              entity_id: mock.id,
            });
            recordsProcessed++;
            details.created.push(`Mock exam alert for student ${student.id}`);
          }
        }
      }
    }

    // 3. Background Sweep: Finalize any expired exam attempts (students who closed browser/never returned)
    const sweptExamsCount = await sweepExpiredExamAttempts();
    details.expiredExamsAutoSubmitted = sweptExamsCount;
    recordsProcessed += sweptExamsCount;

    // 4. Log execution into reminder_job_runs
    await adminClient.from("reminder_job_runs").insert({
      job_type: "DAILY_REMINDER_BATCH",
      status: "Success",
      records_processed: recordsProcessed,
      details: { ...details, duration_ms: Date.now() - startTime },
    });

    return NextResponse.json({
      success: true,
      recordsProcessed,
      durationMs: Date.now() - startTime,
    });
  } catch (err: any) {
    console.error("Reminder batch failed:", err);

    await adminClient.from("reminder_job_runs").insert({
      job_type: "DAILY_REMINDER_BATCH",
      status: "Failed",
      records_processed: recordsProcessed,
      details: { error: err.message, duration_ms: Date.now() - startTime },
    });

    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
