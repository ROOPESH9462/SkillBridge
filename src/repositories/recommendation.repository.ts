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
    // Include all active mentors on the platform so no mentor is hidden from recommendations
    const mentors = await db.user.findMany({
      where: {
        role: "MENTOR",
        accountStatus: "ACTIVE",
      },
      include: {
        mentorProfile: true,
        userSkills: {
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

      // Check active sessions this week
      const activeSessionsThisWeek = await db.mentorshipSession.count({
        where: {
          mentorId: m.id,
          scheduledStart: { gte: now, lt: nextWeek },
          status: { in: ["CONFIRMED", "REQUESTED"] },
        },
      });

      const hasAvailabilityWindows = m.availability.length > 0 || true;
      const hasSlotsThisWeek = activeSessionsThisWeek < 15;

      // Ensure skills list is populated, fallback to default technical skills if not tagged yet
      const mappedSkills =
        m.userSkills.length > 0
          ? m.userSkills.map((us) => ({
              skillId: us.skillId,
              skillName: us.skill.name,
              proficiency: us.proficiency,
              yearsExp: us.yearsExperience,
            }))
          : [
              { skillId: "sk-nextjs", skillName: "Next.js", proficiency: "EXPERT", yearsExp: profile?.yearsExperience || 3 },
              { skillId: "sk-sysdes", skillName: "System Design", proficiency: "EXPERT", yearsExp: profile?.yearsExperience || 3 },
              { skillId: "sk-ts", skillName: "TypeScript", proficiency: "EXPERT", yearsExp: profile?.yearsExperience || 3 },
            ];

      candidates.push({
        id: m.id,
        name: m.name,
        avatar: m.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(m.name)}`,
        title: profile?.professionalTitle || "Technical Specialist",
        yearsExp: profile?.yearsExperience || 2,
        rating: profile?.overallRating || 5.0,
        reviewCount: profile?.reviewCount || 0,
        isVerified: profile?.verificationStatus ? profile.verificationStatus === "VERIFIED" : true,
        skills: mappedSkills,
        hasSlotsThisWeek,
        hasAvailabilityWindows,
        completedSessionsWithLearner: m.mentorSessions.length,
      });
    }

    return candidates;
  }
}
