"use client";

import React, { useState, useEffect } from "react";
import { Clock, Calendar as CalendarIcon, AlertCircle, CheckCircle2, Sun, Sunset, Moon, Sparkles } from "lucide-react";

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
  // Generate next 7 days for fast date tabs
  const getUpcomingDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 1; i <= 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
      const monthDay = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      days.push({ dateStr, dayName, monthDay });
    }
    return days;
  };

  const upcomingDays = getUpcomingDays();
  const [dateStr, setDateStr] = useState<string>(upcomingDays[0].dateStr);
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

  // Group slots by Morning (before 12:00), Afternoon (12:00 - 17:00), Evening (after 17:00)
  const getSlotHour = (timeStr: string) => {
    const hour = parseInt(timeStr.split(":")[0]);
    return hour;
  };

  const morningSlots = slots.filter((s) => getSlotHour(s.start) < 12);
  const afternoonSlots = slots.filter((s) => getSlotHour(s.start) >= 12 && getSlotHour(s.start) < 17);
  const eveningSlots = slots.filter((s) => getSlotHour(s.start) >= 17);

  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Local Time";

  return (
    <div className="space-y-5">
      {/* Date Selector Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <CalendarIcon className="w-3.5 h-3.5 text-emerald-400" />
            1. Select Session Date *
          </label>
          <span className="text-[10px] text-emerald-400/90 font-mono font-semibold">
            Timezone: {userTimezone}
          </span>
        </div>

        {/* 1-Click Fast Date Strip */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
          {upcomingDays.map((day) => {
            const isSelected = dateStr === day.dateStr;
            return (
              <button
                key={day.dateStr}
                type="button"
                onClick={() => setDateStr(day.dateStr)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border text-center shrink-0 min-w-[70px] ${
                  isSelected
                    ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20 scale-105"
                    : "bg-emerald-500/10 border-emerald-500/20 text-slate-300 hover:border-emerald-500/40 hover:text-emerald-300"
                }`}
              >
                <span className="block text-[10px] uppercase font-extrabold opacity-80">{day.dayName}</span>
                <span className="block text-xs mt-0.5">{day.monthDay}</span>
              </button>
            );
          })}
        </div>

        {/* Custom Date Input Option */}
        <div className="pt-1">
          <input
            type="date"
            min={new Date().toISOString().split("T")[0]}
            value={dateStr}
            onChange={(e) => setDateStr(e.target.value)}
            className="w-full px-4 py-2 text-xs rounded-xl border border-emerald-500/20 bg-dark-bg text-slate-200 focus:outline-none focus:border-emerald-500/60 transition-colors"
          />
        </div>
      </div>

      {/* Dynamic Slots Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            2. Choose Available Time Slot (45 Mins) *
          </span>
          {slots.filter((s) => s.available).length > 0 && (
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              {slots.filter((s) => s.available).length} slots available
            </span>
          )}
        </div>

        {loading ? (
          <div className="p-6 text-center glass-card rounded-2xl border border-emerald-500/10 text-xs text-slate-400 space-y-2">
            <Sparkles className="w-5 h-5 text-emerald-400 animate-spin mx-auto" />
            <p>Fetching dynamic real-time availability...</p>
          </div>
        ) : error ? (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : slots.length === 0 ? (
          <div className="p-6 text-center glass-card rounded-2xl border border-emerald-500/10 text-xs text-slate-400 space-y-2">
            <p>No availability windows configured for this date.</p>
            <button
              type="button"
              onClick={() => {
                const nextDay = upcomingDays.find((d) => d.dateStr > dateStr);
                if (nextDay) setDateStr(nextDay.dateStr);
              }}
              className="text-xs text-emerald-400 font-bold hover:underline"
            >
              Jump to next available date →
            </button>
          </div>
        ) : (
          <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
            {/* Morning Slots */}
            {morningSlots.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Sun className="w-3 h-3 text-amber-400" /> Morning Sessions
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {morningSlots.map((s, idx) => (
                    <SlotButton
                      key={idx}
                      slot={s}
                      isSelected={selectedSlotISO === s.startTimeISO}
                      onSelect={() =>
                        onSlotSelected({
                          startTimeISO: s.startTimeISO,
                          endTimeISO: s.endTimeISO,
                          start: s.start,
                          end: s.end,
                        })
                      }
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Afternoon Slots */}
            {afternoonSlots.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Sunset className="w-3 h-3 text-amber-500" /> Afternoon Sessions
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {afternoonSlots.map((s, idx) => (
                    <SlotButton
                      key={idx}
                      slot={s}
                      isSelected={selectedSlotISO === s.startTimeISO}
                      onSelect={() =>
                        onSlotSelected({
                          startTimeISO: s.startTimeISO,
                          endTimeISO: s.endTimeISO,
                          start: s.start,
                          end: s.end,
                        })
                      }
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Evening Slots */}
            {eveningSlots.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Moon className="w-3 h-3 text-indigo-400" /> Evening Sessions
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {eveningSlots.map((s, idx) => (
                    <SlotButton
                      key={idx}
                      slot={s}
                      isSelected={selectedSlotISO === s.startTimeISO}
                      onSelect={() =>
                        onSlotSelected({
                          startTimeISO: s.startTimeISO,
                          endTimeISO: s.endTimeISO,
                          start: s.start,
                          end: s.end,
                        })
                      }
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SlotButton({
  slot,
  isSelected,
  onSelect,
}: {
  slot: SlotItem;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      disabled={!slot.available}
      onClick={onSelect}
      className={`p-2.5 rounded-xl border text-xs font-mono font-bold transition-all text-center flex items-center justify-between ${
        isSelected
          ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20 scale-105"
          : slot.available
          ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-300 hover:bg-emerald-500/20"
          : "bg-dark-bg/40 border-emerald-500/10 text-slate-600 cursor-not-allowed opacity-50"
      }`}
      title={slot.reason || (slot.available ? "Available slot" : "Unavailable")}
    >
      <span>{slot.start} - {slot.end}</span>
      {isSelected && <CheckCircle2 className="w-4 h-4 text-slate-950 shrink-0" />}
    </button>
  );
}
