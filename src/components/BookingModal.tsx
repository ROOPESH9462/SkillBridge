"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SlotPicker } from "./SlotPicker";
import {
  Calendar,
  Clock,
  BookOpen,
  Send,
  X,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Check,
} from "lucide-react";

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
    mentor.skills[0]?.name || "Software Engineering"
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

  const handleClose = () => {
    setOpen(false);
    setSuccess(false);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedSlot) {
      setError("Please select an available time slot below.");
      return;
    }

    if (!topic || topic.trim().length < 5) {
      setError("Please enter a specific discussion topic (at least 5 characters).");
      return;
    }

    setLoading(true);

    try {
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
        onClick={() => {
          setOpen(true);
          setSuccess(false);
          setError(null);
        }}
        className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all w-full md:w-auto"
      >
        <Calendar className="w-4 h-4" />
        Book Mentorship Session (45 Mins)
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-lg sm:max-w-xl rounded-3xl bg-[#070e0a] border border-emerald-500/30 shadow-2xl overflow-hidden flex flex-col max-h-[86vh] sm:max-h-[88vh] animate-in fade-in zoom-in-95 my-auto">
            
            {/* Solid Header Bar */}
            <div className="p-4 sm:p-4.5 bg-[#0d1610] border-b border-emerald-500/20 flex items-center justify-between gap-3 shrink-0 z-20 shadow-md">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="relative shrink-0">
                  <img
                    src={mentor.avatar}
                    alt={mentor.name}
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-emerald-950 border border-emerald-500/40 object-cover shadow"
                  />
                  <span className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-emerald-500 text-slate-950">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-sm sm:text-base font-extrabold text-slate-100 truncate max-w-[160px] sm:max-w-[220px]">
                      {mentor.name}
                    </h2>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-extrabold text-[10px] uppercase whitespace-nowrap shrink-0">
                      Verified Mentor
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs font-semibold text-emerald-400 truncate mt-0.5 max-w-[240px] sm:max-w-[320px]">
                    {mentor.title}
                  </p>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="p-2 rounded-xl bg-slate-900/90 text-slate-400 hover:text-slate-200 border border-emerald-500/20 transition-colors shrink-0"
                title="Close modal"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Modal Body: Success vs Form Views */}
            {success ? (
              <div className="flex flex-col flex-1 overflow-hidden bg-[#070e0a]">
                <div className="p-6 sm:p-8 overflow-y-auto flex-1 text-center space-y-4 no-scrollbar">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400 shadow-2xl mt-2 glow-green">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>

                  <div>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-slate-100">Mentorship Session Reserved!</h3>
                    <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed mt-1.5">
                      Your session request for <strong>"{topic}"</strong> with <strong>{mentor.name}</strong> on{" "}
                      <strong>{new Date(selectedSlot!.startTimeISO).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</strong> at <strong>{selectedSlot!.start}</strong> has been confirmed.
                    </p>
                  </div>

                  {bookedMeetingLink && (
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-2 max-w-md mx-auto">
                      <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">
                        Dedicated Video Room Link
                      </span>
                      <a
                        href={bookedMeetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-emerald-300 font-bold hover:underline flex items-center justify-center gap-1.5 break-all text-xs"
                      >
                        {bookedMeetingLink}
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      </a>
                    </div>
                  )}
                </div>

                <div className="p-4 sm:px-6 bg-[#0d1610] border-t border-emerald-500/20 flex flex-col sm:flex-row items-center justify-center gap-3 shrink-0 z-20 glow-green-sm">
                  <Link
                    href="/dashboard/learner"
                    className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-md shadow-emerald-500/20 transition-all w-full sm:w-auto text-center"
                  >
                    View in Learner Dashboard
                  </Link>
                  <button
                    onClick={handleClose}
                    className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-slate-100 font-extrabold text-xs border border-emerald-500/20 w-full sm:w-auto transition-all"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden bg-[#070e0a]">
                <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 no-scrollbar">
                  {error && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2 animate-in fade-in">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* 1. Skill Domain Selector */}
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-200 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                      1. Select Discussion Domain / Skill *
                    </label>
                    <select
                      value={selectedSkillName}
                      onChange={(e) => setSelectedSkillName(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-emerald-500/20 bg-[#0a120c] text-slate-100 focus:outline-none focus:border-emerald-500/60 transition-colors"
                    >
                      {mentor.skills.map((sk, idx) => (
                        <option key={idx} value={sk.name} className="bg-[#0a120c] text-slate-100">
                          {sk.name} {sk.proficiency ? `(${sk.proficiency})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 2. Date & Time Slot Picker */}
                  <SlotPicker
                    mentorId={mentor.id}
                    selectedSlotISO={selectedSlot?.startTimeISO}
                    onSlotSelected={(slot) => setSelectedSlot(slot)}
                  />

                  {/* 3. Topic Input & Quick Templates */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-extrabold text-slate-200 uppercase tracking-wider">
                      3. Discussion Agenda / Topic *
                    </label>

                    <div className="flex flex-wrap gap-1.5 pb-0.5">
                      {TOPIC_TEMPLATES.map((tmpl, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setTopic(tmpl)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-300 text-[10px] font-medium transition-all"
                        >
                          + {tmpl}
                        </button>
                      ))}
                    </div>

                    <textarea
                      required
                      rows={2}
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="e.g. Code review on React Server Components caching architecture..."
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-emerald-500/20 bg-[#0a120c] text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/60 transition-colors"
                    />
                  </div>

                  {/* Live Booking Summary Card */}
                  {selectedSlot && (
                    <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1 animate-in fade-in">
                      <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        Session Reservation Preview
                      </span>
                      <p className="text-xs font-bold text-slate-200">
                        {new Date(selectedSlot.startTimeISO).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} at{" "}
                        <span className="text-emerald-400 font-mono">{selectedSlot.start} - {selectedSlot.end}</span> • Skill: <span className="text-emerald-300">{selectedSkillName}</span>
                      </p>
                    </div>
                  )}

                  <div className="p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/15 text-[10px] text-slate-400 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      Transactional database lock guarantees zero double-bookings.
                    </span>
                  </div>
                </div>

                {/* Permanent Fixed Action Footer Bar */}
                <div className="p-3.5 sm:px-6 bg-[#0d1610] border-t border-emerald-500/20 flex items-center justify-between gap-3 shrink-0 z-20 glow-green-sm">
                  <div className="hidden sm:block text-xs text-slate-400">
                    {selectedSlot ? (
                      <span>
                        Slot: <strong className="text-emerald-400">{selectedSlot.start} - {selectedSlot.end}</strong>
                      </span>
                    ) : (
                      <span className="text-amber-400">Select a slot</span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 ml-auto w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-3 py-2 text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={loading || !selectedSlot}
                      className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 disabled:opacity-50 transition-all w-full sm:w-auto"
                    >
                      {loading ? "Confirming..." : "Confirm & Book Session"}
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
