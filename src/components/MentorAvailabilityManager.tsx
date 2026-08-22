"use client";

import React, { useState } from "react";
import { Calendar, Plus, Trash2, Clock, Check } from "lucide-react";

interface AvailabilityItem {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface MentorAvailabilityManagerProps {
  initialAvailability: AvailabilityItem[];
}

export function MentorAvailabilityManager({ initialAvailability }: MentorAvailabilityManagerProps) {
  const [availability, setAvailability] = useState<AvailabilityItem[]>(initialAvailability);
  const [dayOfWeek, setDayOfWeek] = useState<number>(1); // Monday
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("14:00");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (startTime >= endTime) {
      setError("Start time must be earlier than end time.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/sessions/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dayOfWeek: Number(dayOfWeek),
          startTime,
          endTime,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to add availability window.");
      }

      setAvailability((prev) => [...prev, data.availability]);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to add availability");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 rounded-3xl glass-card border border-emerald-500/20 space-y-6">
      <div className="flex items-center justify-between border-b border-emerald-500/10 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            Recurring Weekly Availability Windows
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            SkillBridge uses these windows to dynamically generate bookable 45-minute slots for learners
          </p>
        </div>
      </div>

      {/* Availability List */}
      <div className="space-y-2">
        {availability.length === 0 ? (
          <div className="p-4 text-center rounded-xl bg-dark-bg/40 text-xs text-slate-400">
            No recurring availability configured yet. Add your first weekly window below!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {availability.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-bold text-slate-100">{DAYS[item.dayOfWeek]}s</span>
                  <span className="block text-xs font-mono font-bold text-emerald-400">
                    {item.startTime} – {item.endTime}
                  </span>
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-400 glow-green-sm" title="Active Window" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add New Window Form */}
      <form onSubmit={handleAdd} className="p-4 rounded-2xl bg-dark-bg/40 border border-emerald-500/10 space-y-4">
        <span className="text-xs font-bold uppercase text-slate-300 tracking-wider block">
          Add New Recurring Availability Window
        </span>

        {error && <div className="text-xs text-rose-400 font-semibold">{error}</div>}
        {success && <div className="text-xs text-emerald-400 font-semibold">✓ Window added successfully!</div>}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-1">Day of Week</label>
            <select
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs rounded-xl border border-emerald-500/20 bg-dark-bg text-slate-100 focus:outline-none focus:border-emerald-500/60"
            >
              {DAYS.map((day, idx) => (
                <option key={idx} value={idx} className="bg-dark-bg text-slate-100">
                  {day}s
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-1">Start Time</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-emerald-500/20 bg-dark-bg text-slate-100 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-1">End Time</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-emerald-500/20 bg-dark-bg text-slate-100 focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center gap-1.5 disabled:opacity-50"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Availability Window
        </button>
      </form>
    </div>
  );
}
