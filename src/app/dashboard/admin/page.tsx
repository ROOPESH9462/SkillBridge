import React from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { db } from "@/lib/db";
import { ShieldCheck, Users, UserCheck, Clock, Calendar, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const session = await getSessionUser();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "ADMIN") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md p-8 rounded-3xl glass-card border border-rose-500/30 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-100">403 — Admin Access Required</h1>
          <p className="text-xs text-slate-400">
            This dashboard is strictly reserved for Admin accounts. Your role is{" "}
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

  // Fetch Platform Analytics
  const totalUsers = await db.user.count();
  const totalMentors = await db.user.count({ where: { role: "MENTOR" } });
  const pendingApplications = await db.mentorApplication.count({ where: { status: "PENDING" } });
  const totalSessions = await db.mentorshipSession.count();
  const completedSessions = await db.mentorshipSession.count({ where: { status: "COMPLETED" } });

  const allUsers = await db.user.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: { mentorProfile: true },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Admin Banner */}
      <div className="p-6 rounded-3xl glass-card border border-emerald-500/20 glow-green-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-100">Admin Command Center</h1>
              <span className="px-2.5 py-0.5 rounded bg-emerald-500 text-slate-950 font-extrabold text-[10px] uppercase">
                Admin Privilege
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Platform analytics, mentor verification queue, and user account management.
            </p>
          </div>
        </div>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-card border border-emerald-500/20">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase">Total Users</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-extrabold text-slate-100">{totalUsers}</span>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-emerald-500/20">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase">Verified Mentors</span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-extrabold text-emerald-400">{totalMentors}</span>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-emerald-500/20">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase">Pending Verification</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-2xl font-extrabold text-amber-400">{pendingApplications}</span>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-emerald-500/20">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase">Sessions Completed</span>
            <Calendar className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-extrabold text-slate-100">
            {completedSessions} <span className="text-xs text-slate-500">/ {totalSessions}</span>
          </span>
        </div>
      </div>

      {/* Recent Users Table */}
      <div className="p-6 rounded-3xl glass-card border border-emerald-500/20 space-y-4">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Users className="w-5 h-5 text-emerald-400" />
          Platform User Roster & Verification Status
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-emerald-500/20 text-slate-400 font-bold uppercase">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4">Verification</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-500/10 text-slate-200">
              {allUsers.map((u) => (
                <tr key={u.id} className="hover:bg-emerald-500/5 transition-colors">
                  <td className="py-3 px-4 font-semibold flex items-center gap-2">
                    <img src={u.avatar || ""} alt="" className="w-7 h-7 rounded-lg bg-emerald-950" />
                    <div>
                      <span>{u.name}</span>
                      <span className="block text-[10px] text-slate-400">{u.email}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-bold text-emerald-400">{u.role}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-bold uppercase text-[10px]">
                      {u.accountStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {u.mentorProfile ? (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        u.mentorProfile.verificationStatus === "VERIFIED"
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                          : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                      }`}>
                        {u.mentorProfile.verificationStatus}
                      </span>
                    ) : (
                      <span className="text-slate-500">N/A</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button className="px-2.5 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
