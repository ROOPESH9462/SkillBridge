"use client";

import React, { useState } from "react";
import { Search, Filter, Star, Clock, X } from "lucide-react";

interface MentorFiltersProps {
  categories: string[];
  onFilterChange: (filters: {
    search: string;
    category: string;
    minExperience: number;
    minRating: number;
  }) => void;
}

export function MentorFilters({ categories, onFilterChange }: MentorFiltersProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [minExperience, setMinExperience] = useState(0);
  const [minRating, setMinRating] = useState(0);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    onFilterChange({ search: val, category: selectedCategory, minExperience, minRating });
  };

  const handleCategorySelect = (cat: string) => {
    const nextCat = selectedCategory === cat ? "" : cat;
    setSelectedCategory(nextCat);
    onFilterChange({ search, category: nextCat, minExperience, minRating });
  };

  const handleExpChange = (exp: number) => {
    const nextExp = minExperience === exp ? 0 : exp;
    setMinExperience(nextExp);
    onFilterChange({ search, category: selectedCategory, minExperience: nextExp, minRating });
  };

  const handleRatingChange = (rating: number) => {
    const nextRating = minRating === rating ? 0 : rating;
    setMinRating(nextRating);
    onFilterChange({ search, category: selectedCategory, minExperience, minRating: nextRating });
  };

  const resetFilters = () => {
    setSearch("");
    setSelectedCategory("");
    setMinExperience(0);
    setMinRating(0);
    onFilterChange({ search: "", category: "", minExperience: 0, minRating: 0 });
  };

  const isFiltered = search || selectedCategory || minExperience > 0 || minRating > 0;

  return (
    <div className="p-6 rounded-3xl glass-card border border-emerald-500/20 space-y-5">
      {/* Top Search Input */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search by mentor name, skill (e.g. Next.js, FastAPI, PyTorch), or title..."
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-2xl border border-emerald-500/20 bg-dark-bg/60 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/60 transition-all"
          />
        </div>

        {isFiltered && (
          <button
            onClick={resetFilters}
            className="px-3 py-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
          >
            <X className="w-4 h-4" />
            Reset Filters
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div>
        <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
          Domain Category
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleCategorySelect("")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === ""
                ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                : "bg-emerald-500/10 text-slate-300 hover:bg-emerald-500/20 border border-emerald-500/20"
            }`}
          >
            All Categories
          </button>
          {categories.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => handleCategorySelect(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                  : "bg-emerald-500/10 text-slate-300 hover:bg-emerald-500/20 border border-emerald-500/20"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Controls Row: Min Experience & Rating */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-emerald-500/10">
        <div>
          <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            Minimum Experience
          </span>
          <div className="flex gap-2">
            {[3, 5, 8].map((exp) => (
              <button
                key={exp}
                onClick={() => handleExpChange(exp)}
                className={`flex-1 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                  minExperience === exp
                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                    : "bg-dark-bg/40 border-emerald-500/10 text-slate-400 hover:text-slate-200"
                }`}
              >
                {exp}+ Years
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-400" />
            Minimum Rating
          </span>
          <div className="flex gap-2">
            {[4.5, 4.8, 4.9].map((rating) => (
              <button
                key={rating}
                onClick={() => handleRatingChange(rating)}
                className={`flex-1 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                  minRating === rating
                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                    : "bg-dark-bg/40 border-emerald-500/10 text-slate-400 hover:text-slate-200"
                }`}
              >
                ★ {rating}+
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
