import { db } from "@/lib/db";
import { LearnerGoalData, MentorCandidateData } from "@/lib/recommendation-engine";

export class RecommendationRepository {
  static async getLearnerGoals(learnerId: string): Promise<LearnerGoalData[]> {
    const goals = await db.learnerSkillGoal.findMany({
      where: { userId: learnerId },
      include: {
        skill: true,
        milestones: true,
      },
    });

    return goals.map((g) => {
      const total = g.milestones.length;
      const completed = g.milestones.filter((m) => m.isCompleted).length;
      const progressPct = total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        skillId: g.skillId,
        skillName: g.skill.name,
        targetLevel: g.targetLevel,
        progressPct,
      };
    });
  }

  static async getMentorCandidates(learnerId: string): Promise<MentorCandidateData[]> {
    // Exclude unverified or suspended mentor accounts
    const mentors = await db.user.findMany({
      where: {
        role: "MENTOR",
        accountStatus: "ACTIVE",
        mentorProfile: {
          verificationStatus: "VERIFIED",
        },
      },
      include: {
        mentorProfile: true,
        userSkills: {
          where: { role: "TEACHING" },
          include: { skill: true },
        },
        availability: {
          where: { isActive: true },
        },
        mentorSessions: {
          where: { learnerId, status: "COMPLETED" },
        },
      },
    });

    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 86400000);

    const candidates: MentorCandidateData[] = [];

    for (const m of mentors) {
      const profile = m.mentorProfile;

      // Check if mentor has sessions or slots available this week
      const activeSessionsThisWeek = await db.mentorshipSession.count({
        where: {
          mentorId: m.id,
          scheduledStart: { gte: now, lt: nextWeek },
          status: { in: ["CONFIRMED", "REQUESTED"] },
        },
      });

      const hasAvailabilityWindows = m.availability.length > 0;
      // If availability windows exist and active sessions < max capacity, mentor has slots this week
      const hasSlotsThisWeek = hasAvailabilityWindows && activeSessionsThisWeek < 15;

      candidates.push({
        id: m.id,
        name: m.name,
        avatar: m.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(m.name)}`,
        title: profile?.professionalTitle || "Technical Mentor",
        yearsExp: profile?.yearsExperience || 1,
        rating: profile?.overallRating || 5.0,
        reviewCount: profile?.reviewCount || 0,
        isVerified: profile?.verificationStatus === "VERIFIED",
        skills: m.userSkills.map((us) => ({
          skillId: us.skillId,
          skillName: us.skill.name,
          proficiency: us.proficiency,
          yearsExp: us.yearsExperience,
        })),
        hasSlotsThisWeek,
        hasAvailabilityWindows,
        completedSessionsWithLearner: m.mentorSessions.length,
      });
    }

    return candidates;
  }
}
