import React from "react";
import Link from "next/link";
import { RegisterForm } from "@/components/RegisterForm";
import { Search, UserCheck, Target, LayoutDashboard, Sparkles, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const popularSkills = ["Next.js", "System Design", "Python", "AWS", "Docker", "Machine Learning"];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Top Welcome & Search Preview Section */}
      <div className="p-8 rounded-3xl glass-card border border-emerald-500/20 glow-green-sm space-y-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
              SkillBridge Account Portal
            </div>
            <h1 className="text-3xl font-black text-slate-100">
              Get Started with Verified Technical Mentorship
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              Register an account to explore verified mentors, create milestone skill roadmaps, and enter your dedicated role dashboard.
            </p>
          </div>

          {/* Quick Search Preview Input */}
          <div className="w-full lg:w-96 space-y-2">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Preview Directory Search
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                readOnly
                placeholder="Search skills, mentors (e.g. Next.js, System Design)..."
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-emerald-500/30 bg-dark-bg/90 text-slate-200 placeholder:text-slate-500 focus:outline-none cursor-pointer"
              />
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[10px] font-bold text-slate-400 self-center mr-1">Popular:</span>
              {popularSkills.map((skill) => (
                <span
                  key={skill}
                  className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid (Mentors, Skill Goals, Dashboard) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-emerald-500/10">
          <div className="p-4 rounded-2xl bg-dark-bg/60 border border-emerald-500/15 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Verified Mentors</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Connect 1-on-1 with industry specialists in Next.js, System Design & Cloud Architecture.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-dark-bg/60 border border-emerald-500/15 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Skill Goals & Roadmaps</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Track exact progress via interactive checkable milestones with dynamic completion calculation.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-dark-bg/60 border border-emerald-500/15 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Role Dashboards</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Direct entry to dedicated Learner, Mentor, or Admin command centers upon login/registration.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Registration Form Block */}
      <div className="flex items-center justify-center">
        <RegisterForm />
      </div>
    </div>
  );
}
