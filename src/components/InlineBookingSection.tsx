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
  Zap,
  Star,
  Check,
  Video,
  Lock,
  Globe,
  MessageSquare,
} from "lucide-react";

interface InlineBookingProps {
  mentor: {
    id: string;
    name: string;
    title: string;
    avatar: string;
    rating?: number;
    reviewCount?: number;
    yearsExp?: number;
    skills: Array<{ id?: string; name: string; proficiency?: string }>;
  };
  onSuccess?: () => void;
}

const TOPIC_TEMPLATES = [
  "Architecture & System Design Review",
  "Live Code Review & Performance Optimization",
  "Career Guidance & Technical Leadership Roadmap",
  "Mock Technical Interview & Detailed Feedback",
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
      setError("Please select an available time slot before confirming.");
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
      <div className="p-6 sm:p-10 rounded-3xl bg-[#060d08] border-2 border-emerald-500/30 shadow-2xl glow-green space-y-8">
        
        {/* Grand Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-emerald-500/20">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shadow-md">
                <Zap className="w-6 h-6 fill-emerald-400" />
              </span>
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
                  Executive 1-on-1 Mentorship Booking Command
                </h2>
                <p className="text-xs text-slate-300">
                  Select domain, pick your live 45-minute availability window, and confirm your session with <strong>{mentor.name}</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Badges */}
          <div className="flex items-center gap-2 text-xs shrink-0 flex-wrap">
            <span className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-extrabold flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> 45 Mins Live
            </span>
            <span className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-extrabold flex items-center gap-1.5">
              <Video className="w-4 h-4" /> HD Video Room
            </span>
            <span className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-extrabold flex items-center gap-1.5">
              <Lock className="w-4 h-4" /> Instant Lock
            </span>
          </div>
        </div>

        {/* Form Body or Success Confirmation */}
        {success ? (
          <div className="p-10 rounded-3xl bg-emerald-500/10 border-2 border-emerald-500/40 text-center space-y-6 animate-in fade-in glow-green">
            <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 border-2 border-emerald-500/50 flex items-center justify-center mx-auto text-emerald-400 shadow-2xl">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <div>
              <h3 className="text-3xl font-extrabold text-slate-100">Mentorship Session Officially Confirmed!</h3>
              <p className="text-xs text-slate-300 max-w-xl mx-auto leading-relaxed mt-2.5">
                Your 45-minute live 1-on-1 session for <strong>"{topic}"</strong> with <strong>{mentor.name}</strong> on{" "}
                <strong className="text-emerald-400">{new Date(selectedSlot!.startTimeISO).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</strong> at <strong className="text-emerald-400">{selectedSlot!.start} - {selectedSlot!.end}</strong> has been registered in the database.
              </p>
            </div>

            {bookedMeetingLink && (
              <div className="p-5 rounded-2xl bg-[#09120b] border border-emerald-500/40 text-xs space-y-2.5 max-w-lg mx-auto shadow-xl">
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block flex items-center justify-center gap-1.5">
                  <Video className="w-4 h-4 text-emerald-400" /> Dedicated WebRTC Video Meeting Room
                </span>
                <a
                  href={bookedMeetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-emerald-300 font-bold hover:underline flex items-center justify-center gap-2 break-all text-sm bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20"
                >
                  {bookedMeetingLink}
                  <ExternalLink className="w-4 h-4 shrink-0" />
                </a>
              </div>
            )}

            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/dashboard/learner"
                className="px-8 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-xl shadow-emerald-500/25 transition-all scale-105"
              >
                Go to Learner Dashboard
              </Link>
              <button
                onClick={() => {
                  setSuccess(false);
                  setError(null);
                }}
                className="px-8 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-extrabold text-xs border border-emerald-500/30 transition-all"
              >
                Reserve Another Session
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* EXPANSIVE 3-COLUMN LARGER MODEL LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* COLUMN 1 (Left 3 cols): Mentor Profile Card & Live Spec */}
              <div className="lg:col-span-3 space-y-6 bg-[#09120b] p-6 rounded-3xl border border-emerald-500/20 flex flex-col justify-between">
                <div className="space-y-5">
                  {/* Avatar & Badges */}
                  <div className="text-center space-y-3">
                    <div className="relative inline-block mx-auto">
                      <img
                        src={mentor.avatar}
                        alt={mentor.name}
                        className="w-20 h-20 rounded-3xl bg-emerald-950 border-2 border-emerald-500/50 object-cover shadow-xl"
                      />
                      <span className="absolute -bottom-1 -right-1 p-1 rounded-full bg-emerald-500 text-slate-950 shadow" title="Verified Mentor">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-extrabold text-slate-100">{mentor.name}</h3>
                      <p className="text-xs font-semibold text-emerald-400 mt-0.5">{mentor.title}</p>
                      {mentor.rating && (
                        <div className="flex items-center justify-center gap-1 text-xs text-amber-400 mt-1.5 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                          <span className="text-slate-200">{mentor.rating.toFixed(1)}</span>
                          <span className="text-slate-400 font-normal">({mentor.reviewCount || 12} reviews)</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Live Reservation Card */}
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 space-y-2.5 text-xs">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Live Reservation Preview
                    </span>
                    <div className="space-y-2 text-slate-200">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Duration:</span>
                        <span className="font-mono font-bold text-emerald-400">45 Minutes</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Domain:</span>
                        <span className="font-bold text-slate-100 truncate max-w-[110px]">{selectedSkillName}</span>
                      </div>
                      {selectedSlot ? (
                        <div className="pt-2 border-t border-emerald-500/20 space-y-1">
                          <span className="text-[10px] text-slate-400 block">Selected Slot:</span>
                          <span className="font-bold text-emerald-300 block text-xs">
                            {new Date(selectedSlot.startTimeISO).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                          </span>
                          <span className="font-mono text-emerald-400 font-extrabold block text-xs">
                            {selectedSlot.start} – {selectedSlot.end}
                          </span>
                        </div>
                      ) : (
                        <div className="pt-2 border-t border-emerald-500/20 text-amber-400 text-[11px]">
                          Select a time slot on the calendar
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15 text-[10px] text-slate-400 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>SkillBridge transactional lock prevents double-booking.</span>
                </div>
              </div>

              {/* COLUMN 2 (Center 5 cols): Dynamic Slot Picker */}
              <div className="lg:col-span-5 space-y-4 bg-[#09120b] p-6 rounded-3xl border border-emerald-500/20">
                <SlotPicker
                  mentorId={mentor.id}
                  selectedSlotISO={selectedSlot?.startTimeISO}
                  onSlotSelected={(slot) => setSelectedSlot(slot)}
                />
              </div>

              {/* COLUMN 3 (Right 4 cols): Skill Selector, Topic Agenda & Confirm */}
              <div className="lg:col-span-4 space-y-6 bg-[#09120b] p-6 rounded-3xl border border-emerald-500/20 flex flex-col justify-between">
                <div className="space-y-5">
                  {/* Skill Domain Selector */}
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
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-300 text-[10px] font-medium transition-all text-left"
                        >
                          + {tmpl}
                        </button>
                      ))}
                    </div>

                    <textarea
                      required
                      rows={4}
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="e.g. Code review on React Server Components caching architecture and ISR revalidation strategy..."
                      className="w-full px-4 py-3 text-xs rounded-2xl border border-emerald-500/20 bg-[#0c160f] text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/60 transition-colors shadow-inner"
                    />
                  </div>
                </div>

                {/* Grand Confirm Button */}
                <button
                  type="submit"
                  disabled={loading || !selectedSlot}
                  className="px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-2xl shadow-emerald-500/30 flex items-center justify-center gap-2 disabled:opacity-50 transition-all w-full scale-105 uppercase tracking-wider"
                >
                  {loading ? "Confirming Session..." : "Confirm & Reserve Session 🚀"}
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
