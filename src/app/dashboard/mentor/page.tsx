import React from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { db } from "@/lib/db";
import { CheckCircle2, ShieldCheck, Clock, Calendar, BookOpen, User, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function MentorDashboardPage() {
  const session = await getSessionUser();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "MENTOR" && session.role !== "ADMIN") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md p-8 rounded-3xl glass-card border border-rose-500/30 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-100">403 — Access Forbidden</h1>
          <p className="text-xs text-slate-400">
            This dashboard is restricted to Mentor accounts. Your role is{" "}
            <span className="font-bold text-emerald-400">{session.role}</span>.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
          >
            Go to Your Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Fetch Mentor Profile & Sessions
  const mentorData = await db.user.findUnique({
    where: { id: session.userId },
    include: {
      mentorProfile: true,
      userSkills: { include: { skill: true } },
      availability: true,
      mentorSessions: {
        include: { learner: true, skill: true },
        orderBy: { scheduledStart: "desc" },
      },
    },
  });

  const profile = mentorData?.mentorProfile;
  const isVerified = profile?.verificationStatus === "VERIFIED";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Mentor Profile Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl glass-card border border-emerald-500/20 glow-green-sm">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={session.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Mentor"}
              alt={session.name}
              className="w-16 h-16 rounded-2xl bg-emerald-950 border border-emerald-500/30 object-cover"
            />
            {isVerified && (
              <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-emerald-500 text-slate-950">
                <CheckCircle2 className="w-4 h-4 fill-emerald-500 stroke-slate-950" />
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-100">{session.name}</h1>
              <span className={`px-2.5 py-0.5 rounded border text-[10px] font-extrabold uppercase ${
                isVerified
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-amber-500/10 border-amber-500/30 text-amber-400"
              }`}>
                {isVerified ? "✓ Verified Mentor" : "Pending Verification"}
              </span>
            </div>
            <p className="text-xs font-semibold text-emerald-400 mt-0.5">
              {profile?.professionalTitle || "Technical Specialist"}
            </p>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              <span>{profile?.yearsExperience || 1} years experience</span>
              <span>•</span>
              <span>⭐ {profile?.overallRating.toFixed(2) || "5.0"} Rating</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs hover:bg-emerald-500/20 transition-all">
            Edit Availability
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Teaching Skills & Availability */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl glass-card border border-emerald-500/20 space-y-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              Teaching Skills & Expertise
            </h3>

            <div className="flex flex-wrap gap-2">
              {mentorData?.userSkills.map((us) => (
                <div
                  key={us.id}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-300 flex items-center gap-1.5"
                >
                  <span>{us.skill.name}</span>
                  <span className="text-[9px] uppercase font-bold px-1 rounded bg-emerald-500/20 text-emerald-300">
                    {us.proficiency}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl glass-card border border-emerald-500/20 space-y-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              Weekly Recurring Availability
            </h3>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/10 flex items-center justify-between">
                <span>Mondays</span>
                <span className="font-bold text-emerald-400">10:00 AM – 2:00 PM</span>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/10 flex items-center justify-between">
                <span>Wednesdays</span>
                <span className="font-bold text-emerald-400">10:00 AM – 2:00 PM</span>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/10 flex items-center justify-between">
                <span>Fridays</span>
                <span className="font-bold text-emerald-400">10:00 AM – 2:00 PM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Mentorship Requests & Schedule */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            Mentorship Requests & Schedule
          </h2>

          {!mentorData?.mentorSessions || mentorData.mentorSessions.length === 0 ? (
            <div className="p-8 text-center glass-card rounded-2xl border border-emerald-500/10 text-xs text-slate-400">
              No session requests received yet. Verified profile is listed in the mentor directory!
            </div>
          ) : (
            <div className="space-y-4">
              {mentorData.mentorSessions.map((session) => (
                <div key={session.id} className="p-6 rounded-2xl glass-card border border-emerald-500/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase">
                      {session.status}
                    </span>
                    <span className="text-xs text-slate-400">
                      Scheduled: {new Date(session.scheduledStart).toLocaleDateString()}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-400">
                      Topic: {session.skill.name}
                    </span>
                    <h3 className="text-sm font-bold text-slate-100 mt-0.5">{session.topic}</h3>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-emerald-500/10">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={session.learner.avatar || ""}
                        alt={session.learner.name}
                        className="w-8 h-8 rounded-lg bg-emerald-950 object-cover"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-200">{session.learner.name}</span>
                        <span className="block text-[10px] text-slate-400">{session.learner.email}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-all">
                        Approve
                      </button>
                      <button className="px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 font-bold text-xs hover:bg-rose-500/20 transition-all">
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
