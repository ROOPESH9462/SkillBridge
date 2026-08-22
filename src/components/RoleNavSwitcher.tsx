"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserCheck, ShieldCheck, BookOpen, Sparkles, ArrowUpRight } from "lucide-react";

interface RoleNavSwitcherProps {
  currentRole: string; // "LEARNER" | "MENTOR" | "ADMIN"
}

export function RoleNavSwitcher({ currentRole }: RoleNavSwitcherProps) {
  const pathname = usePathname();

  const isLearnerActive = pathname.startsWith("/dashboard/learner");
  const isMentorActive = pathname.startsWith("/dashboard/mentor");
  const isAdminActive = pathname.startsWith("/dashboard/admin");

  return (
    <div className="w-full p-2.5 rounded-2xl glass-card border border-emerald-500/20 glow-green-sm flex flex-col sm:flex-row items-center justify-between gap-3">
      {/* Role Context Tag */}
      <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
        <Sparkles className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
        <span className="text-xs font-black text-slate-200 uppercase tracking-wider">
          SkillBridge Role Portals
        </span>
      </div>

      {/* Role Navigation Pills */}
      <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
        {/* Learner Portal Button */}
        <Link
          href="/dashboard/learner"
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            isLearnerActive
              ? "bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/20"
              : "bg-dark-bg/60 border border-emerald-500/20 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/40"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          Learner Workspace
        </Link>

        {/* Mentor Portal Button */}
        {(currentRole === "MENTOR" || currentRole === "ADMIN") ? (
          <Link
            href="/dashboard/mentor"
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              isMentorActive
                ? "bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/20"
                : "bg-dark-bg/60 border border-emerald-500/20 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/40"
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            Mentor Workspace
          </Link>
        ) : (
          <Link
            href="/register"
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-dark-bg/40 border border-emerald-500/10 text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1 whitespace-nowrap"
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-500/60" />
            Apply as Mentor
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        )}

        {/* Admin Portal Button */}
        {currentRole === "ADMIN" ? (
          <Link
            href="/dashboard/admin"
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              isAdminActive
                ? "bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/20"
                : "bg-dark-bg/60 border border-emerald-500/20 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/40"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Admin Command
          </Link>
        ) : (
          <Link
            href="/admin/login"
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-dark-bg/40 border border-emerald-500/10 text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1 whitespace-nowrap"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/60" />
            Admin Portal
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        )}
      </div>
    </div>
  );
}
