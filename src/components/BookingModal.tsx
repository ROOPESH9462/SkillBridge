"use client";

import React, { useState } from "react";
import { SlotPicker } from "./SlotPicker";
import { Calendar, Clock, BookOpen, Send, X, AlertCircle, CheckCircle2, ShieldCheck } from "lucide-react";

interface BookingModalProps {
  mentor: {
    id: string;
    name: string;
    title: string;
    avatar: string;
    skills: Array<{ id?: string; name: string }>;
  };
  onSuccess?: () => void;
}

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
  const [topic, setTopic] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedSlot) {
      setError("Please select an available time slot.");
      return;
    }

    if (!topic || topic.trim().length < 5) {
      setError("Please enter a specific discussion topic (at least 5 characters).");
      return;
    }

    // Find skill ID
    const skillObj = mentor.skills.find((s) => s.name === selectedSkillName);

    setLoading(true);

    try {
      // First fetch skill ID from catalog if not directly available
      let skillId = skillObj?.id;
      if (!skillId) {
        const resSkills = await fetch("/api/skills");
        const dataSkills = await resSkills.json();
        const found = dataSkills.skills?.find((s: any) => s.name === selectedSkillName);
        skillId = found?.id;
      }

      if (!skillId) {
        throw new Error("Target skill not found in taxonomy.");
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
        className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 transition-all"
      >
        <Calendar className="w-4 h-4" />
        Book Mentorship Session
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl p-6 sm:p-8 rounded-3xl glass-card border border-emerald-500/30 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-emerald-500/10">
              <div className="flex items-center gap-3.5">
                <img
                  src={mentor.avatar}
                  alt={mentor.name}
                  className="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-500/30 object-cover"
                />
                <div>
                  <h2 className="text-lg font-bold text-slate-100">{mentor.name}</h2>
                  <p className="text-xs font-semibold text-emerald-400">{mentor.title}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setOpen(false);
                  setSuccess(false);
                  setError(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {success ? (
              <div className="py-8 text-center space-y-4 glow-green">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-extrabold text-slate-100">Session Requested!</h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                  Your mentorship session request for <strong>"{topic}"</strong> on{" "}
                  {new Date(selectedSlot!.startTimeISO).toLocaleDateString()} at {selectedSlot!.start} has been submitted. The mentor will review your request.
                </p>
                <button
                  onClick={() => {
                    setOpen(false);
                    setSuccess(false);
                    setError(null);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Select Teaching Skill */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                    Select Discussion Skill *
                  </label>
                  <select
                    value={selectedSkillName}
                    onChange={(e) => setSelectedSkillName(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-emerald-500/20 bg-dark-bg text-slate-100 focus:outline-none focus:border-emerald-500/60 transition-colors"
                  >
                    {mentor.skills.map((sk, idx) => (
                      <option key={idx} value={sk.name} className="bg-dark-bg text-slate-100">
                        {sk.name}
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

                {/* Topic Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                    Discussion Agenda / Topic *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Code review on React Server Components caching architecture and ISR revalidation strategy..."
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-emerald-500/20 bg-dark-bg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/60 transition-colors"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/15 text-[11px] text-slate-400 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    SkillBridge guarantees zero double-bookings through strict transactional database locks.
                  </span>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3 border-t border-emerald-500/10">
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
                    className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {loading ? "Confirming Slot..." : "Confirm & Reserve Slot"}
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
