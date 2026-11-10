"use client";

import { useActionState } from "react";
import { updateProfileAction, type AuthActionResult } from "@/app/auth/actions";
import { User, Mail, Shield, CheckCircle2, AlertCircle, Save } from "lucide-react";
import type { Profile } from "@/lib/types";

interface ProfileFormProps {
  profile: Profile;
}

export default function ProfileForm({ profile }: ProfileFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateProfileAction,
    null as AuthActionResult | null
  );

  return (
    <div className="space-y-6">
      {state?.success && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{state.message}</span>
        </div>
      )}

      {state?.error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      <form action={formAction} className="space-y-5">
        <div>
          <label
            htmlFor="fullName"
            className="block text-sm font-medium text-slate-700"
          >
            Full Name
          </label>
          <div className="relative mt-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <User className="h-4 w-4" />
            </div>
            <input
              id="fullName"
              name="fullName"
              type="text"
              defaultValue={profile.full_name || ""}
              required
              className="block w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm text-slate-900 shadow-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-slate-700"
          >
            Email Address (Read-Only)
          </label>
          <div className="relative mt-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Mail className="h-4 w-4" />
            </div>
            <input
              id="email"
              type="email"
              disabled
              value={profile.email}
              className="block w-full rounded-lg border border-slate-200 bg-slate-100 py-2.5 pl-10 pr-3 text-sm text-slate-500 shadow-sm cursor-not-allowed"
            />
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Email addresses are tied to Supabase Auth authentication records.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Assigned Platform Role
          </label>
          <div className="mt-1 flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                profile.role === "admin"
                  ? "bg-purple-100 text-purple-700 border border-purple-200"
                  : "bg-indigo-50 text-indigo-700 border border-indigo-200"
              }`}
            >
              <Shield className="h-3.5 w-3.5" />
              {profile.role === "admin" ? "Platform Administrator" : "Enrolled Student"}
            </span>
          </div>
          <p className="mt-1.5 text-xs text-slate-500">
            Role elevation is protected by PostgreSQL triggers and Row Level Security.
            Students cannot change their role.
          </p>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? (
              "Saving Changes..."
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Profile
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
