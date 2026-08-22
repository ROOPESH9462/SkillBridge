import { db } from "@/lib/db";
import { isValidTransition } from "@/lib/booking-rules";

export class SessionRepository {
  static async getMentorAvailability(mentorId: string) {
    return db.mentorAvailability.findMany({
      where: { mentorId, isActive: true },
      orderBy: { dayOfWeek: "asc" },
    });
  }

  static async createAvailability(mentorId: string, data: { dayOfWeek: number; startTime: string; endTime: string }) {
    return db.mentorAvailability.create({
      data: {
        mentorId,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        isActive: true,
      },
    });
  }

  static async findOverlappingSessions(mentorId: string, scheduledStart: Date, scheduledEnd: Date) {
    return db.mentorshipSession.findMany({
      where: {
        mentorId,
        status: { in: ["CONFIRMED", "REQUESTED"] },
        scheduledStart: { lt: scheduledEnd },
        scheduledEnd: { gt: scheduledStart },
      },
    });
  }

  static async createBookingTransaction(data: {
    mentorId: string;
    learnerId: string;
    skillId: string;
    scheduledStart: Date;
    scheduledEnd: Date;
    durationMinutes?: number;
    topic: string;
  }) {
    return db.$transaction(async (tx) => {
      // 1. Verify mentor account status & verification
      const mentor = await tx.user.findFirst({
        where: {
          id: data.mentorId,
          role: "MENTOR",
          accountStatus: "ACTIVE",
          mentorProfile: { verificationStatus: "VERIFIED" },
        },
      });

      if (!mentor) {
        throw new Error("Mentor is not available for bookings or not verified.");
      }

      // 2. Verify mentor teaches requested skill
      const userSkill = await tx.userSkill.findFirst({
        where: {
          userId: data.mentorId,
          skillId: data.skillId,
          role: "TEACHING",
        },
      });

      if (!userSkill) {
        throw new Error("Mentor does not teach the requested skill.");
      }

      // 3. Strict Transactional Overlap Check
      const overlaps = await tx.mentorshipSession.findMany({
        where: {
          mentorId: data.mentorId,
          status: { in: ["CONFIRMED", "REQUESTED"] },
          scheduledStart: { lt: data.scheduledEnd },
          scheduledEnd: { gt: data.scheduledStart },
        },
      });

      if (overlaps.length > 0) {
        throw new Error("DOUBLE_BOOKING_CONFLICT: This slot was just reserved by another learner. Please select another time.");
      }

      // 4. Create Session Record
      const session = await tx.mentorshipSession.create({
        data: {
          mentorId: data.mentorId,
          learnerId: data.learnerId,
          skillId: data.skillId,
          scheduledStart: data.scheduledStart,
          scheduledEnd: data.scheduledEnd,
          durationMinutes: data.durationMinutes || 45,
          status: "REQUESTED",
          topic: data.topic,
          meetingLink: `https://meet.skillbridge.dev/session-${data.mentorId.substring(0, 5)}-${data.learnerId.substring(0, 5)}`,
        },
        include: {
          mentor: true,
          learner: true,
          skill: true,
        },
      });

      // 5. Create Notification for Mentor
      await tx.notification.create({
        data: {
          userId: data.mentorId,
          title: "New Mentorship Request 📅",
          message: `${session.learner.name} requested a 45-min session on "${session.topic}".`,
          type: "BOOKING_REQUEST",
        },
      });

      return session;
    });
  }

  static async updateSessionStatus(sessionId: string, nextStatus: string, userId: string) {
    return db.$transaction(async (tx) => {
      const session = await tx.mentorshipSession.findUnique({
        where: { id: sessionId },
        include: { mentor: true, learner: true, skill: true },
      });

      if (!session) throw new Error("Session not found");

      // Verify user is mentor, learner, or admin associated with session
      if (session.mentorId !== userId && session.learnerId !== userId) {
        const user = await tx.user.findUnique({ where: { id: userId } });
        if (user?.role !== "ADMIN") {
          throw new Error("FORBIDDEN: You do not have permission to modify this session.");
        }
      }

      if (!isValidTransition(session.status, nextStatus)) {
        throw new Error(`Invalid status transition from ${session.status} to ${nextStatus}.`);
      }

      const updated = await tx.mentorshipSession.update({
        where: { id: sessionId },
        data: { status: nextStatus },
        include: { mentor: true, learner: true, skill: true },
      });

      // Notify target user of status change
      const targetUserId = session.mentorId === userId ? session.learnerId : session.mentorId;
      const titleMap: Record<string, string> = {
        CONFIRMED: "Session Request Approved! ✅",
        CANCELLED: "Session Cancelled ❌",
        COMPLETED: "Session Completed 🎓",
        NO_SHOW: "Session Marked as No-Show ⚠️",
      };

      const typeMap: Record<string, any> = {
        CONFIRMED: "BOOKING_APPROVED",
        CANCELLED: "BOOKING_CANCELLED",
        COMPLETED: "SESSION_COMPLETED",
        NO_SHOW: "BOOKING_CANCELLED",
      };

      await tx.notification.create({
        data: {
          userId: targetUserId,
          title: titleMap[nextStatus] || "Session Updated",
          message: `The session for "${session.topic}" status has been updated to ${nextStatus}.`,
          type: typeMap[nextStatus] || "BOOKING_REQUEST",
        },
      });

      return updated;
    });
  }

  static async findUserSessions(userId: string) {
    return db.mentorshipSession.findMany({
      where: {
        OR: [{ mentorId: userId }, { learnerId: userId }],
      },
      include: {
        mentor: { include: { mentorProfile: true } },
        learner: true,
        skill: true,
        review: true,
      },
      orderBy: { scheduledStart: "desc" },
    });
  }
}
