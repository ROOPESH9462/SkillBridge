import { db } from "@/lib/db";

export class ReviewRepository {
  static async createVerifiedReview(data: {
    sessionId: string;
    learnerId: string;
    rating: number; // 1-5
    comment: string;
  }) {
    return db.$transaction(async (tx) => {
      // 1. Verify session exists
      const session = await tx.mentorshipSession.findUnique({
        where: { id: data.sessionId },
        include: { review: true, mentor: true, learner: true },
      });

      if (!session) {
        throw new Error("Mentorship session not found.");
      }

      // 2. Strict Ownership Authorization: learner must participate in session
      if (session.learnerId !== data.learnerId) {
        throw new Error("FORBIDDEN: Only the participating learner can submit a review for this session.");
      }

      // 3. Strict State Verification: session must be COMPLETED
      if (session.status !== "COMPLETED") {
        throw new Error("FORBIDDEN: Reviews can only be submitted for completed sessions.");
      }

      // 4. Duplicate Review Prevention
      if (session.review) {
        throw new Error("A verified review has already been submitted for this session.");
      }

      // 5. Create Review Record using targetUserId
      const review = await tx.review.create({
        data: {
          sessionId: data.sessionId,
          authorId: data.learnerId,
          targetUserId: session.mentorId,
          rating: data.rating,
          comment: data.comment,
        },
      });

      // 6. Recalculate Mentor Overall Rating & Review Count
      const allMentorReviews = await tx.review.findMany({
        where: { targetUserId: session.mentorId },
      });

      const reviewCount = allMentorReviews.length;
      const totalRating = allMentorReviews.reduce((sum, r) => sum + r.rating, 0);
      const overallRating = reviewCount > 0 ? Number((totalRating / reviewCount).toFixed(2)) : 5.0;

      await tx.mentorProfile.update({
        where: { userId: session.mentorId },
        data: {
          overallRating,
          reviewCount,
        },
      });

      // 7. Emit Notification to Mentor
      await tx.notification.create({
        data: {
          userId: session.mentorId,
          title: "New Verified Review Received! ⭐",
          message: `${session.learner.name} rated your session ${data.rating}.0 stars: "${data.comment}"`,
          type: "REVIEW_REMINDER",
        },
      });

      return review;
    });
  }
}
