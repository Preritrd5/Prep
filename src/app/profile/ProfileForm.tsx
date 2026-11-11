"use client";

import { Button, Badge } from "@/components/ui";
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
        <div className="flex items-center gap-2.5 rounded-lg border border-[var(--color-success-border)] bg-[var(--color-success-subtle)] p-3.5 text-xs text-[var(--color-success-text)]">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{state.message}</span>
        </div>
      )}

      {state?.error && (
        <div className="flex items-center gap-2.5 rounded-lg border border-[var(--color-danger-border)] bg-[var(--color-danger-subtle)] p-3.5 text-xs text-[var(--color-danger-text)]">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <div>
          <label
            htmlFor="fullName"
            className="block text-xs font-semibold text-text-primary mb-1.5"
          >
            Full Name
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-text-muted">
              <User className="h-4 w-4" />
            </div>
            <input
              id="fullName"
              name="fullName"
              type="text"
              defaultValue={profile.full_name || ""}
              required
              className="block w-full h-10 rounded-lg border border-border bg-input py-2 pl-10 pr-3.5 text-xs text-text-primary placeholder:text-text-muted shadow-xs transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
              placeholder="e.g. Ananya Sharma"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-xs font-semibold text-text-primary mb-1.5"
          >
            Email Address (Read-Only)
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-text-muted">
              <Mail className="h-4 w-4" />
            </div>
            <input
              id="email"
              type="email"
              disabled
              value={profile.email}
              className="block w-full h-10 rounded-lg border border-border bg-background-secondary py-2 pl-10 pr-3.5 text-xs text-text-muted shadow-xs cursor-not-allowed opacity-80"
            />
          </div>
          <p className="mt-1.5 text-xs text-text-muted">
            Email addresses are securely tied to your primary Supabase Authentication record.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-primary mb-1.5">
            Platform Authorization
          </label>
          <div className="flex items-center gap-2">
            <Badge variant="primary">
              <Shield className="h-3.5 w-3.5 mr-1" />
              <span>Personal Workspace Owner</span>
            </Badge>
          </div>
          <p className="mt-1.5 text-xs text-text-muted">
            Direct owner access to all examinations, question banks, AI study tools, and CBT mocks.
          </p>
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            className="rounded-lg"
            isLoading={isPending}
            rightIcon={<Save className="h-4 w-4" />}
          >
            Save Profile Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
