import React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, Target, Quote, Heart, Lock, CalendarCheck, Bell, Star, Cpu, Layers } from "lucide-react";

export default async function HomePage() {
  const platformModules = [
    {
      icon: Lock,
      title: "Authentication & Role-Based Access (RBAC)",
      tag: "Security Module",
      description:
        "Secure HTTP-only JWT sessions, bcrypt password hashing, and role authorization for Learner, Mentor, and Admin portals.",
      highlights: ["HMAC SHA-256 JWT Cookies", "Learner / Mentor / Admin RBAC", "Server-Side Authorization Checks"],
    },
    {
      icon: Target,
      title: "Structured Skill Goals & Milestone Roadmaps",
      tag: "Learning Module",
      description:
        "Goal-oriented milestone progress tracking for technical skills (Next.js, System Design, Python, AWS, Docker).",
      highlights: ["Dynamic Progress % Calculation", "Interactive Milestone Roadmaps", "Automatic Goal Completion"],
    },
    {
      icon: Cpu,
      title: "Explainable 6-Factor Recommendation Engine",
      tag: "Intelligence Module",
      description:
        "Deterministic rule-based algorithm matching learners with mentors using explainable multi-factor scoring (45% - 99%).",
      highlights: ["50% Skill Match Taxonomy", "15% Proficiency Gap Depth", "Interactive Audit Breakdown Modal"],
    },
    {
      icon: CalendarCheck,
      title: "Transactional Anti-Double-Booking Engine",
      tag: "Scheduling Module",
      description:
        "Dynamic 45-minute bookable slot generation with database transactions verifying interval overlap conditions.",
      highlights: ["Prisma Database Transactions", "Interval Overlap Rejection", "Recurring Weekly Availability"],
    },
    {
      icon: Bell,
      title: "Real-Time In-App Notification Center",
      tag: "Notification Module",
      description:
        "Live header notification bell displaying unread counter badges, notification drawer, and 1-click read status management.",
      highlights: ["Animated Unread Badges", "Event-Driven Status Sync", "Session & Verification Alerts"],
    },
    {
      icon: Star,
      title: "Verified Session Reviews & Rating System",
      tag: "Reputation Module",
      description:
        "Review submissions require strict ownership verification and session completion status. Recalculates ratings transactionally.",
      highlights: ["Learner Session Verification", "Transactional Rating Recalculation", "Verified Public Profile Badges"],
    },
  ];

  return (
    <div className="min-h-screen bg-background text-slate-100 flex flex-col justify-between">
      <div className="space-y-16 pb-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-16 pb-16 border-b border-emerald-500/10 bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent">
          <div className="max-w-5xl mx-auto px-4 text-center space-y-8 relative z-10">
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-extrabold glow-green-sm">
              <Sparkles className="w-4 h-4 text-emerald-400 fill-emerald-400" />
              <span>Intelligent Mentorship & Milestone-Based Skill Progress</span>
            </div>

            {/* Deep Motivational Quote Card */}
            <div className="max-w-3xl mx-auto p-6 sm:p-8 rounded-3xl glass-card border border-emerald-500/30 shadow-2xl relative glow-green">
              <Quote className="w-8 h-8 text-emerald-500/30 absolute top-4 left-4" />
              <p className="text-base sm:text-xl font-serif italic text-emerald-200 leading-relaxed relative z-10">
                "The capacity to learn is a gift; the ability to learn is a skill; the willingness to learn is a choice. Master your craft, bridge your skill gaps, and build the future with world-class mentors."
              </p>
              <div className="mt-3 text-xs font-bold uppercase tracking-wider text-emerald-400">
                — SkillBridge Core Philosophy
              </div>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
              Connect with verified engineers.{" "}
              <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-200 bg-clip-text text-transparent">
                Bridge your skill gaps.
              </span>
            </h1>

            {/* Detailed Platform Description */}
            <p className="text-sm sm:text-base text-slate-300 max-w-3xl mx-auto leading-relaxed">
              SkillBridge is an intelligent, full-stack mentorship platform engineered to transform technical career development. By pairing <strong>structured milestone roadmaps</strong> with a <strong>deterministic 6-factor recommendation engine</strong> and <strong>transactional anti-double-booking protection</strong>, SkillBridge connects ambitious learners with verified industry leaders.
            </p>

            {/* Main Action CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/register"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all transform hover:scale-105"
              >
                Get Started / Register Account
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl glass-card hover:border-emerald-500/50 text-slate-200 font-bold text-sm flex items-center justify-center gap-2 transition-all"
              >
                Sign In to Portal
              </Link>
            </div>
          </div>
        </section>

        {/* Platform Modules Showcase Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider border border-emerald-500/20">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              Core Platform Architecture
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-100">
              Integrated Technical Modules
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Explore the six core architectural modules powering the SkillBridge mentorship ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {platformModules.map((mod, idx) => {
              const IconComp = mod.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-3xl glass-card border border-emerald-500/20 hover:border-emerald-500/40 transition-all space-y-4 glow-green-sm flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                        <IconComp className="w-6 h-6" />
                      </div>
                      <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-[10px] uppercase">
                        {mod.tag}
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-slate-100">{mod.title}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">{mod.description}</p>
                  </div>

                  <div className="pt-3 border-t border-emerald-500/10 space-y-1.5">
                    {mod.highlights.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-[11px] font-semibold text-slate-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Footer Attribution (Created by Roopesh) */}
      <footer className="border-t border-emerald-500/20 bg-dark-bg/90 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 text-sm font-extrabold text-slate-200">
            <span>SkillBridge Mentorship Platform</span>
            <span className="text-emerald-400">•</span>
            <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 text-xs font-black tracking-wide flex items-center gap-1.5 glow-green-sm shadow-md shadow-emerald-500/10">
              <Heart className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
              Created by Roopesh
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
