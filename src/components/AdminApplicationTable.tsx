"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, XCircle, Clock, ExternalLink, ShieldCheck, AlertCircle, Filter } from "lucide-react";

interface ApplicationItem {
  id: string;
  professionalTitle: string;
  yearsExperience: number;
  skills: string;
  bio: string;
  portfolioUrl?: string | null;
  linkedinUrl?: string | null;
  reasonForMentoring: string;
  status: string;
  submittedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
  };
}

export function AdminApplicationTable() {
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"PENDING" | "ALL">("PENDING");

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/mentor-applications");
      const data = await res.json();
      if (res.ok && data.success) {
        setApplications(data.applications);
      } else {
        setError(data.message || "Failed to load applications");
      }
    } catch (e: any) {
      setError(e.message || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleReview = async (id: string, action: "APPROVE" | "REJECT") => {
    try {
      setProcessingId(id);
      const res = await fetch(`/api/admin/mentor-applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Review action failed");
      }
      await fetchApplications();
    } catch (err: any) {
      alert(err.message || "Action failed");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center glass-card rounded-2xl border border-emerald-500/10 text-xs text-slate-400">
        Loading mentor verification applications...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
        <AlertCircle className="w-4 h-4" />
        <span>{error}</span>
      </div>
    );
  }

  const pendingApps = applications.filter((a) => a.status === "PENDING");
  const displayedApps = activeTab === "PENDING" ? pendingApps : applications;

  return (
    <div className="p-6 rounded-3xl glass-card border border-emerald-500/20 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            Mentor Verification Applications Queue
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Review applicant credentials and approve mentor verification badges
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/60 border border-emerald-500/20 text-xs font-bold">
          <button
            onClick={() => setActiveTab("PENDING")}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === "PENDING"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Pending ({pendingApps.length})
          </button>
          <button
            onClick={() => setActiveTab("ALL")}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === "ALL"
                ? "bg-emerald-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            All Submissions ({applications.length})
          </button>
        </div>
      </div>

      {displayedApps.length === 0 ? (
        <div className="p-8 text-center glass-card rounded-2xl border border-emerald-500/10 text-xs text-slate-400">
          {activeTab === "PENDING"
            ? "No pending mentor applications requiring review."
            : "No mentor applications recorded in system."}
        </div>
      ) : (
        <div className="space-y-4">
          {displayedApps.map((app) => {
            const isVerified = app.status === "VERIFIED";
            const isPending = app.status === "PENDING";
            const isRejected = app.status === "REJECTED";

            return (
              <div
                key={app.id}
                className={`p-6 rounded-2xl glass-card border space-y-4 transition-all ${
                  isVerified
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : isPending
                    ? "border-amber-500/30 bg-amber-500/5"
                    : "border-rose-500/30 bg-rose-500/5"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={app.user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${app.user.name}`}
                      alt={app.user.name}
                      className="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-500/30 object-cover"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-100 text-base">{app.user.name}</h3>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                            isVerified
                              ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                              : isPending
                              ? "bg-amber-500/20 border-amber-500/30 text-amber-300"
                              : "bg-rose-500/20 border-rose-500/30 text-rose-300"
                          }`}
                        >
                          {app.status}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-emerald-400">{app.professionalTitle}</p>
                      <p className="text-[11px] text-slate-400">
                        {app.yearsExperience} yrs experience • {app.user.email} • Submitted{" "}
                        {new Date(app.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {(!isVerified) && (
                      <button
                        disabled={processingId === app.id}
                        onClick={() => handleReview(app.id, "APPROVE")}
                        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Approve & Verify
                      </button>
                    )}
                    {(!isRejected) && (
                      <button
                        disabled={processingId === app.id}
                        onClick={() => handleReview(app.id, "REJECT")}
                        className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-xs transition-all border border-rose-500/30 flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-emerald-500/10 text-xs">
                  <div>
                    <span className="font-bold text-slate-300 block mb-1">Teaching Skills:</span>
                    <span className="text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 inline-block font-mono">
                      {app.skills}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-300 block mb-1">Reason for Mentoring:</span>
                    <p className="text-slate-400 leading-relaxed">{app.reasonForMentoring}</p>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-4 text-xs">
                  {app.linkedinUrl && (
                    <a
                      href={app.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      LinkedIn <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {app.portfolioUrl && (
                    <a
                      href={app.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      Portfolio / GitHub <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
