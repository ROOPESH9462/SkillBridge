"use client";

import React from "react";
import { ShieldCheck, Clock, AlertCircle, CheckCircle2, Award, UserCheck, Eye, ShieldAlert } from "lucide-react";

interface MentorVerificationStatusCardProps {
  verificationStatus: string; // "VERIFIED" | "PENDING" | "REJECTED"
  verificationDate?: string | Date | null;
  professionalTitle?: string | null;
  yearsExperience?: number | null;
}

export function MentorVerificationStatusCard({
  verificationStatus,
  verificationDate,
  professionalTitle,
  yearsExperience,
}: MentorVerificationStatusCardProps) {
  const isVerified = verificationStatus === "VERIFIED";
  const isPending = verificationStatus === "PENDING";
  const isRejected = verificationStatus === "REJECTED";

  return (
    <div
      className={`p-6 rounded-3xl glass-card border transition-all space-y-4 ${
        isVerified
          ? "border-emerald-500/40 bg-emerald-500/5 glow-green-sm"
          : isPending
          ? "border-amber-500/30 bg-amber-500/5"
          : "border-rose-500/30 bg-rose-500/5"
      }`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div
            className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 ${
              isVerified
                ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                : isPending
                ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                : "bg-rose-500/10 border-rose-500/30 text-rose-400"
            }`}
          >
            {isVerified ? (
              <ShieldCheck className="w-6 h-6" />
            ) : isPending ? (
              <Clock className="w-6 h-6" />
            ) : (
              <ShieldAlert className="w-6 h-6" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-slate-100 text-base">
                Admin Mentor Verification Status
              </h3>
              <span
                className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${
                  isVerified
                    ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                    : isPending
                    ? "bg-amber-500/20 border-amber-500/30 text-amber-300"
                    : "bg-rose-500/20 border-rose-500/30 text-rose-300"
                }`}
              >
                {verificationStatus || "PENDING"}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isVerified
                ? `Verified by Platform Administrator ${
                    verificationDate ? `on ${new Date(verificationDate).toLocaleDateString()}` : ""
                  }`
                : isPending
                ? "Your mentor application is currently in the Admin Review Queue."
                : "Verification was not approved at this time by Admin."}
            </p>
          </div>
        </div>

        {/* Verification Shield Indicator */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-dark-bg/80 border border-emerald-500/20 text-xs font-bold text-slate-300">
          <Award className="w-4 h-4 text-emerald-400" />
          <span>Admin Reviewed Profile</span>
        </div>
      </div>

      {/* Privileges & Status Highlights Grid */}
      {isVerified && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-emerald-500/10">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-[11px] font-bold text-emerald-300">Public Directory Listed</span>
          </div>

          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-[11px] font-bold text-emerald-300">1-on-1 Session Booking</span>
          </div>

          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
            <Eye className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-[11px] font-bold text-emerald-300">Recommendation Engine</span>
          </div>

          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-[11px] font-bold text-emerald-300">Verified Mentor Badge</span>
          </div>
        </div>
      )}

      {isPending && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 space-y-1">
          <p className="font-bold flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-400" />
            Admin Approval Required to Appear Publicly
          </p>
          <p className="text-[11px] text-slate-300">
            Once an Administrator approves your professional credentials in the Admin Command Center, your profile will be published to the mentor directory.
          </p>
        </div>
      )}

      {isRejected && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 space-y-1">
          <p className="font-bold flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            Application Rejected by Admin
          </p>
          <p className="text-[11px] text-slate-300">
            Your verification request was not approved. You can update your skills or re-submit an application from your Learner Workspace.
          </p>
        </div>
      )}
    </div>
  );
}
