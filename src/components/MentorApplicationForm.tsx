"use client";

import React, { useState } from "react";
import { UserCheck, Briefcase, BookOpen, Link as LinkIcon, Send, AlertCircle, CheckCircle2 } from "lucide-react";

export function MentorApplicationForm() {
  const [professionalTitle, setProfessionalTitle] = useState("");
  const [yearsExperience, setYearsExperience] = useState<number>(3);
  const [skills, setSkills] = useState("");
  const [bio, setBio] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [reasonForMentoring, setReasonForMentoring] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/mentors/application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          professionalTitle,
          yearsExperience: Number(yearsExperience),
          skills,
          bio,
          portfolioUrl: portfolioUrl || undefined,
          linkedinUrl: linkedinUrl || undefined,
          reasonForMentoring,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to submit mentor application");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Application submission failed");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="p-8 rounded-3xl glass-card border border-emerald-500/30 text-center space-y-4 glow-green">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-100">Application Submitted!</h2>
        <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
          Your application to become a verified mentor has been received. Our admin team will review your credentials and notify you upon approval!
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 rounded-3xl glass-card border border-emerald-500/20 shadow-2xl space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-emerald-500/10">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <UserCheck className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-100">Apply to Become a Mentor</h2>
          <p className="text-xs text-slate-400">Share your technical expertise and guide junior developers</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Professional Title & Experience */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Professional Title *
            </label>
            <input
              type="text"
              required
              value={professionalTitle}
              onChange={(e) => setProfessionalTitle(e.target.value)}
              placeholder="e.g. Senior Machine Learning Engineer"
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-emerald-500/20 bg-dark-bg/60 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/60 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Years Experience *
            </label>
            <input
              type="number"
              min={1}
              max={40}
              required
              value={yearsExperience}
              onChange={(e) => setYearsExperience(parseInt(e.target.value))}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-emerald-500/20 bg-dark-bg/60 text-slate-100 focus:outline-none focus:border-emerald-500/60 transition-colors"
            />
          </div>
        </div>

        {/* Teaching Skills */}
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
            Teaching Skills & Technologies *
          </label>
          <input
            type="text"
            required
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="e.g. Next.js, React, System Design, TypeScript"
            className="w-full px-4 py-2.5 text-sm rounded-xl border border-emerald-500/20 bg-dark-bg/60 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/60 transition-colors"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
            Professional Biography *
          </label>
          <textarea
            required
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Describe your technical background, projects built, and mentoring methodology (minimum 20 characters)..."
            className="w-full px-4 py-2.5 text-sm rounded-xl border border-emerald-500/20 bg-dark-bg/60 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/60 transition-colors"
          />
        </div>

        {/* Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              LinkedIn Profile URL
            </label>
            <input
              type="url"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="https://linkedin.com/in/yourname"
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-emerald-500/20 bg-dark-bg/60 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/60 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Portfolio / GitHub URL
            </label>
            <input
              type="url"
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
              placeholder="https://github.com/yourusername"
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-emerald-500/20 bg-dark-bg/60 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/60 transition-colors"
            />
          </div>
        </div>

        {/* Reason */}
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
            Why do you want to mentor on SkillBridge? *
          </label>
          <textarea
            required
            rows={2}
            value={reasonForMentoring}
            onChange={(e) => setReasonForMentoring(e.target.value)}
            placeholder="Share your motivation for mentoring..."
            className="w-full px-4 py-2.5 text-sm rounded-xl border border-emerald-500/20 bg-dark-bg/60 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/60 transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit Application"}
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
