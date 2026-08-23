"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SlotPicker } from "./SlotPicker";
import {
  Calendar,
  Clock,
  BookOpen,
  Send,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  ArrowRight,
  ArrowLeft,
  Check,
  Star,
  User,
  Zap,
} from "lucide-react";

interface InlineBookingProps {
  mentor: {
    id: string;
    name: string;
    title: string;
    avatar: string;
    rating?: number;
    reviewCount?: number;
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

export function InlineBookingSection({ mentor, onSuccess }: InlineBookingProps) {
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
    <div id="booking-section" className="scroll-mt-10">
      <div className="p-6 sm:p-8 rounded-3xl bg-[#070e0a] border border-emerald-500/30 shadow-2xl glow-green space-y-6">
        
        {/* Section Title & Badges */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-emerald-500/15">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                <Zap className="w-5 h-5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100">
                Reserve 1-on-1 Mentorship Session
              </h2>
            </div>
            <p className="text-xs text-slate-300">
              Select a domain, pick your preferred time slot, and set your agenda to lock in a 45-minute live 1-on-1 session with <strong>{mentor.name}</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs shrink-0 flex-wrap">
            <span className="px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
              ⏱️ 45 Mins Duration
            </span>
            <span className="px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
              🔒 Instant Lock
            </span>
          </div>
        </div>

        {/* Form Body or Success Confirmation */}
        {success ? (
          <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-5 animate-in fade-in">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400 shadow-2xl">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-2xl font-extrabold text-slate-100">Mentorship Session Successfully Reserved!</h3>
              <p className="text-xs text-slate-300 max-w-lg mx-auto leading-relaxed mt-2">
                Your session for <strong>"{topic}"</strong> with <strong>{mentor.name}</strong> on{" "}
                <strong>{new Date(selectedSlot!.startTimeISO).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</strong> at <strong>{selectedSlot!.start}</strong> has been registered.
              </p>
            </div>

            {bookedMeetingLink && (
              <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-xs space-y-2 max-w-md mx-auto">
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">
                  Dedicated Video Meeting Link
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

            <div className="pt-3 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/dashboard/learner"
                className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition-all"
              >
                View in Learner Dashboard
              </Link>
              <button
                onClick={() => {
                  setSuccess(false);
                  setError(null);
                }}
                className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-extrabold text-xs border border-emerald-500/20 transition-all"
              >
                Book Another Session
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Grid 1: Skill Domain Selector & Date/Slot Picker */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Domain & Agenda Column */}
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-extrabold text-slate-200 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-emerald-400" />
                    1. Select Discussion Domain / Skill *
                  </label>
                  <select
                    value={selectedSkillName}
                    onChange={(e) => setSelectedSkillName(e.target.value)}
                    className="w-full px-4 py-3 text-xs font-semibold rounded-2xl border border-emerald-500/20 bg-[#0c160f] text-slate-100 focus:outline-none focus:border-emerald-500/60 transition-colors shadow-inner"
                  >
                    {mentor.skills.map((sk, idx) => (
                      <option key={idx} value={sk.name} className="bg-[#0c160f] text-slate-100">
                        {sk.name} {sk.proficiency ? `(${sk.proficiency})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Agenda Topic & Quick Chips */}
                <div className="space-y-2">
                  <label className="block text-xs font-extrabold text-slate-200 uppercase tracking-wider">
                    2. Discussion Agenda / Topic *
                  </label>

                  <div className="flex flex-wrap gap-1.5 pb-1">
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
                    rows={3}
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Code review on React Server Components caching architecture and ISR revalidation strategy..."
                    className="w-full px-4 py-3 text-xs rounded-2xl border border-emerald-500/20 bg-[#0c160f] text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/60 transition-colors shadow-inner"
                  />
                </div>
              </div>

              {/* Date & Time Slot Picker (2 Columns) */}
              <div className="md:col-span-2 space-y-4 bg-[#09120b] p-5 rounded-3xl border border-emerald-500/20">
                <SlotPicker
                  mentorId={mentor.id}
                  selectedSlotISO={selectedSlot?.startTimeISO}
                  onSlotSelected={(slot) => setSelectedSlot(slot)}
                />
              </div>
            </div>

            {/* Live Reservation Summary Card & Submit Footer Bar */}
            <div className="p-5 rounded-2xl bg-[#09120b] border border-emerald-500/25 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">
                    Session Reservation Preview
                  </span>
                  {selectedSlot ? (
                    <p className="text-xs font-bold text-slate-100 mt-0.5">
                      {new Date(selectedSlot.startTimeISO).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} at{" "}
                      <span className="text-emerald-400 font-mono">{selectedSlot.start} - {selectedSlot.end}</span> • Domain: <span className="text-emerald-300">{selectedSkillName}</span>
                    </p>
                  ) : (
                    <p className="text-xs text-amber-400 font-bold mt-0.5">
                      Please select an available time slot above to activate booking
                    </p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !selectedSlot}
                className="px-8 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 disabled:opacity-50 transition-all w-full md:w-auto scale-105 shrink-0"
              >
                {loading ? "Confirming Session..." : "Confirm & Book Session Now 🚀"}
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
