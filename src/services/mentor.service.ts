import { MentorRepository, MentorFilterParams } from "@/repositories/mentor.repository";
import { mentorApplicationSchema } from "@/lib/validation";
import { z } from "zod";

export class MentorService {
  static async getPublicMentors(filters: MentorFilterParams = {}) {
    const rawMentors = await MentorRepository.findVerifiedMentors(filters);

    return rawMentors.map((m) => {
      const profile = m.mentorProfile;
      return {
        id: m.id,
        name: m.name,
        avatar: m.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(m.name)}`,
        title: profile?.professionalTitle || "Technical Specialist",
        yearsExp: profile?.yearsExperience || 1,
        bio: profile?.bio || "Experienced technical mentor.",
        rating: profile?.overallRating || 5.0,
        reviewCount: profile?.reviewCount || 0,
        isVerified: profile?.verificationStatus === "VERIFIED",
        githubUrl: profile?.githubUrl,
        linkedinUrl: profile?.linkedinUrl,
        portfolioUrl: profile?.portfolioUrl,
        skills: m.userSkills.map((us) => ({
          name: us.skill.name,
          category: us.skill.category,
          proficiency: us.proficiency,
          yearsExp: us.yearsExperience,
        })),
        recentReviews: m.reviewsReceived.map((r) => ({
          id: r.id,
          rating: r.rating,
          comment: r.comment,
          authorName: r.author.name,
          createdAt: r.createdAt.toISOString(),
        })),
      };
    });
  }

  static async getMentorDetails(id: string) {
    const mentor = await MentorRepository.findMentorById(id);
    if (!mentor) return null;

    const profile = mentor.mentorProfile;
    return {
      id: mentor.id,
      name: mentor.name,
      avatar: mentor.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(mentor.name)}`,
      title: profile?.professionalTitle || "Technical Specialist",
      yearsExp: profile?.yearsExperience || 1,
      bio: profile?.bio || "Experienced technical mentor.",
      rating: profile?.overallRating || 5.0,
      reviewCount: profile?.reviewCount || 0,
      isVerified: profile?.verificationStatus === "VERIFIED",
      githubUrl: profile?.githubUrl,
      linkedinUrl: profile?.linkedinUrl,
      portfolioUrl: profile?.portfolioUrl,
      skills: mentor.userSkills.map((us) => ({
        id: us.skill.id,
        name: us.skill.name,
        category: us.skill.category,
        proficiency: us.proficiency,
        yearsExp: us.yearsExperience,
      })),
      availability: mentor.availability.map((a) => ({
        id: a.id,
        dayOfWeek: a.dayOfWeek,
        startTime: a.startTime,
        endTime: a.endTime,
      })),
      reviews: mentor.reviewsReceived.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        authorName: r.author.name,
        authorAvatar: r.author.avatar,
        topic: r.session.skill.name,
        createdAt: r.createdAt.toISOString(),
      })),
    };
  }

  static async submitApplication(userId: string, input: z.infer<typeof mentorApplicationSchema>) {
    const validated = mentorApplicationSchema.parse(input);

    const existingPending = await MentorRepository.findPendingApplicationByUserId(userId);
    if (existingPending) {
      throw new Error("You already have an active mentor application pending review.");
    }

    return MentorRepository.createApplication({
      userId,
      ...validated,
    });
  }

  static async getUserApplication(userId: string) {
    return MentorRepository.findPendingApplicationByUserId(userId);
  }
}
