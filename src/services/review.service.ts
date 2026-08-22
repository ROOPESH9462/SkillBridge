import { ReviewRepository } from "@/repositories/review.repository";
import { reviewSchema } from "@/lib/validation";
import { z } from "zod";

export class ReviewService {
  static async submitReview(learnerId: string, input: z.infer<typeof reviewSchema>) {
    const validated = reviewSchema.parse(input);

    return ReviewRepository.createVerifiedReview({
      sessionId: validated.sessionId,
      learnerId,
      rating: validated.rating,
      comment: validated.comment,
    });
  }
}
