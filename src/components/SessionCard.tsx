"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, CheckCircle2, XCircle, CheckSquare, AlertTriangle, Star, Video } from "lucide-react";
import { ReviewModal } from "./ReviewModal";

interface SessionCardProps {
  session: {
    id: string;
    mentorId: string;
    learnerId: string;
    topic: string;
    status: string;
    scheduledStart: string;
    scheduledEnd: string;
    durationMinutes: number;
    meetingLink?: string | null;
    skill: { name: string };
    mentor: { id: string; name: string; avatar?: string | null; mentorProfile?: { professionalTitle: string } | null };
    learner: { id: string; name: string; avatar?: string | null; email: string };
    review?: { id: string; rating: number; comment: string } | null;
  };
  currentUserId: string;
  userRole: string;
  onStatusUpdate?: () => void;
}

export function SessionCard({ session, currentUserId, userRole, onStatusUpdate }: SessionCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (nextStatus: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/sessions/${session.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update session status");
      }

      // Real-time event propagation across components
      window.dispatchEvent(new Event("skillbridge-session-updated"));
      router.refresh();

      if (onStatusUpdate) onStatusUpdate();
    } catch (e: any) {
      alert(e.message || "Status update failed");
    } finally {
      setLoading(false);
    }
  };

  const isMentor = session.mentorId === currentUserId || userRole === "MENTOR" || userRole === "ADMIN";
  const isLearner = session.learnerId === currentUserId;

  return (
    <div className="p-6 rounded-2xl glass-card border border-emerald-500/20 space-y-4 hover:border-emerald-500/40 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-500/10 pb-3">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-extrabold text-xs uppercase">
            {session.status}
          </span>
          <span className="text-xs font-semibold text-emerald-400/80">
            • {session.skill.name}
          </span>
        </div>

        <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
          <Clock className="w-3.5 h-3.5 text-emerald-400" />
          {new Date(session.scheduledStart).toLocaleDateString()} @{" "}
          {new Date(session.scheduledStart).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>

      <div>
        <h3 className="text-sm font-bold text-slate-100">{session.topic}</h3>
        <p className="text-xs text-slate-400 mt-1">
          Duration: {session.durationMinutes} minutes
        </p>

        {session.meetingLink && session.status === "CONFIRMED" && (
          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <Video className="w-4 h-4 text-emerald-400" />
            <a href={session.meetingLink} target="_blank" rel="noreferrer" className="hover:underline">
              Join Virtual Session Room
            </a>
          </div>
        )}
      </div>

      {/* Verified Review display if submitted */}
      {session.review && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-amber-400">
            <span>Verified Review Submitted</span>
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
              <span>{session.review.rating}.0 / 5.0</span>
            </div>
          </div>
          <p className="text-xs text-slate-300 italic">"{session.review.comment}"</p>
        </div>
      )}

      {/* Participant info */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          <img
            src={
              isMentor
                ? session.learner.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.learner.name}`
                : session.mentor.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.mentor.name}`
            }
            alt=""
            className="w-9 h-9 rounded-xl bg-emerald-950 border border-emerald-500/30 object-cover"
          />
          <div>
            <span className="text-xs font-bold text-slate-200">
              {isMentor ? `Learner: ${session.learner.name}` : `Mentor: ${session.mentor.name}`}
            </span>
            <span className="block text-[10px] text-slate-400">
              {isMentor ? session.learner.email : session.mentor.mentorProfile?.professionalTitle}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {session.status === "REQUESTED" && (
            <>
              {isMentor && (
                <button
                  disabled={loading}
                  onClick={() => handleUpdate("CONFIRMED")}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow transition-all flex items-center gap-1 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Approve
                </button>
              )}
              <button
                disabled={loading}
                onClick={() => handleUpdate("CANCELLED")}
                className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-xs transition-all flex items-center gap-1 disabled:opacity-50"
              >
                <XCircle className="w-3.5 h-3.5" />
                Cancel
              </button>
            </>
          )}

          {session.status === "CONFIRMED" && (
            <>
              <button
                disabled={loading}
                onClick={() => handleUpdate("COMPLETED")}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-bold text-xs transition-all flex items-center gap-1 disabled:opacity-50"
              >
                <CheckSquare className="w-3.5 h-3.5" />
                Mark Completed
              </button>
              {isMentor && (
                <button
                  disabled={loading}
                  onClick={() => handleUpdate("NO_SHOW")}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold text-xs transition-all flex items-center gap-1 disabled:opacity-50"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  No Show
                </button>
              )}
            </>
          )}

          {session.status === "COMPLETED" && isLearner && !session.review && (
            <ReviewModal
              sessionId={session.id}
              mentorName={session.mentor.name}
              topic={session.topic}
              onSuccess={() => {
                window.dispatchEvent(new Event("skillbridge-session-updated"));
                router.refresh();
                if (onStatusUpdate) onStatusUpdate();
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
