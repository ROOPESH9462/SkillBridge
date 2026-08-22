"use client";

import React, { useState, useEffect } from "react";
import { Plus, Target, X, Check, AlertCircle } from "lucide-react";

interface SkillItem {
  id: string;
  name: string;
  category: string;
  description?: string | null;
}

interface GoalCreationModalProps {
  onGoalCreated: () => void;
}

export function GoalCreationModal({ onGoalCreated }: GoalCreationModalProps) {
  const [open, setOpen] = useState(false);
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [selectedSkillId, setSelectedSkillId] = useState("");
  const [targetLevel, setTargetLevel] = useState<"BEGINNER" | "INTERMEDIATE" | "EXPERT">("EXPERT");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetch("/api/skills")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.skills) {
            setSkills(data.skills);
            if (data.skills.length > 0) {
              setSelectedSkillId(data.skills[0].id);
            }
          }
        })
        .catch(() => {});
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedSkillId) {
      setError("Please select a target skill.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/skills/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skillId: selectedSkillId,
          targetLevel,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to create skill goal.");
      }

      setOpen(false);
      onGoalCreated();
    } catch (err: any) {
      setError(err.message || "Failed to create skill goal.");
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
        <Plus className="w-4 h-4" />
        Set New Skill Goal
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg p-6 rounded-3xl glass-card border border-emerald-500/30 shadow-2xl space-y-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-emerald-500/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Target className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-slate-100">Set New Learning Goal</h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Skill Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Target Skill Taxonomy *
                </label>
                <select
                  value={selectedSkillId}
                  onChange={(e) => setSelectedSkillId(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-emerald-500/20 bg-dark-bg text-slate-100 focus:outline-none focus:border-emerald-500/60 transition-colors"
                >
                  {skills.map((s) => (
                    <option key={s.id} value={s.id} className="bg-dark-bg text-slate-100">
                      {s.name} ({s.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Level */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Target Proficiency Level *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["BEGINNER", "INTERMEDIATE", "EXPERT"] as const).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setTargetLevel(level)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                        targetLevel === level
                          ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                          : "bg-dark-bg/40 border-emerald-500/10 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/15 text-[11px] text-slate-400">
                💡 SkillBridge automatically generates a skill-specific milestone roadmap tailored to {skills.find((s) => s.id === selectedSkillId)?.name || "your target skill"}.
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-emerald-500/10">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create Goal & Milestones"}
                  <Check className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
