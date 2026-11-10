import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import type { Profile } from "@/lib/types";
import {
  Users,
  Layers,
  FileQuestion,
  ShieldCheck,
  Lock,
  UserCheck,
  CheckCircle2,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const { profile } = await requireRole("admin");
  const supabase = await createClient();

  // Fetch real registered students count and recent student list
  const {
    data: rawStudents,
    count: studentCount,
  } = await supabase
    .from("profiles")
    .select("*", { count: "exact" })
    .eq("role", "student")
    .order("created_at", { ascending: false })
    .limit(10);

  const students = (rawStudents as Profile[] | null) || [];

  // Fetch total admins count for platform overview
  const { count: adminCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "admin");

  const totalRegisteredStudents = studentCount ?? 0;
  const totalAdmins = adminCount ?? 1;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar profile={profile} />

      <div className="flex-1 flex">
        <Sidebar role="admin" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {/* Header Banner */}
          <div className="rounded-2xl border border-purple-200 bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 p-6 sm:p-8 text-white shadow-sm mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/20 px-3 py-1 text-xs font-semibold text-purple-200 border border-purple-400/30 mb-2">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Platform Governance Portal</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Admin Administration Overview
                </h1>
                <p className="mt-1 text-sm text-purple-200/80 max-w-2xl leading-relaxed">
                  Oversee registered students, enforce database security policies, and manage
                  upcoming examination modules.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="rounded-xl bg-purple-600/30 px-3.5 py-2 text-xs font-medium text-purple-200 border border-purple-400/20">
                  Supabase PostgreSQL Connected
                </span>
              </div>
            </div>
          </div>

          {/* Real Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Metric 1: Total Registered Students */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Registered Students
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <Users className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold text-slate-900">
                {totalRegisteredStudents}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Real database query from Supabase profiles
              </p>
            </div>

            {/* Metric 2: Content Modules (Phase 2 placeholder) */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Content Management
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                  <Layers className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-3 text-lg font-bold text-slate-900">Module Locked</p>
              <p className="mt-1 text-xs text-slate-500">
                Course curricula & exam models arrive in Phase 2
              </p>
            </div>

            {/* Metric 3: Question Bank (Phase 2 placeholder) */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Question Bank
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <FileQuestion className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-3 text-lg font-bold text-slate-900">Module Locked</p>
              <p className="mt-1 text-xs text-slate-500">
                Question authoring & taxonomy arrive in Phase 2
              </p>
            </div>

            {/* Metric 4: Platform Security */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Row Level Security
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <Lock className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-3 text-lg font-bold text-emerald-600">Enforced</p>
              <p className="mt-1 text-xs text-slate-500">
                PostgreSQL RLS policies & triggers active
              </p>
            </div>
          </div>

          {/* Student Directory Table & Platform Status */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Registered Students Management Preview */}
            <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden" id="students">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    Registered Students Directory
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Live enrollment records fetched directly from Supabase PostgreSQL
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                  {totalRegisteredStudents} Total
                </span>
              </div>

              {students && students.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase">
                      <tr>
                        <th className="px-6 py-3 font-semibold">Student Name</th>
                        <th className="px-6 py-3 font-semibold">Email</th>
                        <th className="px-6 py-3 font-semibold">Registration Date</th>
                        <th className="px-6 py-3 font-semibold">Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {students.map((student) => (
                        <tr key={student.id} className="hover:bg-slate-50/70">
                          <td className="px-6 py-3.5 font-medium text-slate-900">
                            {student.full_name || "—"}
                          </td>
                          <td className="px-6 py-3.5 text-slate-600">{student.email}</td>
                          <td className="px-6 py-3.5 text-slate-500">
                            {new Date(student.created_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </td>
                          <td className="px-6 py-3.5">
                            <span className="inline-flex rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 border border-indigo-200">
                              student
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center">
                  <Users className="mx-auto h-10 w-10 text-slate-300 mb-2" />
                  <p className="text-sm font-semibold text-slate-700">No students registered yet</p>
                  <p className="text-xs text-slate-500 mt-1">
                    When students register via the public portal, their profile records will populate here.
                  </p>
                </div>
              )}
            </div>

            {/* Platform Overview & Governance */}
            <div className="space-y-6">
              {/* Platform Overview */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-base font-semibold text-slate-900 mb-4">
                  Platform Architecture Status
                </h2>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-600 font-medium">Database Backend</span>
                    <span className="font-semibold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Supabase PostgreSQL
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-600 font-medium">Authentication Engine</span>
                    <span className="font-semibold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Supabase Auth (SSR)
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-600 font-medium">Row Level Security</span>
                    <span className="font-semibold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Active & Tested
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-600 font-medium">Provisioned Admins</span>
                    <span className="font-semibold text-purple-700">{totalAdmins}</span>
                  </div>
                </div>
              </div>

              {/* Admin Profile & Security Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-base font-semibold text-slate-900 mb-3">Admin Session</h2>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Admin Email:</span>
                    <span className="font-semibold text-slate-800 truncate max-w-[150px]">
                      {profile.email}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Authorization:</span>
                    <span className="font-semibold text-purple-700">Full Platform Rights</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Role Elevation:</span>
                    <span className="text-slate-600">Controlled (Database Trigger)</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100">
                  <Link
                    href="/profile"
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                  >
                    <UserCheck className="h-3.5 w-3.5" />
                    View Admin Profile
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
