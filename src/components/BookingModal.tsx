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
  ArrowRight,
  ArrowLeft,
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
  const [step, setStep] = useState<1 | 2>(1);

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

  const handleResetModal = () => {
    setOpen(false);
    setStep(1);
    setSuccess(false);
    setError(null);
  };

  const handleProceedToStep2 = () => {
    setError(null);
    if (!selectedSlot) {
      setError("Please select an available time slot before continuing.");
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedSlot) {
      setError("Please select an available time slot.");
      setStep(1);
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
          setStep(1);
          setSuccess(false);
          setError(null);
        }}
        className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all w-full md:w-auto scale-105"
      >
        <Calendar className="w-4 h-4" />
        Book Mentorship Session (45 Mins)
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
          <div className="w-full max-w-xl rounded-3xl bg-[#060c08] border border-emerald-500/30 shadow-2xl overflow-hidden flex flex-col max-h-[88vh] animate-in fade-in zoom-in-95 my-auto">
            
            {/* Header with Stepper Progress Bar */}
            <div className="bg-[#0b130e] border-b border-emerald-500/20 shrink-0 z-20 shadow-md">
              <div className="p-4 sm:p-4.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <img
                    src={mentor.avatar}
                    alt={mentor.name}
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-emerald-950 border border-emerald-500/30 object-cover shrink-0 shadow"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-base font-extrabold text-slate-100 truncate max-w-[180px] sm:max-w-[240px]">
                        {mentor.name}
                      </h2>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-extrabold text-[10px] uppercase whitespace-nowrap shrink-0">
                        ✓ Verified Mentor
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-emerald-400 truncate mt-0.5 max-w-[280px] sm:max-w-[340px]">
                      {mentor.title}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleResetModal}
                  className="p-2 rounded-xl bg-slate-900/90 text-slate-400 hover:text-slate-200 border border-emerald-500/20 transition-colors shrink-0"
                  title="Close modal"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              {/* Interactive Step Progress Stepper */}
              {!success && (
                <div className="px-5 pb-3 pt-1 flex items-center justify-between text-[11px] font-bold border-t border-emerald-500/10 bg-[#08100a]">
                  <div
                    onClick={() => setStep(1)}
                    className={`flex items-center gap-1.5 cursor-pointer transition-colors ${
                      step === 1 ? "text-emerald-400" : "text-emerald-400/60 hover:text-emerald-400"
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-mono ${
                      step === 1 ? "bg-emerald-500 text-slate-950 font-extrabold" : "bg-emerald-500/20 text-emerald-300"
                    }`}>
                      1
                    </span>
                    <span>1. Domain & Slot</span>
                  </div>

                  <div className="h-0.5 flex-1 mx-3 bg-emerald-500/20 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-emerald-400 transition-all duration-300 ${
                        step === 2 ? "w-full" : "w-1/2"
                      }`}
                    />
                  </div>

                  <div
                    onClick={() => selectedSlot && setStep(2)}
                    className={`flex items-center gap-1.5 transition-colors ${
                      selectedSlot ? "cursor-pointer" : "cursor-not-allowed opacity-50"
                    } ${step === 2 ? "text-emerald-400" : "text-slate-400"}`}
                  >
                    <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-mono ${
                      step === 2 ? "bg-emerald-500 text-slate-950 font-extrabold" : "bg-slate-800 text-slate-400"
                    }`}>
                      2
                    </span>
                    <span>2. Agenda & Review</span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Body & Multi-Step Views */}
            {success ? (
              <div className="flex flex-col flex-1 overflow-hidden bg-[#060c08]">
                {/* Scrollable Success Body */}
                <div className="p-5 sm:p-7 overflow-y-auto flex-1 text-center space-y-4 no-scrollbar">
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

                  {/* Dedicated Meeting Card */}
                  {bookedMeetingLink && (
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-2 max-w-md mx-auto">
                      <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block flex items-center justify-center gap-1">
                        <Sparkles className="w-3 h-3 text-emerald-400" /> Dedicated Video Room Link
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

                  <div className="p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 text-[11px] text-slate-400 max-w-md mx-auto flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>In-app notifications and email calendar invites have been generated.</span>
                  </div>
                </div>

                {/* Permanent Fixed Action Footer for Success View */}
                <div className="p-4 sm:px-6 bg-[#0b130e] border-t border-emerald-500/20 flex flex-col sm:flex-row items-center justify-center gap-3 shrink-0 z-20 glow-green-sm">
                  <Link
                    href="/dashboard/learner"
                    className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-md shadow-emerald-500/20 transition-all w-full sm:w-auto text-center"
                  >
                    View in Learner Dashboard
                  </Link>
                  <button
                    onClick={handleResetModal}
                    className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-slate-100 font-extrabold text-xs border border-emerald-500/20 w-full sm:w-auto transition-all"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden bg-[#060c08]">
                {/* Scrollable Form Body */}
                <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 no-scrollbar">
                  {error && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2 animate-in fade-in">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* STEP 1: Skill Domain & Time Slot Selection */}
                  {step === 1 && (
                    <div className="space-y-4 animate-in fade-in">
                      {/* Select Teaching Skill */}
                      <div>
                        <label className="block text-[11px] font-extrabold text-slate-200 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                          Select Discussion Domain / Skill *
                        </label>
                        <select
                          value={selectedSkillName}
                          onChange={(e) => setSelectedSkillName(e.target.value)}
                          className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-emerald-500/20 bg-[#080e0a] text-slate-100 focus:outline-none focus:border-emerald-500/60 transition-colors"
                        >
                          {mentor.skills.map((sk, idx) => (
                            <option key={idx} value={sk.name} className="bg-[#080e0a] text-slate-100">
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
                    </div>
                  )}

                  {/* STEP 2: Agenda Topic & Reservation Review */}
                  {step === 2 && (
                    <div className="space-y-4 animate-in fade-in">
                      {/* Live Booking Confirmation Summary */}
                      {selectedSlot && (
                        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2 glow-green-sm">
                          <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                            Session Reservation Details
                          </span>
                          <div className="grid grid-cols-2 gap-3 text-xs text-slate-200">
                            <div>
                              <span className="text-slate-400 block text-[10px]">Mentor & Domain:</span>
                              <span className="font-bold text-emerald-300">{mentor.name} • {selectedSkillName}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">Date & Time Slot:</span>
                              <span className="font-bold">
                                {new Date(selectedSlot.startTimeISO).toLocaleDateString()} at {selectedSlot.start}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Topic Input & Quick Templates */}
                      <div className="space-y-2">
                        <label className="block text-[11px] font-extrabold text-slate-200 uppercase tracking-wider">
                          Discussion Agenda / Topic *
                        </label>

                        {/* Quick Agenda Templates */}
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
                          rows={3}
                          value={topic}
                          onChange={(e) => setTopic(e.target.value)}
                          placeholder="e.g. Code review on React Server Components caching architecture and ISR revalidation strategy..."
                          className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-emerald-500/20 bg-[#080e0a] text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/60 transition-colors"
                        />
                      </div>

                      <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15 text-[10px] text-slate-400 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>
                          SkillBridge guarantees zero double-bookings through strict transactional database locks.
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Permanent Fixed Action Footer Bar */}
                <div className="p-3.5 sm:px-6 bg-[#0b130e] border-t border-emerald-500/20 flex items-center justify-between gap-3 shrink-0 z-20 glow-green-sm">
                  {step === 1 ? (
                    <>
                      <div className="text-xs text-slate-400 hidden sm:block">
                        {selectedSlot ? (
                          <span>
                            Selected: <strong className="text-emerald-400">{selectedSlot.start} - {selectedSlot.end}</strong>
                          </span>
                        ) : (
                          <span className="text-amber-400">Select an available slot above</span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 ml-auto w-full sm:w-auto justify-end">
                        <button
                          type="button"
                          onClick={handleResetModal}
                          className="px-3.5 py-2 text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors"
                        >
                          Cancel
                        </button>

                        <button
                          type="button"
                          onClick={handleProceedToStep2}
                          disabled={!selectedSlot}
                          className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-1.5 disabled:opacity-50 transition-all w-full sm:w-auto"
                        >
                          <span>Continue to Agenda</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="px-3.5 py-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Back</span>
                      </button>

                      <div className="flex items-center gap-3 ml-auto">
                        <button
                          type="submit"
                          disabled={loading || !selectedSlot}
                          className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 disabled:opacity-50 transition-all scale-105"
                        >
                          {loading ? "Confirming Session..." : "Confirm & Reserve Session"}
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
