"use client";

import React, { useState } from "react";
import { CheckCircle2, Clock } from "lucide-react";

interface MilestoneItemProps {
  id: string;
  title: string;
  isCompleted: boolean;
  onToggle: (id: string) => Promise<void>;
}

export function MilestoneItem({ id, title, isCompleted, onToggle }: MilestoneItemProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    try {
      setLoading(true);
      await onToggle(id);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`w-full p-3 rounded-xl border text-xs font-medium transition-all text-left flex items-center justify-between group ${
        isCompleted
          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/15"
          : "bg-dark-bg/40 border-emerald-500/10 text-slate-300 hover:border-emerald-500/30 hover:bg-emerald-500/5"
      } disabled:opacity-50`}
    >
      <span className="truncate pr-2 group-hover:text-slate-100">{title}</span>
      {isCompleted ? (
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
      ) : (
        <Clock className="w-4 h-4 text-slate-500 group-hover:text-emerald-400/70 shrink-0 transition-colors" />
      )}
    </button>
  );
}
