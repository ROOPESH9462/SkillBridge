import React from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { db } from "@/lib/db";
import { Clock, Calendar, CheckCircle2, Star } from "lucide-react";
import { SessionCard } from "@/components/SessionCard";
import { MentorAvailabilityManager } from "@/components/MentorAvailabilityManager";

export default async function MentorDashboardPage() {
  const session = await getSessionUser();

  if (!session) {
    redirect("/login");
  }

  // Strict Role Redirection: If user is LEARNER, redirect directly to learner dashboard
  if (session.role === "LEARNER") {
    redirect("/dashboard/learner");
  }

  // Fetch Mentor Profile, Availability, and Sessions
  const mentorData = await db.user.findUnique({
    where: { id: session.userId },
    include: {
      mentorProfile: true,
      availability: { orderBy: { dayOfWeek: "asc" } },
      mentorSessions: {
        include: {
          learner: true,
          skill: true,
          mentor: { include: { mentorProfile: true } },
        },
        orderBy: { scheduledStart: "desc" },
      },
    },
  });

  const profile = mentorData?.mentorProfile;
  const sessions = mentorData?.mentorSessions || [];

  const pendingRequests = sessions.filter((s) => s.status === "REQUESTED");
  const upcomingConfirmed = sessions.filter((s) => s.status === "CONFIRMED");
  const completedSessions = sessions.filter((s) => s.status === "COMPLETED");

  const formattedSessions = sessions.map((s) => ({
    id: s.id,
    mentorId: s.mentorId,
    learnerId: s.learnerId,
    topic: s.topic,
    status: s.status,
    scheduledStart: s.scheduledStart.toISOString(),
    scheduledEnd: s.scheduledEnd.toISOString(),
    durationMinutes: s.durationMinutes,
    meetingLink: s.meetingLink,
    skill: { name: s.skill.name },
    mentor: {
      id: s.mentor.id,
      name: s.mentor.name,
      avatar: s.mentor.avatar,
      mentorProfile: s.mentor.mentorProfile
        ? { professionalTitle: s.mentor.mentorProfile.professionalTitle }
        : null,
    },
    learner: {
      id: s.learner.id,
      name: s.learner.name,
      avatar: s.learner.avatar,
      email: s.learner.email,
    },
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Mentor Header */}
      <div className="p-6 rounded-3xl glass-card border border-emerald-500/20 glow-green-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img
            src={session.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Mentor"}
            alt={session.name}
            className="w-16 h-16 rounded-2xl bg-emerald-950 border border-emerald-500/30 object-cover"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-100">{session.name}</h1>
              <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-extrabold text-[10px] uppercase flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Verified Mentor
              </span>
            </div>
            <p className="text-xs font-semibold text-emerald-400 mt-0.5">
              {profile?.professionalTitle || "Technical Specialist"}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Manage booking requests, session schedules, and weekly availability.
            </p>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-card border border-emerald-500/20">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase">Pending Requests</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-2xl font-extrabold text-amber-400">{pendingRequests.length}</span>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-emerald-500/20">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase">Upcoming Sessions</span>
            <Calendar className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-extrabold text-emerald-400">{upcomingConfirmed.length}</span>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-emerald-500/20">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-extrabold text-slate-100">{completedSessions.length}</span>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-emerald-500/20">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase">Average Rating</span>
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          </div>
          <span className="text-2xl font-extrabold text-slate-100">
            {profile?.overallRating.toFixed(2) || "5.00"}
          </span>
        </div>
      </div>

      {/* Recurring Weekly Availability Management */}
      <MentorAvailabilityManager
        initialAvailability={mentorData?.availability.map((a) => ({
          id: a.id,
          dayOfWeek: a.dayOfWeek,
          startTime: a.startTime,
          endTime: a.endTime,
        })) || []}
      />

      {/* Mentorship Sessions Roster */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-400" />
          Mentorship Sessions & Requests ({formattedSessions.length})
        </h2>

        {formattedSessions.length === 0 ? (
          <div className="p-8 text-center glass-card rounded-2xl border border-emerald-500/10 text-xs text-slate-400">
            No session requests received yet. Ensure your weekly availability windows are configured!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {formattedSessions.map((s) => (
              <SessionCard
                key={s.id}
                session={s}
                currentUserId={session.userId}
                userRole={session.role}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
