"use client";

import React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Star,
  Clock,
  Github,
  Linkedin,
  Globe,
  Calendar,
  BookOpen,
  ArrowLeft,
  MessageSquare,
} from "lucide-react";
import { BookingModal } from "./BookingModal";

interface MentorDetailProps {
  mentor: {
    id: string;
    name: string;
    avatar: string;
    title: string;
    yearsExp: number;
    bio: string;
    rating: number;
    reviewCount: number;
    isVerified: boolean;
    githubUrl?: string | null;
    linkedinUrl?: string | null;
    portfolioUrl?: string | null;
    skills: Array<{
      id: string;
      name: string;
      category: string;
      proficiency: string;
      yearsExp: number;
    }>;
    availability: Array<{
      id: string;
      dayOfWeek: number;
      startTime: string;
      endTime: string;
    }>;
    reviews: Array<{
      id: string;
      rating: number;
      comment: string;
      authorName: string;
      authorAvatar?: string | null;
      topic: string;
      createdAt: string;
    }>;
  };
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function MentorProfileView({ mentor }: MentorDetailProps) {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back Button */}
      <Link
        href="/mentors"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-emerald-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Mentor Directory
      </Link>

      {/* Main Profile Header Banner */}
      <div className="p-8 rounded-3xl glass-card border border-emerald-500/20 glow-green relative overflow-hidden space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <img
                src={mentor.avatar}
                alt={mentor.name}
                className="w-24 h-24 rounded-3xl bg-emerald-950 border-2 border-emerald-500/40 object-cover shadow-xl"
              />
              {mentor.isVerified && (
                <div
                  className="absolute -bottom-1 -right-1 p-1 rounded-full bg-emerald-500 text-slate-950 shadow"
                  title="Verified Mentor Badge"
                >
                  <CheckCircle2 className="w-5 h-5 fill-emerald-500 stroke-slate-950" />
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-extrabold text-slate-100">{mentor.name}</h1>
                {mentor.isVerified && (
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-extrabold text-xs">
                    ✓ Verified Mentor
                  </span>
                )}
              </div>
              <p className="text-base font-semibold text-emerald-400 mt-1">
                {mentor.title}
              </p>
              <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-500" />
                  {mentor.yearsExp} Years Experience
                </span>
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                  <strong className="text-slate-200">{mentor.rating.toFixed(2)}</strong> ({mentor.reviewCount} Reviews)
                </span>
              </div>
            </div>
          </div>

          {/* Booking Button Modal */}
          <div className="w-full md:w-auto text-center md:text-right space-y-2">
            <BookingModal mentor={mentor} />
          </div>
        </div>

        {/* Bio */}
        <p className="text-sm text-slate-300 leading-relaxed pt-4 border-t border-emerald-500/10">
          {mentor.bio}
        </p>

        {/* Professional Links */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          {mentor.githubUrl && (
            <a
              href={mentor.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-xl glass-card border border-emerald-500/20 text-xs font-semibold text-slate-300 hover:text-emerald-400 hover:border-emerald-500/40 transition-all flex items-center gap-2"
            >
              <Github className="w-4 h-4 text-emerald-400" />
              GitHub
            </a>
          )}
          {mentor.linkedinUrl && (
            <a
              href={mentor.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-xl glass-card border border-emerald-500/20 text-xs font-semibold text-slate-300 hover:text-emerald-400 hover:border-emerald-500/40 transition-all flex items-center gap-2"
            >
              <Linkedin className="w-4 h-4 text-emerald-400" />
              LinkedIn
            </a>
          )}
          {mentor.portfolioUrl && (
            <a
              href={mentor.portfolioUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-xl glass-card border border-emerald-500/20 text-xs font-semibold text-slate-300 hover:text-emerald-400 hover:border-emerald-500/40 transition-all flex items-center gap-2"
            >
              <Globe className="w-4 h-4 text-emerald-400" />
              Portfolio
            </a>
          )}
        </div>
      </div>

      {/* Grid: Teaching Skills & Weekly Availability */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Teaching Skills */}
        <div className="md:col-span-2 space-y-6">
          <div className="p-6 rounded-3xl glass-card border border-emerald-500/20 space-y-4">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-400" />
              Verified Teaching Skills
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {mentor.skills.map((sk) => (
                <div
                  key={sk.id}
                  className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-100">{sk.name}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold uppercase">
                      {sk.proficiency}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{sk.category} • {sk.yearsExp} yrs experience</p>
                </div>
              ))}
            </div>
          </div>

          {/* Verified Learner Reviews */}
          <div className="p-6 rounded-3xl glass-card border border-emerald-500/20 space-y-4">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-400" />
              Verified Learner Reviews ({mentor.reviews.length})
            </h2>

            {mentor.reviews.length === 0 ? (
              <p className="text-xs text-slate-400">No reviews submitted yet for this mentor.</p>
            ) : (
              <div className="space-y-4">
                {mentor.reviews.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-2xl bg-dark-bg/50 border border-emerald-500/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={rev.authorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${rev.authorName}`}
                          alt={rev.authorName}
                          className="w-6 h-6 rounded-md bg-emerald-950 object-cover"
                        />
                        <span className="text-xs font-bold text-slate-200">{rev.authorName}</span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                        <span>{rev.rating}.0</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 italic">"{rev.comment}"</p>
                    <span className="block text-[10px] text-emerald-400/80 font-medium">
                      Topic: {rev.topic}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Weekly Availability Windows */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl glass-card border border-emerald-500/20 space-y-4">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-400" />
              Weekly Availability Windows
            </h2>

            {mentor.availability.length === 0 ? (
              <p className="text-xs text-slate-400">No recurring windows configured.</p>
            ) : (
              <div className="space-y-2 text-xs">
                {mentor.availability.map((avail) => (
                  <div
                    key={avail.id}
                    className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-slate-200"
                  >
                    <span className="font-bold">{DAYS[avail.dayOfWeek]}s</span>
                    <span className="text-emerald-400 font-mono font-bold">
                      {avail.startTime} – {avail.endTime}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
