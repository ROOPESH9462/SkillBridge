"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, LogOut, ChevronDown, CheckCircle2, UserCheck, BookOpen, Search, UserPlus } from "lucide-react";
import { NotificationBell } from "./NotificationBell";

interface UserMenuProps {
  initialUser?: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string | null;
  } | null;
}

export function UserMenu({ initialUser }: UserMenuProps) {
  const router = useRouter();
  const [user, setUser] = useState(initialUser || null);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!initialUser) {
      fetch("/api/auth/me")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.user) {
            setUser(data.user);
          }
        })
        .catch(() => setUser(null));
    }
  }, [initialUser]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      router.push("/login");
      router.refresh();
    } catch (e) {
      console.error("Logout error", e);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="px-3.5 py-2 text-xs font-bold rounded-xl text-slate-300 hover:text-emerald-400 hover:bg-emerald-500/5 transition-colors"
        >
          Sign In
        </Link>
        <Link
          href="/register"
          className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 transition-all"
        >
          Get Started
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* In-App Notification Bell */}
      <NotificationBell />

      {/* User Avatar Menu */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2.5 p-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors"
        >
          <img
            src={user.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=User"}
            alt={user.name}
            className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-500/30 object-cover"
          />
          <div className="text-left hidden sm:block">
            <p className="text-xs font-bold text-slate-200 leading-tight">{user.name}</p>
            <span className="text-[10px] uppercase font-extrabold text-emerald-400">
              {user.role}
            </span>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-60 rounded-2xl glass-card border border-emerald-500/30 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
            <div className="p-3 border-b border-emerald-500/10">
              <p className="text-xs font-bold text-slate-200">{user.name}</p>
              <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
              <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-extrabold text-emerald-400">
                <CheckCircle2 className="w-3 h-3" />
                {user.role} Account
              </div>
            </div>

            {/* Role Interlinks */}
            <div className="py-1 space-y-0.5">
              {/* Learner Dashboard Link */}
              <Link
                href="/dashboard/learner"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-xl text-slate-200 hover:bg-emerald-500/10 hover:text-emerald-400 transition-colors"
              >
                <BookOpen className="w-4 h-4 text-emerald-500" />
                Learner Workspace
              </Link>

              {/* Mentor Dashboard Link (For Mentors & Admins) */}
              {(user.role === "MENTOR" || user.role === "ADMIN") && (
                <Link
                  href="/dashboard/mentor"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-xl text-slate-200 hover:bg-emerald-500/10 hover:text-emerald-400 transition-colors"
                >
                  <UserCheck className="w-4 h-4 text-emerald-500" />
                  Mentor Workspace
                </Link>
              )}

              {/* Admin Command Link (For Admins) */}
              {user.role === "ADMIN" && (
                <Link
                  href="/dashboard/admin"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-xl text-slate-200 hover:bg-emerald-500/10 hover:text-emerald-400 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Admin Command Center
                </Link>
              )}

              {/* Browse Directory Link */}
              <Link
                href="/mentors"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-xl text-slate-300 hover:bg-emerald-500/10 hover:text-emerald-400 transition-colors"
              >
                <Search className="w-4 h-4 text-emerald-500" />
                Explore Mentors Directory
              </Link>

              {/* Apply as Mentor Link (for Learners) */}
              {user.role === "LEARNER" && (
                <Link
                  href="/register"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-xl text-slate-300 hover:bg-emerald-500/10 hover:text-emerald-400 transition-colors"
                >
                  <UserPlus className="w-4 h-4 text-emerald-500" />
                  Apply to become a Mentor
                </Link>
              )}
            </div>

            <div className="pt-1 border-t border-emerald-500/10">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
