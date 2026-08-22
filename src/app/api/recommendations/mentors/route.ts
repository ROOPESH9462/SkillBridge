import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/session";
import { RecommendationService } from "@/services/recommendation.service";

export async function GET() {
  try {
    const user = await requireAuth();
    const recommendations = await RecommendationService.getRecommendedMentors(user.userId);

    return NextResponse.json({
      success: true,
      count: recommendations.length,
      recommendations,
    });
  } catch (error: any) {
    const status = error.message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json(
      { success: false, message: error.message || "Failed to generate recommendations" },
      { status }
    );
  }
}
