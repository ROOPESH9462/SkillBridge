"use client";

import React from "react";
import { MilestoneItem } from "./MilestoneItem";
import { Award, Trash2, ArrowUpRight, Sparkles } from "lucide-react";
import Link from "next/link";

interface GoalCardProps {
  goal: {
    id: string;
    skillId: string;
    skillName: string;
    category: string;
    targetLevel: string;
    isCompleted: boolean;
    totalMilestones: number;
    completedMilestones: number;
    progressPct: number;
    milestones: Array<{
      id: string;
      title: string;
      isCompleted: boolean;
    }>;
  };
  onToggleMilestone: (milestoneId: string) => Promise<void>;
  onDeleteGoal: (goalId: string) => Promise<void>;
}

export function GoalCard({ goal, onToggleMilestone, onDeleteGoal }: GoalCardProps) {
  return (
    <div
      className={`p-6 rounded-3xl glass-card border transition-all duration-300 space-y-5 relative overflow-hidden ${
        goal.isCompleted
          ? "border-emerald-500/50 glow-green"
          : "border-emerald-500/20 hover:border-emerald-500/40"
      }`}
    >
      {/* Top Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-extrabold text-emerald-400 tracking-wider">
              {goal.category}
            </span>
            <span className="text-[10px] text-slate-500">•</span>
            <span className="text-[10px] uppercase font-bold text-slate-400">
              Target: {goal.targetLevel}
            </span>
          </div>

          <h3 className="text-xl font-extrabold text-slate-100 mt-0.5 flex items-center gap-2">
            {goal.skillName}
            {goal.isCompleted && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-extrabold flex items-center gap-1">
                <Sparkles className="w-3 h-3 fill-slate-950" />
                Completed
              </span>
            )}
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-2xl font-black text-emerald-400">{goal.progressPct}%</span>
            <p className="text-[10px] text-slate-400 font-semibold">
              {goal.completedMilestones} / {goal.totalMilestones} Done
            </p>
          </div>

          <button
            onClick={() => onDeleteGoal(goal.id)}
            className="p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
            title="Delete goal"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2.5 rounded-full bg-emerald-950/60 overflow-hidden border border-emerald-500/20">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-300 transition-all duration-500"
          style={{ width: `${goal.progressPct}%` }}
        />
      </div>

      {/* Goal Completed Celebration Banner */}
      {goal.isCompleted && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-200">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <p className="font-bold text-slate-100">🎉 Congratulations! Goal Achieved!</p>
              <p className="text-[11px] text-emerald-400">You have completed all milestones for {goal.skillName}.</p>
            </div>
          </div>
          <Link
            href={`/mentors?skill=${encodeURIComponent(goal.skillName)}`}
            className="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shrink-0 flex items-center gap-1"
          >
            Find Mentors
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Milestones List */}
      <div className="space-y-2.5 pt-2 border-t border-emerald-500/10">
        <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-1">
          <span>Milestone Roadmap</span>
          <span className="text-[10px] text-slate-400 font-normal">Click items to toggle progress</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {goal.milestones.map((m) => (
            <MilestoneItem
              key={m.id}
              id={m.id}
              title={m.title}
              isCompleted={m.isCompleted}
              onToggle={onToggleMilestone}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
