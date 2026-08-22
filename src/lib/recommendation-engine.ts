export interface LearnerGoalData {
  skillId: string;
  skillName: string;
  targetLevel: string; // "BEGINNER" | "INTERMEDIATE" | "EXPERT"
  progressPct: number;
}

export interface MentorCandidateData {
  id: string;
  name: string;
  avatar: string;
  title: string;
  yearsExp: number;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  skills: Array<{
    skillId: string;
    skillName: string;
    proficiency: string;
    yearsExp: number;
  }>;
  hasSlotsThisWeek: boolean;
  hasAvailabilityWindows: boolean;
  completedSessionsWithLearner: number;
}

export interface RecommendationResult {
  mentorId: string;
  name: string;
  avatar: string;
  title: string;
  yearsExp: number;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  score: number; // 0 - 100
  breakdown: {
    skillMatch: number;
    proficiencyGap: number;
    experience: number;
    rating: number;
    availability: number;
    history: number;
  };
  reasons: string[];
  skills: Array<{ name: string; proficiency: string; yearsExp: number }>;
}

const PROFICIENCY_NUM: Record<string, number> = {
  BEGINNER: 1,
  INTERMEDIATE: 2,
  EXPERT: 3,
};

export function calculateMentorMatchScore(
  learnerGoals: LearnerGoalData[],
  mentor: MentorCandidateData
): RecommendationResult {
  const reasons: string[] = [];

  // 1. Skill Match Score (50%)
  let skillMatchScore = 50; // default baseline if learner has no goals defined
  const matchedSkillNames: string[] = [];

  if (learnerGoals.length > 0) {
    const goalSkillIds = new Set(learnerGoals.map((g) => g.skillId));
    const mentorSkillMap = new Map(mentor.skills.map((s) => [s.skillId, s]));

    let matches = 0;
    let expertMatches = 0;

    for (const goal of learnerGoals) {
      const mentorSkill = mentorSkillMap.get(goal.skillId);
      if (mentorSkill) {
        matches++;
        matchedSkillNames.push(mentorSkill.skillName);
        if (mentorSkill.proficiency === "EXPERT") {
          expertMatches++;
        }
      }
    }

    const matchRatio = matches / learnerGoals.length;
    const expertBonus = (expertMatches / learnerGoals.length) * 15;
    skillMatchScore = Math.min(100, Math.round(matchRatio * 85 + expertBonus));

    if (matchedSkillNames.length > 0) {
      reasons.push(`Teaches your target skill${matchedSkillNames.length > 1 ? "s" : ""}: ${matchedSkillNames.join(", ")}`);
    } else {
      reasons.push("Offers adjacent technical capabilities in software architecture");
    }
  } else {
    reasons.push("Versatile technical mentor with verified industry skills");
  }

  // 2. Proficiency Gap Score (15%)
  let proficiencyGapScore = 75;
  if (learnerGoals.length > 0 && matchedSkillNames.length > 0) {
    const mentorSkillMap = new Map(mentor.skills.map((s) => [s.skillId, s]));
    let totalProfScore = 0;
    let count = 0;

    for (const goal of learnerGoals) {
      const mentorSkill = mentorSkillMap.get(goal.skillId);
      if (mentorSkill) {
        count++;
        const targetNum = PROFICIENCY_NUM[goal.targetLevel] || 3;
        const mentorNum = PROFICIENCY_NUM[mentorSkill.proficiency] || 2;

        if (mentorNum >= targetNum) {
          totalProfScore += 100;
        } else if (mentorNum === targetNum - 1) {
          totalProfScore += 75;
        } else {
          totalProfScore += 45;
        }
      }
    }

    proficiencyGapScore = count > 0 ? Math.round(totalProfScore / count) : 75;
    if (proficiencyGapScore >= 90) {
      reasons.push(`Expert-level mastery matches your target learning depth`);
    }
  }

  // 3. Experience Score (10%)
  const expScore = Math.min(100, Math.round((mentor.yearsExp / 10) * 100));
  reasons.push(`${mentor.yearsExp} years of verified industry experience`);

  // 4. Rating Score (10%)
  const ratingScore = Math.min(100, Math.round((mentor.rating / 5.0) * 100));
  if (mentor.rating >= 4.5) {
    reasons.push(`${mentor.rating.toFixed(1)} ⭐ average rating across ${mentor.reviewCount} reviews`);
  }

  // 5. Availability Score (10%)
  let availabilityScore = 0;
  if (mentor.hasSlotsThisWeek) {
    availabilityScore = 100;
    reasons.push("Has bookable 45-minute slots available this week");
  } else if (mentor.hasAvailabilityWindows) {
    availabilityScore = 70;
    reasons.push("Recurring weekly availability configured");
  } else {
    availabilityScore = 30;
  }

  // 6. History Score (5%)
  let historyScore = 50; // neutral default for new connections
  if (mentor.completedSessionsWithLearner >= 2) {
    historyScore = 100;
    reasons.push(`Previously completed ${mentor.completedSessionsWithLearner} successful sessions with you`);
  } else if (mentor.completedSessionsWithLearner === 1) {
    historyScore = 75;
    reasons.push("Previously completed 1 session with you");
  }

  // Calculate Weighted Final Score
  const finalScore = Math.round(
    skillMatchScore * 0.5 +
      proficiencyGapScore * 0.15 +
      expScore * 0.1 +
      ratingScore * 0.1 +
      availabilityScore * 0.1 +
      historyScore * 0.05
  );

  return {
    mentorId: mentor.id,
    name: mentor.name,
    avatar: mentor.avatar,
    title: mentor.title,
    yearsExp: mentor.yearsExp,
    rating: mentor.rating,
    reviewCount: mentor.reviewCount,
    isVerified: mentor.isVerified,
    score: Math.min(99, Math.max(45, finalScore)), // Bound between 45% and 99%
    breakdown: {
      skillMatch: skillMatchScore,
      proficiencyGap: proficiencyGapScore,
      experience: expScore,
      rating: ratingScore,
      availability: availabilityScore,
      history: historyScore,
    },
    reasons: reasons.slice(0, 4), // Top 4 human readable reasons
    skills: mentor.skills.map((s) => ({
      name: s.skillName,
      proficiency: s.proficiency,
      yearsExp: s.yearsExp,
    })),
  };
}
