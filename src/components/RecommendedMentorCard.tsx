"use client";

import React from "react";
import { CheckCircle2, Star, Clock, Sparkles } from "lucide-react";
import { MatchBreakdownModal } from "./MatchBreakdownModal";
import { BookingModal } from "./BookingModal";
import Link from "next/link";

interface RecommendedMentorCardProps {
  mentor: {
    mentorId: string;
    name: string;
    avatar: string;
    title: string;
    yearsExp: number;
    rating: number;
    reviewCount: number;
    isVerified: boolean;
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
    skills: Array<{ name: string; proficiency: string; yearsExp: number }>;
  };
}

export function RecommendedMentorCard({ mentor }: RecommendedMentorCardProps) {
  const mentorObj = {
    id: mentor.mentorId,
    name: mentor.name,
    avatar: mentor.avatar,
    title: mentor.title,
    skills: mentor.skills,
  };

  return (
    <div className="group rounded-3xl glass-card p-6 border border-emerald-500/30 hover:border-emerald-500/50 transition-all duration-300 flex flex-col justify-between space-y-4 hover:-translate-y-1 shadow-lg hover:shadow-emerald-500/10 relative overflow-hidden">
      {/* Top Badge & Header */}
      <div>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <img
                src={mentor.avatar}
                alt={mentor.name}
                className="w-14 h-14 rounded-2xl bg-emerald-950 border border-emerald-500/30 object-cover"
              />
              {mentor.isVerified && (
                <div
                  className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-emerald-500 text-slate-950 shadow"
                  title="Verified Mentor"
                >
                  <CheckCircle2 className="w-4 h-4 fill-emerald-500 stroke-slate-950" />
                </div>
              )}
            </div>

            <div>
              <Link href={`/mentors/${mentor.mentorId}`}>
                <h3 className="font-bold text-lg text-slate-100 group-hover:text-emerald-400 transition-colors">
                  {mentor.name}
                </h3>
              </Link>
              <p className="text-xs font-semibold text-emerald-400">{mentor.title}</p>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {mentor.yearsExp} yrs experience
              </p>
            </div>
          </div>

          {/* Interactive Match Score Badge & Audit Modal */}
          <MatchBreakdownModal
            mentorName={mentor.name}
            score={mentor.score}
            breakdown={mentor.breakdown}
            reasons={mentor.reasons}
          />
        </div>

        {/* Explainable Match Reason Bullets */}
        <div className="mb-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1.5">
          <span className="text-[10px] font-extrabold uppercase text-emerald-400 tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 fill-emerald-400 text-emerald-400" />
            Top Match Reasons:
          </span>
          <ul className="space-y-1">
            {mentor.reasons.map((reason, idx) => (
              <li key={idx} className="text-xs text-emerald-200 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span className="line-clamp-1">{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Teaching Skills */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          {mentor.skills.map((skill, idx) => (
            <span
              key={idx}
              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center gap-1"
            >
              {skill.name}
              <span className="text-[9px] uppercase font-bold px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                {skill.proficiency}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Footer Action Row */}
      <div className="pt-4 border-t border-emerald-500/10 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1 text-xs text-amber-400 font-bold">
          <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
          <span>{mentor.rating.toFixed(2)}</span>
          <span className="text-slate-500 text-[10px]">({mentor.reviewCount})</span>
        </div>

        <BookingModal mentor={mentorObj} />
      </div>
    </div>
  );
}
