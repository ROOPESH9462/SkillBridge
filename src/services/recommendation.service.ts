import { RecommendationRepository } from "@/repositories/recommendation.repository";
import { calculateMentorMatchScore, RecommendationResult } from "@/lib/recommendation-engine";

export class RecommendationService {
  static async getRecommendedMentors(learnerId: string): Promise<RecommendationResult[]> {
    const learnerGoals = await RecommendationRepository.getLearnerGoals(learnerId);
    const mentorCandidates = await RecommendationRepository.getMentorCandidates(learnerId);

    const scoredMentors = mentorCandidates.map((mentor) =>
      calculateMentorMatchScore(learnerGoals, mentor)
    );

    // Sort descending: highest match score first
    return scoredMentors.sort((a, b) => b.score - a.score);
  }
}
