"use client";

import React, { useState, useEffect } from "react";
import { GoalCard } from "./GoalCard";
import { GoalCreationModal } from "./GoalCreationModal";
import { Target, AlertCircle } from "lucide-react";

interface GoalItem {
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
}

export function GoalList() {
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/skills/goals");
      const data = await res.json();
      if (res.ok && data.success) {
        setGoals(data.goals);
      } else {
        setError(data.message || "Failed to load skill goals");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load skill goals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleToggleMilestone = async (milestoneId: string) => {
    try {
      const res = await fetch(`/api/skills/milestones/${milestoneId}`, {
        method: "PATCH",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update milestone status");
      }
      await fetchGoals();
    } catch (err: any) {
      alert(err.message || "Milestone update failed");
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm("Are you sure you want to delete this skill goal and its milestone roadmap?")) return;

    try {
      const res = await fetch(`/api/skills/goals/${goalId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete skill goal");
      }
      await fetchGoals();
    } catch (err: any) {
      alert(err.message || "Failed to delete goal");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-400" />
            Active Learning Goals & Milestone Roadmaps ({goals.length})
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Progress updates automatically as you complete structured skill milestones
          </p>
        </div>

        <GoalCreationModal onGoalCreated={fetchGoals} />
      </div>

      {loading ? (
        <div className="p-8 text-center glass-card rounded-2xl border border-emerald-500/10 text-xs text-slate-400">
          Loading learning goals...
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      ) : goals.length === 0 ? (
        <div className="p-8 text-center glass-card rounded-2xl border border-emerald-500/10 space-y-3">
          <p className="text-sm font-bold text-slate-200">No active learning goals defined yet.</p>
          <p className="text-xs text-slate-400">
            Set a new skill goal to generate an interactive milestone roadmap and track your progress!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onToggleMilestone={handleToggleMilestone}
              onDeleteGoal={handleDeleteGoal}
            />
          ))}
        </div>
      )}
    </div>
  );
}
