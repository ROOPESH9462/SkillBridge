"use client";

import React from "react";
import { CheckCircle2, Star, Clock, ShieldCheck } from "lucide-react";
import { BookingModal } from "./BookingModal";

export interface MentorProps {
  id: string;
  name: string;
  avatar: string;
  title: string;
  yearsExp: number;
  bio: string;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  skills: Array<{ name: string; proficiency: string; yearsExp: number }>;
  matchScore?: number;
  matchReasons?: string[];
}

export function MentorCard({ mentor }: { mentor: MentorProps }) {
  return (
    <div className="group relative rounded-2xl glass-card p-6 hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 shadow-lg hover:shadow-emerald-500/10">
      {/* Top Header Row */}
      <div>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <img
                src={mentor.avatar}
                alt={mentor.name}
                className="w-14 h-14 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 object-cover"
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
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 group-hover:text-emerald-400 transition-colors">
                  {mentor.name}
                </h3>
              </div>
              <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                {mentor.title}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {mentor.yearsExp} yrs experience
              </p>
            </div>
          </div>

          {/* Rating Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold text-xs shrink-0">
            <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
            <span>{mentor.rating.toFixed(2)}</span>
            <span className="text-slate-500 dark:text-slate-400 text-[10px]">
              ({mentor.reviewCount})
            </span>
          </div>
        </div>

        {/* Bio */}
        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-4 leading-relaxed">
          {mentor.bio}
        </p>

        {/* Explainable Match Badge (if available) */}
        {mentor.matchScore && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Explainable Match
              </span>
              <span className="text-xs font-extrabold text-emerald-400">
                {mentor.matchScore}% Match
              </span>
            </div>
            {mentor.matchReasons && (
              <ul className="space-y-1">
                {mentor.matchReasons.map((reason, idx) => (
                  <li key={idx} className="text-[11px] text-emerald-300 flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-emerald-400" />
                    {reason}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Teaching Skills Badges */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {mentor.skills.map((skill, idx) => (
            <span
              key={idx}
              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 dark:text-emerald-300 flex items-center gap-1"
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
      <div className="pt-4 border-t border-emerald-500/10 flex items-center justify-between gap-3" onClick={(e) => e.stopPropagation()}>
        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-emerald-500" />
          <span>45-Min Slots</span>
        </div>

        <BookingModal mentor={mentor} />
      </div>
    </div>
  );
}
