import React from "react";
import Link from "next/link";
import { getSessionUser } from "@/lib/session";
import { Sparkles, ArrowRight, ShieldCheck, Target, Quote, Heart } from "lucide-react";

export default async function HomePage() {
  const session = await getSessionUser();

  return (
    <div className="min-h-screen bg-background text-slate-100 flex flex-col justify-between">
      <div className="space-y-16 pb-16">
        {/* Top Header Navigation */}
        <header className="sticky top-0 z-50 w-full border-b border-emerald-500/10 bg-background/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-700 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 fill-slate-950 stroke-none" />
              </div>
              <div>
                <span className="text-xl font-black tracking-tight bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-200 bg-clip-text text-transparent">
                  SkillBridge
                </span>
                <span className="block text-[9px] uppercase font-bold text-emerald-500/80 tracking-widest">
                  Mentorship Platform
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-3">
              {session ? (
                <Link
                  href="/dashboard"
                  className="px-4 py-2 text-xs font-extrabold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-4 py-2 text-xs font-bold rounded-xl text-slate-300 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="px-5 py-2 text-xs font-extrabold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5"
                  >
                    Get Started
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative overflow-hidden pt-12 pb-16 border-b border-emerald-500/10 bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent">
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

        {/* Feature Cards Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl glass-card border border-emerald-500/20 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-100">Structured Milestone Roadmaps</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Track exact progress via interactive milestone checkable tasks. Progress updates dynamically based on completed milestone counts.
              </p>
            </div>

            <div className="p-6 rounded-3xl glass-card border border-emerald-500/20 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Sparkles className="w-5 h-5 fill-emerald-400" />
              </div>
              <h3 className="text-base font-bold text-slate-100">6-Factor Recommendation Engine</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Deterministic matching engine combining skill taxonomy (50%), proficiency gap (15%), experience (10%), rating (10%), availability (10%), and history (5%).
              </p>
            </div>

            <div className="p-6 rounded-3xl glass-card border border-emerald-500/20 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-100">Zero Double Bookings</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Booking reservations execute inside Prisma database transactions checking schedule overlap interval conditions.
              </p>
            </div>
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
