import { Card, Badge, PageHeader } from "@/components/ui";
import { requireAuth } from "@/lib/auth";
import AppLayout from "@/components/layout/AppLayout";
import ProfileForm from "./ProfileForm";
import { Calendar, ShieldCheck } from "lucide-react";

export default async function ProfilePage() {
  const { profile } = await requireAuth();

  const formattedDate = new Date(profile.created_at).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <AppLayout profile={profile} maxWidth="5xl">
      <PageHeader
        title="Account Profile"
        description="Manage your personal details and view your account authorization credentials."
        breadcrumbs={[
          { label: "Dashboard", href: "/student/dashboard" },
          { label: "Profile" },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left summary card */}
        <Card className="p-6 h-fit">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[var(--color-primary-subtle)] text-primary font-heading text-2xl font-bold border-2 border-primary/25 shadow-xs">
              {profile.full_name
                ? profile.full_name.charAt(0).toUpperCase()
                : profile.email.charAt(0).toUpperCase()}
            </div>
            <h3 className="mt-4 font-heading text-lg font-bold text-text-primary">
              {profile.full_name || "PrepTrack Owner"}
            </h3>
            <p className="text-xs text-text-muted break-all mt-0.5">{profile.email}</p>

            <div className="mt-4">
              <Badge variant="primary">
                <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                <span>Personal Workspace Owner</span>
              </Badge>
            </div>

            <div className="mt-6 w-full border-t border-border pt-4 text-left">
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <Calendar className="h-4 w-4 text-text-secondary" />
                <span>Member since {formattedDate}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Right form card */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="border-b border-border pb-3 mb-6">
              <h2 className="font-heading text-base font-bold text-text-primary">
                Personal Information
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">
                Update your public display name and review account credentials.
              </p>
            </div>
            <ProfileForm profile={profile} />
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
