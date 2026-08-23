"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SlotPicker } from "./SlotPicker";
import { Calendar, Clock, BookOpen, Send, X, AlertCircle, CheckCircle2, ShieldCheck, Sparkles, ExternalLink } from "lucide-react";

interface BookingModalProps {
  mentor: {
    id: string;
    name: string;
    title: string;
    avatar: string;
    skills: Array<{ id?: string; name: string; proficiency?: string }>;
  };
  onSuccess?: () => void;
}

const TOPIC_TEMPLATES = [
  "Architecture & System Design Review",
  "Live Code Review & Optimization",
  "Career Guidance & Technical Roadmap",
  "Mock Technical Interview & Feedback",
];

export function BookingModal({ mentor, onSuccess }: BookingModalProps) {
  const [open, setOpen] = useState(false);
  const [selectedSkillName, setSelectedSkillName] = useState(
    mentor.skills[0]?.name || "Next.js"
  );
  const [selectedSlot, setSelectedSlot] = useState<{
    startTimeISO: string;
    endTimeISO: string;
    start: string;
    end: string;
  } | null>(null);
  const [topic, setTopic] = useState("Architecture & System Design Review");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [bookedMeetingLink, setBookedMeetingLink] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedSlot) {
      setError("Please select an available time slot above.");
      return;
    }

    if (!topic || topic.trim().length < 5) {
      setError("Please enter a specific discussion topic (at least 5 characters).");
      return;
    }

    setLoading(true);

    try {
      // Find skill object ID or fallback to skill name
      const skillObj = mentor.skills.find((s) => s.name === selectedSkillName);
      let skillId = skillObj?.id;

      if (!skillId) {
        try {
          const resSkills = await fetch("/api/skills");
          const dataSkills = await resSkills.json();
          const found = dataSkills.skills?.find((s: any) => s.name === selectedSkillName);
          skillId = found?.id;
        } catch (e) {}
      }

      if (!skillId) {
        skillId = selectedSkillName;
      }

      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mentorId: mentor.id,
          skillId,
          scheduledStart: selectedSlot.startTimeISO,
          scheduledEnd: selectedSlot.endTimeISO,
          topic: topic.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to book mentorship session");
      }

      setBookedMeetingLink(data.session?.meetingLink || null);
      setSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all w-full md:w-auto"
      >
        <Calendar className="w-4 h-4" />
        Book Mentorship Session (45 Mins)
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
          <div className="w-full max-w-2xl rounded-3xl glass-card border border-emerald-500/30 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[88vh] animate-in fade-in zoom-in-95 my-auto">
            
            {/* Fixed Header Bar */}
            <div className="p-4 sm:p-5 bg-slate-950/90 border-b border-emerald-500/15 flex items-center justify-between shrink-0 z-10">
              <div className="flex items-center gap-3">
                <img
                  src={mentor.avatar}
                  alt={mentor.name}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-emerald-950 border border-emerald-500/30 object-cover shadow"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-extrabold text-slate-100">{mentor.name}</h2>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-extrabold text-[10px] uppercase">
                      Verified Mentor
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-emerald-400">{mentor.title}</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setOpen(false);
                  setSuccess(false);
                  setError(null);
                }}
                className="p-2 rounded-xl bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-emerald-500/15 transition-colors"
                title="Close modal"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Modal Body: Success View vs Form View */}
            {success ? (
              <div className="flex flex-col flex-1 overflow-hidden">
                {/* Scrollable Success Body */}
                <div className="p-5 sm:p-7 overflow-y-auto flex-1 text-center space-y-4 no-scrollbar">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400 shadow-xl mt-2">
                    <CheckCircle2 className="w-8 h-8 sm:w-9 sm:h-9" />
                  </div>

                  <div>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-slate-100">Mentorship Session Reserved!</h3>
                    <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed mt-1.5">
                      Your session request for <strong>"{topic}"</strong> with <strong>{mentor.name}</strong> on{" "}
                      <strong>{new Date(selectedSlot!.startTimeISO).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</strong> at <strong>{selectedSlot!.start}</strong> has been submitted.
                    </p>
                  </div>

                  {/* Session Meeting Card */}
                  {bookedMeetingLink && (
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-2 max-w-md mx-auto">
                      <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">
                        Dedicated Video Room Link
                      </span>
                      <a
                        href={bookedMeetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-emerald-300 font-bold hover:underline flex items-center justify-center gap-1.5 break-all"
                      >
                        {bookedMeetingLink}
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Permanent Fixed Action Footer for Success View */}
                <div className="p-4 sm:px-6 bg-slate-950/95 border-t border-emerald-500/20 flex flex-col sm:flex-row items-center justify-center gap-3 shrink-0 z-10 glow-green-sm">
                  <Link
                    href="/dashboard/learner"
                    className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-md shadow-emerald-500/20 transition-all w-full sm:w-auto text-center"
                  >
                    View in Learner Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      setOpen(false);
                      setSuccess(false);
                      setError(null);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-slate-100 font-extrabold text-xs border border-emerald-500/20 w-full sm:w-auto transition-all"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                {/* Scrollable Form Fields */}
                <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 no-scrollbar">
                  {error && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Select Teaching Skill */}
                  <div>
                    <label className="block text-xs font-extrabold text-slate-200 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                      Select Discussion Domain / Skill *
                    </label>
                    <select
                      value={selectedSkillName}
                      onChange={(e) => setSelectedSkillName(e.target.value)}
                      className="w-full px-4 py-2.5 text-xs font-semibold rounded-xl border border-emerald-500/20 bg-dark-bg text-slate-100 focus:outline-none focus:border-emerald-500/60 transition-colors"
                    >
                      {mentor.skills.map((sk, idx) => (
                        <option key={idx} value={sk.name} className="bg-dark-bg text-slate-100">
                          {sk.name} {sk.proficiency ? `(${sk.proficiency})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Slot Picker Component */}
                  <SlotPicker
                    mentorId={mentor.id}
                    selectedSlotISO={selectedSlot?.startTimeISO}
                    onSlotSelected={(slot) => setSelectedSlot(slot)}
                  />

                  {/* Topic Input & Quick Templates */}
                  <div className="space-y-2">
                    <label className="block text-xs font-extrabold text-slate-200 uppercase tracking-wider">
                      3. Discussion Agenda / Topic *
                    </label>

                    {/* Quick Agenda Templates */}
                    <div className="flex flex-wrap gap-1.5 pb-1">
                      {TOPIC_TEMPLATES.map((tmpl, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setTopic(tmpl)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-300 text-[11px] font-medium transition-all"
                        >
                          + {tmpl}
                        </button>
                      ))}
                    </div>

                    <textarea
                      required
                      rows={3}
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="e.g. Code review on React Server Components caching architecture and ISR revalidation strategy..."
                      className="w-full px-4 py-2.5 text-xs rounded-xl border border-emerald-500/20 bg-dark-bg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/60 transition-colors"
                    />
                  </div>

                  {/* Live Booking Confirmation Summary */}
                  {selectedSlot && (
                    <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2 animate-in fade-in">
                      <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        Session Reservation Summary
                      </span>
                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-200">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Date & Time:</span>
                          <span className="font-bold">
                            {new Date(selectedSlot.startTimeISO).toLocaleDateString()} at {selectedSlot.start}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Domain:</span>
                          <span className="font-bold text-emerald-300">{selectedSkillName}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15 text-[11px] text-slate-400 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      SkillBridge guarantees zero double-bookings through strict transactional database locks.
                    </span>
                  </div>
                </div>

                {/* Permanent Fixed Action Footer Bar for Form View */}
                <div className="p-4 sm:px-6 bg-slate-950/95 border-t border-emerald-500/20 flex items-center justify-between gap-3 shrink-0 z-10 glow-green-sm">
                  <div className="hidden sm:block text-xs text-slate-400">
                    {selectedSlot ? (
                      <span>
                        Selected: <strong className="text-emerald-400">{selectedSlot.start} - {selectedSlot.end}</strong>
                      </span>
                    ) : (
                      <span className="text-amber-400">Please select an available slot</span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 ml-auto w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={loading || !selectedSlot}
                      className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 disabled:opacity-50 transition-all w-full sm:w-auto"
                    >
                      {loading ? "Confirming Session..." : "Confirm & Book Session Now"}
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
