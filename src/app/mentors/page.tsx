"use client";

import React, { useState, useEffect } from "react";
import { MentorCard } from "@/components/MentorCard";
import { MentorFilters } from "@/components/MentorFilters";
import { UserCheck, Sparkles, AlertCircle } from "lucide-react";
import Link from "next/link";

interface MentorItem {
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
}

export default function MentorsPage() {
  const [mentors, setMentors] = useState<MentorItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMentors = async (filters: any = {}) => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (filters.search) query.append("search", filters.search);
      if (filters.category) query.append("category", filters.category);
      if (filters.minExperience) query.append("minExperience", filters.minExperience.toString());
      if (filters.minRating) query.append("minRating", filters.minRating.toString());

      const res = await fetch(`/api/mentors?${query.toString()}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setMentors(data.mentors);
      } else {
        setError(data.message || "Failed to load verified mentors");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load verified mentors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentors();
    // Fetch unique categories
    fetch("/api/skills")
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) setCategories(data.categories);
      })
      .catch(() => {
        setCategories(["Software Engineering", "AI & Data", "Cloud & DevOps", "Product & Design"]);
      });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Directory Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-8 rounded-3xl glass-card border border-emerald-500/20 glow-green-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold mb-3">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            Verified Technical Mentors
          </div>
          <h1 className="text-3xl font-extrabold text-slate-100">Mentor Directory</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Browse verified technical specialists across software architecture, machine learning, cloud infrastructure, and product design.
          </p>
        </div>

        <Link
          href="/register"
          className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all shrink-0"
        >
          Apply to Become a Mentor
        </Link>
      </div>

      {/* Filter Component */}
      <MentorFilters categories={categories} onFilterChange={fetchMentors} />

      {/* Mentors Grid */}
      {loading ? (
        <div className="p-12 text-center glass-card rounded-3xl border border-emerald-500/10 text-xs text-slate-400">
          Loading verified mentor profiles...
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      ) : mentors.length === 0 ? (
        <div className="p-12 text-center glass-card rounded-3xl border border-emerald-500/10 space-y-2">
          <p className="text-sm font-bold text-slate-200">No verified mentors found matching your filters.</p>
          <p className="text-xs text-slate-400">Try adjusting your search terms or resetting domain categories.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mentors.map((m) => (
            <Link key={m.id} href={`/mentors/${m.id}`}>
              <MentorCard mentor={m} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
