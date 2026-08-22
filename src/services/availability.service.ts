import { SessionRepository } from "@/repositories/session.repository";
import { generateSlotsForDate } from "@/lib/slot-generator";
import { db } from "@/lib/db";

export class AvailabilityService {
  static async getAvailableSlots(mentorId: string, dateStr: string, durationMinutes: number = 45) {
    const windows = await SessionRepository.getMentorAvailability(mentorId);

    // Fetch existing sessions on target date
    const targetDate = new Date(`${dateStr}T00:00:00`);
    const nextDay = new Date(targetDate.getTime() + 86400000);

    const existingSessions = await db.mentorshipSession.findMany({
      where: {
        mentorId,
        scheduledStart: { gte: targetDate, lt: nextDay },
        status: { in: ["CONFIRMED", "REQUESTED"] },
      },
      select: {
        scheduledStart: true,
        scheduledEnd: true,
        status: true,
      },
    });

    const slots = generateSlotsForDate(dateStr, windows, existingSessions, durationMinutes);

    return {
      date: dateStr,
      mentorId,
      durationMinutes,
      totalSlots: slots.length,
      availableSlotsCount: slots.filter((s) => s.available).length,
      slots,
    };
  }

  static async addAvailability(mentorId: string, data: { dayOfWeek: number; startTime: string; endTime: string }) {
    return SessionRepository.createAvailability(mentorId, data);
  }
}
