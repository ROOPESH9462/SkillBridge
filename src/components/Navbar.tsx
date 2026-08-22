"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, Search, UserCheck, ShieldCheck, BookOpen } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-emerald-500/10 bg-background/80 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-700 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 fill-slate-950 stroke-none" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-200 bg-clip-text text-transparent">
              SkillBridge
            </span>
            <span className="block text-[10px] uppercase font-semibold text-emerald-500/80 tracking-widest">
              Mentorship Platform
            </span>
          </div>
        </Link>

        {/* Global Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search skills, mentors (e.g. Next.js, System Design)..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-emerald-500/20 bg-emerald-950/10 focus:bg-emerald-950/20 dark:bg-dark-card focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-slate-500"
          />
        </div>

        {/* Nav Links & Controls */}
        <div className="flex items-center gap-3">
          <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
            <Link
              href="/#explore"
              className="px-3 py-2 rounded-lg hover:text-emerald-400 hover:bg-emerald-500/5 transition-colors flex items-center gap-1.5"
            >
              <UserCheck className="w-4 h-4 text-emerald-500" />
              Mentors
            </Link>
            <Link
              href="/#skills"
              className="px-3 py-2 rounded-lg hover:text-emerald-400 hover:bg-emerald-500/5 transition-colors flex items-center gap-1.5"
            >
              <BookOpen className="w-4 h-4 text-emerald-500" />
              Skill Goals
            </Link>
            <Link
              href="/dashboard"
              className="px-3 py-2 rounded-lg hover:text-emerald-400 hover:bg-emerald-500/5 transition-colors flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Dashboard
            </Link>
          </nav>

          <div className="h-5 w-[1px] bg-emerald-500/20 hidden lg:block" />

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Menu / Auth Controls */}
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
