export interface TimeSlot {
  start: string; // "10:00"
  end: string;   // "10:45"
  startTimeISO: string; // Full ISO string
  endTimeISO: string;   // Full ISO string
  available: boolean;
  reason?: string;
}

export function generateSlotsForDate(
  dateStr: string, // "YYYY-MM-DD"
  windows: Array<{ dayOfWeek: number; startTime: string; endTime: string; isActive: boolean }>,
  existingSessions: Array<{ scheduledStart: Date; scheduledEnd: Date; status: string }>,
  durationMinutes: number = 45
): TimeSlot[] {
  const targetDate = new Date(`${dateStr}T00:00:00`);
  if (isNaN(targetDate.getTime())) return [];

  const dayOfWeek = targetDate.getDay(); // 0 (Sun) to 6 (Sat)
  const matchingWindows = windows.filter((w) => w.isActive && w.dayOfWeek === dayOfWeek);

  if (matchingWindows.length === 0) return [];

  const slots: TimeSlot[] = [];
  const now = new Date();

  for (const window of matchingWindows) {
    const [startH, startM] = window.startTime.split(":").map(Number);
    const [endH, endM] = window.endTime.split(":").map(Number);

    let windowStart = new Date(targetDate);
    windowStart.setHours(startH, startM, 0, 0);

    let windowEnd = new Date(targetDate);
    windowEnd.setHours(endH, endM, 0, 0);

    let current = new Date(windowStart);

    while (current.getTime() + durationMinutes * 60000 <= windowEnd.getTime()) {
      const slotStart = new Date(current);
      const slotEnd = new Date(current.getTime() + durationMinutes * 60000);

      const startFormatted = slotStart.toTimeString().substring(0, 5);
      const endFormatted = slotEnd.toTimeString().substring(0, 5);

      // Check if slot is in the past
      const isPast = slotStart.getTime() < now.getTime();

      // Check overlap with existing non-cancelled sessions
      const hasConflict = existingSessions.some((s) => {
        if (s.status === "CANCELLED") return false;
        return s.scheduledStart < slotEnd && s.scheduledEnd > slotStart;
      });

      let available = true;
      let reason: string | undefined = undefined;

      if (isPast) {
        available = false;
        reason = "Past time slot";
      } else if (hasConflict) {
        available = false;
        reason = "Slot already booked";
      }

      slots.push({
        start: startFormatted,
        end: endFormatted,
        startTimeISO: slotStart.toISOString(),
        endTimeISO: slotEnd.toISOString(),
        available,
        reason,
      });

      // Advance by duration
      current = new Date(current.getTime() + durationMinutes * 60000);
    }
  }

  return slots;
}
