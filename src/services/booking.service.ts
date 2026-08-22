import { SessionRepository } from "@/repositories/session.repository";
import { bookingSchema } from "@/lib/validation";
import { validateSessionDuration } from "@/lib/booking-rules";
import { z } from "zod";

export class BookingService {
  static async createBooking(learnerId: string, input: z.infer<typeof bookingSchema>) {
    const validated = bookingSchema.parse(input);

    const start = new Date(validated.scheduledStart);
    const end = new Date(validated.scheduledEnd);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error("Invalid scheduled date format.");
    }

    if (start < new Date()) {
      throw new Error("Cannot book sessions in the past.");
    }

    if (!validateSessionDuration(start, end, 45)) {
      throw new Error("Invalid session duration. Standard mentorship session duration must be 45 minutes.");
    }

    return SessionRepository.createBookingTransaction({
      mentorId: validated.mentorId,
      learnerId,
      skillId: validated.skillId,
      scheduledStart: start,
      scheduledEnd: end,
      durationMinutes: 45,
      topic: validated.topic,
    });
  }

  static async updateStatus(userId: string, sessionId: string, nextStatus: string) {
    return SessionRepository.updateSessionStatus(sessionId, nextStatus, userId);
  }

  static async getUserSessions(userId: string) {
    return SessionRepository.findUserSessions(userId);
  }
}
