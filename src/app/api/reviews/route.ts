import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/session";
import { ReviewService } from "@/services/review.service";

export async function POST(req: Request) {
  try {
    const user = await requireAuth();

    // Check that user is a LEARNER (or ADMIN)
    if (user.role !== "LEARNER" && user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Only participating learners can submit session reviews." },
        { status: 403 }
      );
    }

    const body = await req.json();

    const review = await ReviewService.submitReview(user.userId, body);

    return NextResponse.json({
      success: true,
      message: "Verified session review submitted successfully!",
      review,
    });
  } catch (error: any) {
    const isForbidden = error.message.includes("FORBIDDEN");
    const status = isForbidden
      ? 403
      : error.message === "UNAUTHORIZED"
      ? 401
      : 400;

    return NextResponse.json(
      { success: false, message: error.message || "Failed to submit review" },
      { status }
    );
  }
}
