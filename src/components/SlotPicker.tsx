"use client";

import React, { useState, useEffect } from "react";
import { Clock, Calendar as CalendarIcon, AlertCircle, CheckCircle2 } from "lucide-react";

interface SlotItem {
  start: string;
  end: string;
  startTimeISO: string;
  endTimeISO: string;
  available: boolean;
  reason?: string;
}

interface SlotPickerProps {
  mentorId: string;
  onSlotSelected: (slot: { startTimeISO: string; endTimeISO: string; start: string; end: string }) => void;
  selectedSlotISO?: string | null;
}

export function SlotPicker({ mentorId, onSlotSelected, selectedSlotISO }: SlotPickerProps) {
  // Default to tomorrow's date or upcoming Monday
  const getInitialDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  };

  const [dateStr, setDateStr] = useState<string>(getInitialDate());
  const [slots, setSlots] = useState<SlotItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mentorId && dateStr) {
      fetchSlots();
    }
  }, [mentorId, dateStr]);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/sessions/availability?mentorId=${mentorId}&date=${dateStr}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setSlots(data.slots);
      } else {
        setError(data.message || "Failed to load slots");
      }
    } catch (e: any) {
      setError(e.message || "Failed to load available slots");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Date Input */}
      <div>
        <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
          <CalendarIcon className="w-3.5 h-3.5 text-emerald-400" />
          Select Session Date *
        </label>
        <input
          type="date"
          min={new Date().toISOString().split("T")[0]}
          value={dateStr}
          onChange={(e) => setDateStr(e.target.value)}
          className="w-full px-4 py-2.5 text-sm rounded-xl border border-emerald-500/20 bg-dark-bg text-slate-100 focus:outline-none focus:border-emerald-500/60 transition-colors"
        />
      </div>

      {/* Dynamic Slots Grid */}
      <div>
        <span className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-emerald-400" />
          Available Time Slots (45 Mins)
        </span>

        {loading ? (
          <div className="p-6 text-center glass-card rounded-2xl border border-emerald-500/10 text-xs text-slate-400">
            Calculating dynamic slot availability...
          </div>
        ) : error ? (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : slots.length === 0 ? (
          <div className="p-6 text-center glass-card rounded-2xl border border-emerald-500/10 text-xs text-slate-400">
            No availability windows configured for this day. Please select another date.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
            {slots.map((s, idx) => {
              const isSelected = selectedSlotISO === s.startTimeISO;

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={!s.available}
                  onClick={() =>
                    onSlotSelected({
                      startTimeISO: s.startTimeISO,
                      endTimeISO: s.endTimeISO,
                      start: s.start,
                      end: s.end,
                    })
                  }
                  className={`p-2.5 rounded-xl border text-xs font-mono font-bold transition-all text-center flex items-center justify-between ${
                    isSelected
                      ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20"
                      : s.available
                      ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-300 hover:bg-emerald-500/20"
                      : "bg-dark-bg/40 border-emerald-500/10 text-slate-600 cursor-not-allowed opacity-50"
                  }`}
                  title={s.reason || (s.available ? "Available slot" : "Unavailable")}
                >
                  <span>{s.start} - {s.end}</span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-slate-950 shrink-0" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
