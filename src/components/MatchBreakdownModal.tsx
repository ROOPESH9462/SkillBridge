"use client";

import React, { useState } from "react";
import { Sparkles, CheckCircle2, Info, X } from "lucide-react";

interface MatchBreakdownProps {
  mentorName: string;
  score: number;
  breakdown: {
    skillMatch: number;
    proficiencyGap: number;
    experience: number;
    rating: number;
    availability: number;
    history: number;
  };
  reasons: string[];
}

export function MatchBreakdownModal({ mentorName, score, breakdown, reasons }: MatchBreakdownProps) {
  const [open, setOpen] = useState(false);

  const factors = [
    { label: "Skill Match Taxonomy", weight: "50%", score: breakdown.skillMatch, desc: "Alignment with your target learning goals" },
    { label: "Proficiency Depth", weight: "15%", score: breakdown.proficiencyGap, desc: "Mentor's skill level relative to your target" },
    { label: "Industry Experience", weight: "10%", score: breakdown.experience, desc: "Years of engineering experience" },
    { label: "Review Rating", weight: "10%", score: breakdown.rating, desc: "Average rating across verified sessions" },
    { label: "Bookable Availability", weight: "10%", score: breakdown.availability, desc: "Active 45-minute slots this week" },
    { label: "Mentorship History", weight: "5%", score: breakdown.history, desc: "Prior completed sessions between you" },
  ];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-2.5 py-1 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-sm"
      >
        <Sparkles className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
        <span>{score}% Match</span>
        <Info className="w-3 h-3 opacity-70" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl glass-card border border-emerald-500/30 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-emerald-500/10">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-extrabold text-slate-100">Match Algorithm Audit</h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-xs">
                    {score}% Match
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Explainable multi-factor scoring breakdown for <strong>{mentorName}</strong>
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Human Readable Reasons */}
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
              <span className="text-xs font-bold uppercase text-emerald-400 tracking-wider">
                Why this mentor is recommended:
              </span>
              <ul className="space-y-1.5">
                {reasons.map((r, idx) => (
                  <li key={idx} className="text-xs text-emerald-200 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 6 Sub-Score Factors Progress Bars */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold uppercase text-slate-300 tracking-wider block mb-1">
                Weighted Factor Scores:
              </span>

              {factors.map((f, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-dark-bg/60 border border-emerald-500/10 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200">
                      {f.label} <span className="text-[10px] text-emerald-400 font-extrabold">({f.weight})</span>
                    </span>
                    <span className="font-mono font-bold text-emerald-400">{f.score}/100</span>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-emerald-950/80 overflow-hidden border border-emerald-500/10">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-300"
                      style={{ width: `${f.score}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-500">{f.desc}</p>
                </div>
              ))}
            </div>

            <div className="pt-4 text-center border-t border-emerald-500/10">
              <button
                onClick={() => setOpen(false)}
                className="px-6 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
