import React from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { db } from "@/lib/db";
import { Calendar, BookOpen, Clock, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";
import { GoalList } from "@/components/GoalList";
import { MentorApplicationForm } from "@/components/MentorApplicationForm";

export default async function LearnerDashboardPage() {
  const session = await getSessionUser();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "LEARNER" && session.role !== "ADMIN") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md p-8 rounded-3xl glass-card border border-rose-500/30 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-100">403 — Access Forbidden</h1>
          <p className="text-xs text-slate-400">
            This dashboard is restricted to Learner accounts. Your role is{" "}
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

  // Fetch Learner Sessions & Mentor Application Status
  const learnerData = await db.user.findUnique({
    where: { id: session.userId },
    include: {
      applications: { orderBy: { submittedAt: "desc" }, take: 1 },
      learnerSessions: {
        include: {
          mentor: { include: { mentorProfile: true } },
          skill: true,
        },
        orderBy: { scheduledStart: "desc" },
      },
    },
  });

  const latestApp = learnerData?.applications[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Dashboard Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl glass-card border border-emerald-500/20 glow-green-sm">
        <div className="flex items-center gap-4">
          <img
            src={session.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Learner"}
            alt={session.name}
            className="w-16 h-16 rounded-2xl bg-emerald-950 border border-emerald-500/30 object-cover"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-100">{session.name}</h1>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-extrabold text-[10px] uppercase">
                Learner Dashboard
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Track your active skill goals, milestone progress, and mentor applications.
            </p>
          </div>
        </div>

        <Link
          href="/mentors"
          className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all"
        >
          Explore Mentor Directory
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Interactive Goal List & Mentor Application */}
        <div className="lg:col-span-2 space-y-10">
          {/* Live Skill Goals & Milestones Component */}
          <GoalList />

          {/* Mentor Application Section */}
          <div className="pt-6 border-t border-emerald-500/10 space-y-4">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-400" />
              Mentor Application Status
            </h2>

            {latestApp?.status === "PENDING" ? (
              <div className="p-6 rounded-2xl glass-card border border-amber-500/30 bg-amber-500/5 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <Clock className="w-4 h-4" />
                  Application Pending Admin Verification
                </div>
                <p className="text-xs text-slate-300">
                  Your application for <strong>{latestApp.professionalTitle}</strong> ({latestApp.yearsExperience} yrs exp) was submitted on {new Date(latestApp.submittedAt).toLocaleDateString()} and is under admin review.
                </p>
              </div>
            ) : latestApp?.status === "VERIFIED" ? (
              <div className="p-6 rounded-2xl glass-card border border-emerald-500/30 bg-emerald-500/5 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <ShieldCheck className="w-4 h-4" />
                  Application Approved! You are a Verified Mentor
                </div>
                <p className="text-xs text-slate-300">
                  Your mentor profile is live in the directory. Visit your Mentor Dashboard to manage sessions!
                </p>
                <Link
                  href="/dashboard/mentor"
                  className="inline-block px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
                >
                  Go to Mentor Dashboard
                </Link>
              </div>
            ) : (
              <MentorApplicationForm />
            )}
          </div>
        </div>

        {/* Right Column: Sessions Overview */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            Your Booked Sessions
          </h2>

          {!learnerData?.learnerSessions || learnerData.learnerSessions.length === 0 ? (
            <div className="p-6 text-center glass-card rounded-2xl border border-emerald-500/10 text-xs text-slate-400">
              No sessions scheduled yet. Browse mentors to book a 1-on-1 session!
            </div>
          ) : (
            <div className="space-y-3">
              {learnerData.learnerSessions.map((session) => (
                <div
                  key={session.id}
                  className="p-4 rounded-2xl glass-card border border-emerald-500/20 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase">
                      {session.status}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(session.scheduledStart).toLocaleDateString()}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-100 line-clamp-1">
                    {session.topic}
                  </h4>

                  <div className="flex items-center gap-2 pt-2 border-t border-emerald-500/10">
                    <img
                      src={session.mentor.avatar || ""}
                      alt={session.mentor.name}
                      className="w-6 h-6 rounded-lg bg-emerald-950 object-cover"
                    />
                    <div className="text-[11px]">
                      <span className="font-semibold text-slate-200">{session.mentor.name}</span>
                      <span className="block text-[9px] text-slate-400">
                        {session.mentor.mentorProfile?.professionalTitle}
                      </span>
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
