import { requireAuth } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import ProfileForm from "./ProfileForm";
import { User, Calendar, ShieldCheck } from "lucide-react";

export default async function ProfilePage() {
  const { profile } = await requireAuth();

  const formattedDate = new Date(profile.created_at).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar profile={profile} />

      <div className="flex-1 flex">
        <Sidebar role={profile.role} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Account Profile</h1>
            <p className="text-sm text-slate-600 mt-1">
              Manage your personal details and view your account authorization status.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left summary card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm h-fit">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-2xl font-bold border-2 border-indigo-200">
                  {profile.full_name
                    ? profile.full_name.charAt(0).toUpperCase()
                    : profile.email.charAt(0).toUpperCase()}
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-900">
                  {profile.full_name || "PrepTrack User"}
                </h3>
                <p className="text-xs text-slate-500 break-all">{profile.email}</p>

                <div className="mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
                  Role: <span className="capitalize">{profile.role}</span>
                </div>

                <div className="mt-6 w-full border-t border-slate-100 pt-4 text-left">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Calendar className="h-4 w-4" />
                    <span>Member since {formattedDate}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right form card */}
            <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3 mb-4">
                Personal Information
              </h2>
              <ProfileForm profile={profile} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
